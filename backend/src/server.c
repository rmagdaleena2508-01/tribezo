/*
 * A small HTTP server for Tribezo.
 *
 * It lets the website send English to the C program and get XYZ back.
 *
 *   GET  /api/health    answers {"ok":true} so you can check the server is on
 *   POST /api/reverse   send English as plain text, get XYZ back as JSON
 *
 * It only listens on this computer (127.0.0.1), so nobody else on the
 * network can reach it. It handles one request at a time, which is
 * plenty for one person using the website.
 *
 * Run with: make run
 * Pick a different port with: PORT=9000 make run
 */

#include "reverse.h"

#include <arpa/inet.h>
#include <ctype.h>
#include <errno.h>
#include <netinet/in.h>
#include <signal.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <unistd.h>

#define DEFAULT_PORT 8765
#define MAX_HEADERS (8 * 1024) /* the request line and headers */
#define MAX_BODY (10 * 1024)   /* the text to reverse: 10 KB */
#define TIMEOUT_SECONDS 5      /* give up on clients that are too slow */

/* ---------- Sending ---------- */

/* Send every byte. One send() call might not send it all, so keep going. */
static bool send_all(int client, const char *data, size_t length) {
    while (length > 0) {
        ssize_t sent = send(client, data, length, 0);
        if (sent < 0) {
            if (errno == EINTR) {
                continue;
            }
            return false;
        }
        data += sent;
        length -= (size_t)sent;
    }
    return true;
}

static const char *status_text(int status) {
    switch (status) {
    case 200: return "OK";
    case 400: return "Bad Request";
    case 403: return "Forbidden";
    case 404: return "Not Found";
    case 405: return "Method Not Allowed";
    case 411: return "Length Required";
    case 413: return "Payload Too Large";
    case 500: return "Internal Server Error";
    default:  return "Error";
    }
}

/* Send a full answer: the status line, the headers, then the JSON body. */
static void send_json(int client, int status, const char *json, const char *extra_header) {
    char headers[256];
    int length = snprintf(headers, sizeof headers,
                          "HTTP/1.1 %d %s\r\n"
                          "Content-Type: application/json; charset=utf-8\r\n"
                          "Content-Length: %zu\r\n"
                          "%s"
                          "Connection: close\r\n"
                          "\r\n",
                          status, status_text(status), strlen(json),
                          extra_header ? extra_header : "");
    if (send_all(client, headers, (size_t)length)) {
        send_all(client, json, strlen(json));
    }
}

/* Send {"error":"..."}. The messages we pass in never need escaping. */
static void send_error(int client, int status, const char *message) {
    char json[256];
    snprintf(json, sizeof json, "{\"error\":\"%s\"}", message);
    send_json(client, status, json, NULL);
}

/* ---------- JSON ---------- */

/*
 * Copy text into out as a JSON string, with quotes around it.
 * Some characters must be written a special way inside JSON:
 * a quote becomes \", a backslash becomes \\, a new line becomes \n,
 * and other hidden control characters become \u00XX.
 * Returns where the writing stopped.
 *
 * out needs room for 6 * strlen(text) + 3 bytes, because the worst
 * case is every character turning into a 6-character \u00XX.
 */
static char *write_json_string(char *out, const char *text) {
    *out++ = '"';
    for (const unsigned char *p = (const unsigned char *)text; *p; p++) {
        switch (*p) {
        case '"':  *out++ = '\\'; *out++ = '"';  break;
        case '\\': *out++ = '\\'; *out++ = '\\'; break;
        case '\n': *out++ = '\\'; *out++ = 'n';  break;
        case '\r': *out++ = '\\'; *out++ = 'r';  break;
        case '\t': *out++ = '\\'; *out++ = 't';  break;
        default:
            if (*p < 0x20) {
                out += snprintf(out, 7, "\\u%04x", *p);
            } else {
                *out++ = (char)*p;
            }
        }
    }
    *out++ = '"';
    *out = '\0';
    return out;
}

/*
 * Check that the text is proper UTF-8, the way the web writes letters
 * from every language. If it is not, our JSON answer would be broken,
 * so we turn the request away.
 */
static bool is_valid_utf8(const unsigned char *s, size_t length) {
    size_t i = 0;
    while (i < length) {
        unsigned char c = s[i];
        size_t extra;           /* how many more bytes this character uses */
        unsigned int smallest;  /* the smallest value allowed for that size */

        if (c < 0x80)                { i++; continue; }
        else if ((c & 0xE0) == 0xC0) { extra = 1; smallest = 0x80; }
        else if ((c & 0xF0) == 0xE0) { extra = 2; smallest = 0x800; }
        else if ((c & 0xF8) == 0xF0) { extra = 3; smallest = 0x10000; }
        else                         { return false; }

        if (i + extra >= length) {
            return false; /* the character is cut off at the end */
        }

        unsigned int value = c & (0x3F >> extra);
        for (size_t k = 1; k <= extra; k++) {
            if ((s[i + k] & 0xC0) != 0x80) {
                return false;
            }
            value = (value << 6) | (s[i + k] & 0x3F);
        }

        /* Turn away overlong forms, UTF-16 surrogates, and values past the max. */
        if (value < smallest || (value >= 0xD800 && value <= 0xDFFF) || value > 0x10FFFF) {
            return false;
        }
        i += extra + 1;
    }
    return true;
}

/* ---------- Routes ---------- */

static void handle_health(int client) {
    send_json(client, 200, "{\"ok\":true}", NULL);
}

static void handle_reverse(int client, const char *body, size_t body_length) {
    if (!is_valid_utf8((const unsigned char *)body, body_length)) {
        send_error(client, 400, "text must be UTF-8");
        return;
    }

    ReverseStats stats;
    char *xyz = reverse_words(body, &stats);
    if (xyz == NULL) {
        send_error(client, 500, "out of memory");
        return;
    }

    /* Room for both strings (worst case) plus the rest of the JSON. */
    size_t room = 6 * strlen(body) + 6 * strlen(xyz) + 128;
    char *json = malloc(room);
    if (json == NULL) {
        free(xyz);
        send_error(client, 500, "out of memory");
        return;
    }

    char *p = json;
    p += snprintf(p, room, "{\"english\":");
    p = write_json_string(p, body);
    p += snprintf(p, room - (size_t)(p - json), ",\"xyz\":");
    p = write_json_string(p, xyz);
    snprintf(p, room - (size_t)(p - json), ",\"pushes\":%zu,\"pops\":%zu}",
             stats.pushes, stats.pops);

    send_json(client, 200, json, NULL);
    free(json);
    free(xyz);
}

/* ---------- Reading a request ---------- */

/*
 * Find a header by name and return where its value starts.
 * Header names can be in any mix of capital and small letters.
 * Returns NULL if the header is not there.
 */
static const char *find_header(const char *headers, const char *name) {
    size_t name_length = strlen(name);
    const char *line = strstr(headers, "\r\n"); /* skip the request line */
    while (line != NULL && line[2] != '\0') {
        line += 2;
        if (strncasecmp(line, name, name_length) == 0 && line[name_length] == ':') {
            const char *value = line + name_length + 1;
            while (*value == ' ' || *value == '\t') {
                value++;
            }
            return value;
        }
        line = strstr(line, "\r\n");
    }
    return NULL;
}

/*
 * Work out how long the body is.
 * No Content-Length means there is no body, so the length is 0.
 * Returns -1 if the number is broken, or if the body is sent in pieces
 * (Transfer-Encoding), which this small server does not read.
 */
static long body_length_from(const char *headers) {
    if (find_header(headers, "Transfer-Encoding") != NULL) {
        return -1;
    }
    const char *value = find_header(headers, "Content-Length");
    if (value == NULL) {
        return 0;
    }
    if (!isdigit((unsigned char)*value)) {
        return -1;
    }
    char *after;
    long length = strtol(value, &after, 10);
    /* After the number there must be nothing but the end of the line. */
    while (*after == ' ' || *after == '\t') {
        after++;
    }
    if (*after != '\r' && *after != '\0') {
        return -1;
    }
    return length;
}

/* ---------- Who is asking ---------- */

/*
 * True if the value starts with one of the given names, followed by
 * a port (":8766"), a path ("/"), or the end of the line.
 * So "localhost:8766" matches "localhost", but "localhost.evil.com" does not.
 */
static bool starts_with_name(const char *value, const char *const names[], size_t count) {
    for (size_t k = 0; k < count; k++) {
        size_t length = strlen(names[k]);
        if (strncasecmp(value, names[k], length) == 0) {
            char next = value[length];
            if (next == ':' || next == '/' || next == '\r' || next == '\0') {
                return true;
            }
        }
    }
    return false;
}

/*
 * Only answer requests that come from this computer.
 *
 * Host is the address the request was sent to. It must be this computer.
 * This stops a trick where another website points its own name at
 * 127.0.0.1 to reach our server.
 *
 * Origin is the website that sent the request. Browsers add it. If it is
 * there, it must be a page on this computer, like our own website.
 * Tools like curl do not send Origin, and that is fine.
 */
static bool is_from_this_computer(const char *headers) {
    static const char *const hosts[] = {"localhost", "127.0.0.1"};
    static const char *const origins[] = {"http://localhost", "http://127.0.0.1"};

    const char *host = find_header(headers, "Host");
    if (host == NULL || !starts_with_name(host, hosts, 2)) {
        return false;
    }

    const char *origin = find_header(headers, "Origin");
    if (origin != NULL && !starts_with_name(origin, origins, 2)) {
        return false;
    }
    return true;
}

static void handle_client(int client) {
    /* One buffer holds the headers and the body, plus room for a final '\0'. */
    static char buffer[MAX_HEADERS + MAX_BODY + 1];
    size_t received = 0;
    char *header_end = NULL;

    /* Step 1: read until we see the blank line that ends the headers. */
    while (header_end == NULL) {
        if (received >= MAX_HEADERS) {
            send_error(client, 400, "headers too large");
            return;
        }
        ssize_t n = recv(client, buffer + received, MAX_HEADERS - received, 0);
        if (n <= 0) {
            return; /* the client left, or took too long */
        }
        received += (size_t)n;
        buffer[received] = '\0';
        header_end = strstr(buffer, "\r\n\r\n");
    }

    /* Step 2: read the first line, like "POST /api/reverse HTTP/1.1". */
    char method[8];
    char path[256];
    if (sscanf(buffer, "%7s %255s", method, path) != 2) {
        send_error(client, 400, "bad request line");
        return;
    }
    path[strcspn(path, "?")] = '\0'; /* ignore anything after a ? */

    printf("%s %s\n", method, path);
    fflush(stdout);

    /* Step 3: only answer requests from this computer. */
    *header_end = '\0'; /* so header searches stop at the end of the headers */
    if (!is_from_this_computer(buffer)) {
        send_error(client, 403, "not allowed");
        return;
    }

    /* Step 4: send the request to the right place. */
    if (strcmp(path, "/api/health") == 0) {
        if (strcmp(method, "GET") != 0) {
            send_json(client, 405, "{\"error\":\"use GET\"}", "Allow: GET\r\n");
            return;
        }
        handle_health(client);
        return;
    }

    if (strcmp(path, "/api/reverse") != 0) {
        send_error(client, 404, "not found");
        return;
    }
    if (strcmp(method, "POST") != 0) {
        send_json(client, 405, "{\"error\":\"use POST\"}", "Allow: POST\r\n");
        return;
    }

    /* Step 5: find out how long the body is, and check it is not too big. */
    long body_length = body_length_from(buffer);
    if (body_length < 0) {
        send_error(client, 411, "send the text with a Content-Length");
        return;
    }
    if (body_length > MAX_BODY) {
        send_error(client, 413, "text is longer than 10 KB");
        return;
    }

    /* Step 6: some of the body may have come in with the headers.
       Move it to the start of the buffer, then read the rest. */
    char *body_start = header_end + 4;
    size_t have = received - (size_t)(body_start - buffer);
    if (have > (size_t)body_length) {
        have = (size_t)body_length; /* ignore anything extra */
    }
    memmove(buffer, body_start, have);

    while (have < (size_t)body_length) {
        ssize_t n = recv(client, buffer + have, (size_t)body_length - have, 0);
        if (n <= 0) {
            return;
        }
        have += (size_t)n;
    }
    buffer[have] = '\0';

    /* A '\0' inside the text would cut it short, so turn it away. */
    if (strlen(buffer) != have) {
        send_error(client, 400, "text must not contain a null character");
        return;
    }

    handle_reverse(client, buffer, have);
}

/* ---------- Starting the server ---------- */

int main(void) {
    int port = DEFAULT_PORT;
    const char *port_setting = getenv("PORT");
    if (port_setting != NULL) {
        port = atoi(port_setting);
        if (port <= 0 || port > 65535) {
            fprintf(stderr, "PORT must be a number from 1 to 65535.\n");
            return 1;
        }
    }

    /* If a client leaves while we are still sending, do not crash. */
    signal(SIGPIPE, SIG_IGN);

    int server = socket(AF_INET, SOCK_STREAM, 0);
    if (server < 0) {
        perror("socket");
        return 1;
    }

    /* Let us restart the server right away on the same port. */
    int yes = 1;
    setsockopt(server, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof yes);

    struct sockaddr_in address;
    memset(&address, 0, sizeof address);
    address.sin_family = AF_INET;
    address.sin_port = htons((unsigned short)port);
    address.sin_addr.s_addr = htonl(INADDR_LOOPBACK); /* this computer only */

    if (bind(server, (struct sockaddr *)&address, sizeof address) < 0) {
        perror("bind");
        fprintf(stderr, "Is something else already using port %d?\n", port);
        return 1;
    }
    if (listen(server, 16) < 0) {
        perror("listen");
        return 1;
    }

    printf("Tribezo server is listening on http://127.0.0.1:%d\n", port);
    fflush(stdout);

    /* Wait for a client, answer it, hang up, and wait for the next one. */
    while (true) {
        int client = accept(server, NULL, NULL);
        if (client < 0) {
            continue;
        }

        /* Do not let one slow client hold up everyone else for long. */
        struct timeval timeout = {TIMEOUT_SECONDS, 0};
        setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof timeout);
        setsockopt(client, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof timeout);

        handle_client(client);

        /* Say we are done sending, then read and throw away anything the
           client is still sending (up to 64 KB). If we hang up while the
           client is still sending, it may never see our answer. */
        shutdown(client, SHUT_WR);
        char leftover[1024];
        size_t thrown_away = 0;
        ssize_t n;
        while (thrown_away < 64 * 1024 &&
               (n = recv(client, leftover, sizeof leftover, 0)) > 0) {
            thrown_away += (size_t)n;
        }
        close(client);
    }
}

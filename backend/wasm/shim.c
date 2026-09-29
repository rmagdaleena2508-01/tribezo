/*
 * The small pieces of the C library that stack.c and reverse.c need, so
 * they can run in a web browser as WebAssembly. The stack code itself is
 * not changed at all.
 *
 * Memory works like a notepad: every allocation takes the next free space,
 * and tribezo_reverse() wipes the whole notepad before each new message.
 * That is simple and fast, because every message starts fresh.
 */

#include <stdbool.h>
#include <stddef.h>

#include "../src/reverse.h"

/* ---------- Memory ---------- */

extern unsigned char __heap_base; /* where free memory starts, set by the linker */
static size_t next_free = 0;

#define PAGE_SIZE 65536

static void *take(size_t size) {
    if (next_free == 0) next_free = (size_t)&__heap_base;
    size_t start = (next_free + 7) & ~(size_t)7; /* line up on 8 bytes */
    size_t end = start + size;

    /* Grow the memory if the notepad is full. */
    size_t have = __builtin_wasm_memory_size(0) * PAGE_SIZE;
    if (end > have) {
        size_t pages = (end - have + PAGE_SIZE - 1) / PAGE_SIZE;
        if (__builtin_wasm_memory_grow(0, pages) == (size_t)-1) return NULL;
    }
    next_free = end;
    return (void *)start;
}

void *memcpy(void *to, const void *from, size_t n) {
    unsigned char *t = to;
    const unsigned char *f = from;
    while (n--) *t++ = *f++;
    return to;
}

/* Each allocation remembers its size just before it, so realloc can copy it. */
void *malloc(size_t size) {
    size_t *block = take(size + sizeof(size_t));
    if (!block) return NULL;
    block[0] = size;
    return block + 1;
}

void *realloc(void *ptr, size_t size) {
    void *bigger = malloc(size);
    if (bigger && ptr) {
        size_t old = ((size_t *)ptr)[-1];
        memcpy(bigger, ptr, old < size ? old : size);
    }
    return bigger;
}

void free(void *ptr) {
    (void)ptr; /* the notepad is wiped all at once instead */
}

/* ---------- Text ---------- */

size_t strlen(const char *s) {
    size_t n = 0;
    while (s[n]) n++;
    return n;
}

int memcmp(const void *a, const void *b, size_t n) {
    const unsigned char *x = a, *y = b;
    for (size_t i = 0; i < n; i++) {
        if (x[i] != y[i]) return x[i] - y[i];
    }
    return 0;
}

int strcmp(const char *a, const char *b) {
    while (*a && *a == *b) {
        a++;
        b++;
    }
    return (unsigned char)*a - (unsigned char)*b;
}

int isalpha(int c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'); }
int isdigit(int c) { return c >= '0' && c <= '9'; }
int isalnum(int c) { return isalpha(c) || isdigit(c); }
int isspace(int c) { return c == ' ' || (c >= '\t' && c <= '\r'); }
int tolower(int c) { return (c >= 'A' && c <= 'Z') ? c + 32 : c; }

/* ---------- What the website calls ---------- */

static ReverseStats stats;

/* Wipe the notepad and make room for a message of this many bytes. */
__attribute__((export_name("tribezo_input")))
char *tribezo_input(size_t bytes) {
    next_free = 0;
    return malloc(bytes + 1);
}

/* Make room for the names to keep, after tribezo_input(). */
__attribute__((export_name("tribezo_keep")))
char *tribezo_keep(size_t bytes) {
    return malloc(bytes + 1);
}

/* Flip the message with the stack, keeping the names in "keep" (which
   can be 0). Returns the XYZ text, or 0 if there was no memory. */
__attribute__((export_name("tribezo_reverse")))
char *tribezo_reverse(const char *text, const char *keep) {
    return reverse_words_keeping(text, keep, &stats);
}

__attribute__((export_name("tribezo_pushes")))
size_t tribezo_pushes(void) { return stats.pushes; }

__attribute__((export_name("tribezo_pops")))
size_t tribezo_pops(void) { return stats.pops; }

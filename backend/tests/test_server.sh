#!/bin/sh
# Tests for the HTTP server. Run with: make test-server
#
# This starts the server on a spare port, sends it requests with curl,
# checks each answer, and then stops the server.

PORT=18765
URL="http://127.0.0.1:$PORT"
failures=0

SERVER=${SERVER:-./build/server}
PORT=$PORT "$SERVER" > /dev/null &
server_pid=$!
trap 'kill $server_pid 2>/dev/null' EXIT

# Wait for the server to start (up to 2 seconds).
for _ in 1 2 3 4 5 6 7 8 9 10; do
    curl -s "$URL/api/health" > /dev/null && break
    sleep 0.2
done

# check NAME EXPECTED ACTUAL
check() {
    if [ "$2" = "$3" ]; then
        return
    fi
    echo "  FAIL: $1"
    echo "        expected: $2"
    echo "        got:      $3"
    failures=$((failures + 1))
}

# Send a request and print the status code, then a space, then the body.
request() {
    curl -s -o /tmp/tribezo_body.$$ -w '%{http_code}' "$@"
    printf ' '
    cat /tmp/tribezo_body.$$ 2>/dev/null
    rm -f /tmp/tribezo_body.$$
}

echo "Server tests"

check "health" \
    '200 {"ok":true}' \
    "$(request "$URL/api/health")"

check "reverse" \
    '200 {"english":"hello, world!","xyz":"olleh, dlrow!","pushes":10,"pops":10}' \
    "$(request -X POST --data-binary 'hello, world!' "$URL/api/reverse")"

check "money and numbers stay" \
    '200 {"english":"it is Rs 500 for 3","xyz":"ti si Rs 500 rof 3","pushes":7,"pops":7}' \
    "$(request -X POST --data-binary 'it is Rs 500 for 3' "$URL/api/reverse")"

check "quotes and new lines are escaped" \
    '200 {"english":"say \"hi\"\nbye","xyz":"yas \"ih\"\neyb","pushes":8,"pops":8}' \
    "$(request -X POST --data-binary "$(printf 'say "hi"\nbye')" "$URL/api/reverse")"

# Letters outside plain English (like é) stay where they are.
check "letters from other languages stay in place" \
    '200 {"english":"café ₹5","xyz":"facé ₹5","pushes":3,"pops":3}' \
    "$(request -X POST --data-binary 'café ₹5' "$URL/api/reverse")"

check "empty text" \
    '200 {"english":"","xyz":"","pushes":0,"pops":0}' \
    "$(request -X POST -H 'Content-Type: text/plain' --data-binary '' "$URL/api/reverse")"

check "unknown path" \
    '404 {"error":"not found"}' \
    "$(request "$URL/api/nope")"

check "wrong method" \
    '405 {"error":"use POST"}' \
    "$(request "$URL/api/reverse")"

big=$(head -c 10241 /dev/zero | tr '\0' 'a')
check "text too long" \
    '413 {"error":"text is longer than 10 KB"}' \
    "$(request -X POST --data-binary "$big" "$URL/api/reverse")"

check "bad UTF-8" \
    '400 {"error":"text must be UTF-8"}' \
    "$(request -X POST --data-binary "$(printf 'bad \377 byte')" "$URL/api/reverse")"

check "request sent to another name (Host)" \
    '403 {"error":"not allowed"}' \
    "$(request -H 'Host: evil.example' "$URL/api/health")"

check "Host that only starts with localhost" \
    '403 {"error":"not allowed"}' \
    "$(request -H 'Host: localhost.evil.example' "$URL/api/health")"

check "request from another website (Origin)" \
    '403 {"error":"not allowed"}' \
    "$(request -X POST -H 'Origin: https://evil.example' --data-binary 'hi' "$URL/api/reverse")"

check "request from our own website (Origin)" \
    '200 {"english":"hi","xyz":"ih","pushes":2,"pops":2}' \
    "$(request -X POST -H 'Origin: http://localhost:8766' --data-binary 'hi' "$URL/api/reverse")"

check "server still works after errors" \
    '200 {"ok":true}' \
    "$(request "$URL/api/health")"

if [ $failures -eq 0 ]; then
    echo "  all passed"
    exit 0
fi
echo "  $failures failed"
exit 1

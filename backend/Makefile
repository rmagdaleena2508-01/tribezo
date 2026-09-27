# Build the Tribezo backend.
#
#   make test         build and run the stack and reverse tests
#   make test-server  start the server and check every endpoint
#   make run          start the server on port 8765
#   make demo         try reversing text by typing it in
#   make clean        delete everything that was built

CC ?= cc
CFLAGS = -std=c11 -Wall -Wextra -Wpedantic -O2

# Tests also look for memory mistakes (reading past the end of a list,
# forgetting to free memory, and so on).
TEST_FLAGS = -std=c11 -Wall -Wextra -Wpedantic -g -fsanitize=address,undefined

CORE = src/stack.c src/reverse.c
HEADERS = src/stack.h src/reverse.h

BUILD = build

.PHONY: all test test-server run demo clean

all: $(BUILD)/demo $(BUILD)/server

$(BUILD):
	mkdir -p $(BUILD)

$(BUILD)/demo: src/demo.c $(CORE) $(HEADERS) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ src/demo.c $(CORE)

$(BUILD)/server: src/server.c $(CORE) $(HEADERS) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ src/server.c $(CORE)

# The server used by the tests also looks for memory mistakes.
$(BUILD)/test_server: src/server.c $(CORE) $(HEADERS) | $(BUILD)
	$(CC) $(TEST_FLAGS) -o $@ src/server.c $(CORE)

$(BUILD)/test_stack: tests/test_stack.c src/stack.c src/stack.h | $(BUILD)
	$(CC) $(TEST_FLAGS) -o $@ tests/test_stack.c src/stack.c

$(BUILD)/test_reverse: tests/test_reverse.c $(CORE) $(HEADERS) | $(BUILD)
	$(CC) $(TEST_FLAGS) -o $@ tests/test_reverse.c $(CORE)

test: $(BUILD)/test_stack $(BUILD)/test_reverse
	./$(BUILD)/test_stack
	./$(BUILD)/test_reverse

test-server: $(BUILD)/test_server
	SERVER=./$(BUILD)/test_server ./tests/test_server.sh

run: $(BUILD)/server
	./$(BUILD)/server

demo: $(BUILD)/demo
	./$(BUILD)/demo

clean:
	rm -rf $(BUILD)

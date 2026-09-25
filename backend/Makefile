# Build the Tribezo backend.
#
#   make test   build and run all tests
#   make demo   try reversing text by typing it in
#   make clean  delete everything that was built

CC ?= cc
CFLAGS = -std=c11 -Wall -Wextra -Wpedantic -O2

# Tests also look for memory mistakes (reading past the end of a list,
# forgetting to free memory, and so on).
TEST_FLAGS = -std=c11 -Wall -Wextra -Wpedantic -g -fsanitize=address,undefined

CORE = src/stack.c src/reverse.c
HEADERS = src/stack.h src/reverse.h

BUILD = build

.PHONY: all test demo clean

all: $(BUILD)/demo

$(BUILD):
	mkdir -p $(BUILD)

$(BUILD)/demo: src/demo.c $(CORE) $(HEADERS) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ src/demo.c $(CORE)

$(BUILD)/test_stack: tests/test_stack.c src/stack.c src/stack.h | $(BUILD)
	$(CC) $(TEST_FLAGS) -o $@ tests/test_stack.c src/stack.c

$(BUILD)/test_reverse: tests/test_reverse.c $(CORE) $(HEADERS) | $(BUILD)
	$(CC) $(TEST_FLAGS) -o $@ tests/test_reverse.c $(CORE)

test: $(BUILD)/test_stack $(BUILD)/test_reverse
	./$(BUILD)/test_stack
	./$(BUILD)/test_reverse

demo: $(BUILD)/demo
	./$(BUILD)/demo

clean:
	rm -rf $(BUILD)

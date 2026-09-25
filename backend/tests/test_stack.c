/* Tests for the stack. Run with: make test */

#include "../src/stack.h"

#include <stdio.h>

static int failures = 0;

/* If the check is false, print what went wrong and count it. */
#define CHECK(condition)                                              \
    do {                                                              \
        if (!(condition)) {                                           \
            printf("  FAIL line %d: %s\n", __LINE__, #condition);     \
            failures++;                                               \
        }                                                             \
    } while (0)

static void test_new_stack_is_empty(void) {
    Stack s;
    CHECK(stack_init(&s, 4));
    CHECK(stack_is_empty(&s));

    char c;
    CHECK(!stack_pop(&s, &c));  /* nothing to pop */
    CHECK(!stack_peek(&s, &c)); /* nothing to look at */
    stack_free(&s);
}

static void test_last_in_first_out(void) {
    Stack s;
    stack_init(&s, 4);
    stack_push(&s, 'a');
    stack_push(&s, 'b');
    stack_push(&s, 'c');

    char c;
    CHECK(stack_peek(&s, &c) && c == 'c'); /* peek does not remove */
    CHECK(stack_pop(&s, &c) && c == 'c');
    CHECK(stack_pop(&s, &c) && c == 'b');
    CHECK(stack_pop(&s, &c) && c == 'a');
    CHECK(stack_is_empty(&s));
    stack_free(&s);
}

static void test_stack_grows(void) {
    /* Start tiny, then push way more than fits. The stack must grow. */
    Stack s;
    stack_init(&s, 1);
    for (int i = 0; i < 1000; i++) {
        CHECK(stack_push(&s, (char)('a' + i % 26)));
    }
    CHECK(s.size == 1000);

    /* They must come back out in the opposite order. */
    char c;
    for (int i = 999; i >= 0; i--) {
        CHECK(stack_pop(&s, &c) && c == (char)('a' + i % 26));
    }
    CHECK(stack_is_empty(&s));
    stack_free(&s);
}

static void test_zero_capacity_still_works(void) {
    Stack s;
    CHECK(stack_init(&s, 0));
    CHECK(stack_push(&s, 'x'));
    char c;
    CHECK(stack_pop(&s, &c) && c == 'x');
    stack_free(&s);
}

int main(void) {
    printf("Stack tests\n");
    test_new_stack_is_empty();
    test_last_in_first_out();
    test_stack_grows();
    test_zero_capacity_still_works();

    if (failures == 0) {
        printf("  all passed\n");
        return 0;
    }
    printf("  %d failed\n", failures);
    return 1;
}

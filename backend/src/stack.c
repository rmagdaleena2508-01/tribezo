#include "stack.h"

#include <stdlib.h>

bool stack_init(Stack *s, size_t capacity) {
    /* Always start with room for at least one character. */
    if (capacity == 0) {
        capacity = 16;
    }

    s->items = malloc(capacity);
    s->size = 0;
    s->capacity = s->items ? capacity : 0;
    return s->items != NULL;
}

void stack_free(Stack *s) {
    free(s->items);
    s->items = NULL;
    s->size = 0;
    s->capacity = 0;
}

bool stack_push(Stack *s, char c) {
    /* The list is full. Make it twice as big.
       Growing by doubling means we only grow once in a while,
       so pushing stays fast on average. */
    if (s->size == s->capacity) {
        size_t bigger = s->capacity * 2;
        char *grown = realloc(s->items, bigger);
        if (grown == NULL) {
            return false; /* no memory; the old stack is still fine */
        }
        s->items = grown;
        s->capacity = bigger;
    }

    /* Put the character in the next free spot. That spot is the new top. */
    s->items[s->size] = c;
    s->size++;
    return true;
}

bool stack_pop(Stack *s, char *out) {
    if (s->size == 0) {
        return false; /* nothing to take off */
    }

    /* The top is the last filled spot. Step back one and hand it out. */
    s->size--;
    *out = s->items[s->size];
    return true;
}

bool stack_peek(const Stack *s, char *out) {
    if (s->size == 0) {
        return false;
    }

    *out = s->items[s->size - 1];
    return true;
}

bool stack_is_empty(const Stack *s) {
    return s->size == 0;
}

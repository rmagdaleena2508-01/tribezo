#ifndef TRIBEZO_STACK_H
#define TRIBEZO_STACK_H

#include <stdbool.h>
#include <stddef.h>

/*
 * A stack of characters.
 *
 * Think of a pile of plates. You can only add a plate on top (push)
 * or take the top plate off (pop). The last one in is the first one out.
 *
 * We keep the characters in a list (an array). The top of the stack is
 * the end of the list, so adding and taking off are always quick.
 * If the list gets full, we make it twice as big.
 */
typedef struct {
    char *items;     /* the list that holds the characters */
    size_t size;     /* how many characters are on the stack right now */
    size_t capacity; /* how many characters fit before the list must grow */
} Stack;

/* Get a new, empty stack ready. Returns false if there is no memory. */
bool stack_init(Stack *s, size_t capacity);

/* Give the stack's memory back when we are done with it. */
void stack_free(Stack *s);

/* Put a character on top. Returns false if there is no memory. */
bool stack_push(Stack *s, char c);

/* Take the top character off and put it in *out.
   Returns false if the stack is empty. */
bool stack_pop(Stack *s, char *out);

/* Look at the top character without taking it off.
   Returns false if the stack is empty. */
bool stack_peek(const Stack *s, char *out);

/* True if there is nothing on the stack. */
bool stack_is_empty(const Stack *s);

#endif

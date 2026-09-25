#ifndef TRIBEZO_REVERSE_H
#define TRIBEZO_REVERSE_H

#include <stddef.h>

/* Counts how much work the stack did. */
typedef struct {
    size_t pushes; /* how many characters went onto the stack */
    size_t pops;   /* how many characters came off the stack */
} ReverseStats;

/*
 * Turn English into XYZ, the tribe's language.
 *
 * Rules:
 *   1. Each word is reversed.
 *   2. The words stay in the same order.
 *   3. Punctuation stays in the same place.
 *   4. Money stays the same. A word with a money sign ($ € £ ¥ ₹)
 *      and a number, like "$100.50", is not reversed.
 *
 * Example: "hello, world!" becomes "olleh, dlrow!"
 * Example: "it costs $20." becomes "ti stsoc $20."
 *
 * Returns a new string. The caller must free() it.
 * Returns NULL if there is no memory.
 * If stats is not NULL, it gets filled with the push and pop counts.
 */
char *reverse_words(const char *text, ReverseStats *stats);

#endif

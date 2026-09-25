#include "reverse.h"

#include "stack.h"

#include <ctype.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

/* Letters and numbers get reversed. Everything else stays where it is.
   Characters outside plain English (like é) also stay where they are. */
static bool is_letter_or_number(char c) {
    return isalnum((unsigned char)c);
}

/* Spaces, tabs, and new lines are what separate words. */
static bool is_space(char c) {
    return isspace((unsigned char)c);
}

char *reverse_words(const char *text, ReverseStats *stats) {
    size_t length = strlen(text);

    /* Make a copy of the text. We change the copy, not the original.
       Spaces and punctuation are already in the right spots in the copy,
       so we only need to fix the letters and numbers. */
    char *result = malloc(length + 1);
    if (result == NULL) {
        return NULL;
    }
    memcpy(result, text, length + 1);

    /* One stack is used for every word. It is always empty
       again at the end of each word, so we can reuse it. */
    Stack stack;
    if (!stack_init(&stack, 32)) {
        free(result);
        return NULL;
    }

    size_t pushes = 0;
    size_t pops = 0;
    size_t i = 0;

    while (i < length) {
        /* Skip over spaces between words. They never move. */
        if (is_space(text[i])) {
            i++;
            continue;
        }

        /* Find where this word starts and ends. */
        size_t start = i;
        while (i < length && !is_space(text[i])) {
            i++;
        }
        size_t end = i; /* one past the last character of the word */

        /* Step 1: push every letter and number in the word onto the stack.
           For "don't" the stack gets d, o, n, t (with t on top). */
        for (size_t j = start; j < end; j++) {
            if (is_letter_or_number(text[j])) {
                if (!stack_push(&stack, text[j])) {
                    stack_free(&stack);
                    free(result);
                    return NULL;
                }
                pushes++;
            }
        }

        /* Step 2: walk through the word again.
           Every spot that had a letter or number gets the top of the stack.
           Punctuation spots are skipped, so they stay put.
           For "don't" we fill in t, n, o, ' , d to get "tno'd". */
        for (size_t j = start; j < end; j++) {
            if (is_letter_or_number(text[j])) {
                stack_pop(&stack, &result[j]);
                pops++;
            }
        }
    }

    stack_free(&stack);

    if (stats != NULL) {
        stats->pushes = pushes;
        stats->pops = pops;
    }
    return result;
}

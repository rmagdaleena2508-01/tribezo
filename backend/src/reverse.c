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

/* Money signs we look for. Some take more than one byte to store
   (like the rupee sign), so we keep each one as a short string. */
static const char *MONEY_SIGNS[] = {"$", "\xE2\x82\xAC" /* € */, "\xC2\xA3" /* £ */,
                                    "\xC2\xA5" /* ¥ */, "\xE2\x82\xB9" /* ₹ */};

/* A word is money if it has a money sign and at least one number,
   like "$100.50" or "₹500". Money is never reversed, so the amount
   means the same thing in English and in XYZ. */
static bool is_money(const char *word, size_t length) {
    bool has_number = false;
    bool has_sign = false;

    for (size_t i = 0; i < length; i++) {
        if (isdigit((unsigned char)word[i])) {
            has_number = true;
        }
        for (size_t k = 0; k < sizeof MONEY_SIGNS / sizeof MONEY_SIGNS[0]; k++) {
            size_t sign_length = strlen(MONEY_SIGNS[k]);
            if (i + sign_length <= length &&
                memcmp(word + i, MONEY_SIGNS[k], sign_length) == 0) {
                has_sign = true;
            }
        }
    }
    return has_number && has_sign;
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

        /* Money stays exactly the same. The copy already has it right. */
        if (is_money(text + start, end - start)) {
            continue;
        }

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

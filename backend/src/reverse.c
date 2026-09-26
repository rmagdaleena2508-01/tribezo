#include "reverse.h"

#include "stack.h"

#include <ctype.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

/* Only letters get reversed. Numbers, punctuation, and everything else
   stay where they are. Characters outside plain English (like é) stay too. */
static bool is_letter(char c) {
    return isalpha((unsigned char)c);
}

static bool is_number(char c) {
    return isdigit((unsigned char)c);
}

/* Spaces, tabs, and new lines are what separate words. */
static bool is_space(char c) {
    return isspace((unsigned char)c);
}

/* Money signs we look for. Some take more than one byte to store
   (like the rupee sign), so we keep each one as a short string. */
static const char *MONEY_SIGNS[] = {"$", "\xE2\x82\xAC" /* € */, "\xC2\xA3" /* £ */,
                                    "\xC2\xA5" /* ¥ */, "\xE2\x82\xB9" /* ₹ */};

/* Money written as a word, in lowercase. */
static const char *MONEY_NAMES[] = {
    "dollar", "dollars", "buck", "bucks", "cent",  "cents", "rupee", "rupees",
    "rs",     "paise",   "euro", "euros", "pound", "pounds", "yen",  "usd",
    "inr",    "eur",     "gbp",  "jpy",
};

#define COUNT(list) (sizeof(list) / sizeof((list)[0]))

/* True if the word has at least one number in it. */
static bool has_number(const char *word, size_t length) {
    for (size_t i = 0; i < length; i++) {
        if (is_number(word[i])) {
            return true;
        }
    }
    return false;
}

/* True if the word has a money sign anywhere in it. */
static bool has_money_sign(const char *word, size_t length) {
    for (size_t i = 0; i < length; i++) {
        for (size_t k = 0; k < COUNT(MONEY_SIGNS); k++) {
            size_t sign_length = strlen(MONEY_SIGNS[k]);
            if (i + sign_length <= length &&
                memcmp(word + i, MONEY_SIGNS[k], sign_length) == 0) {
                return true;
            }
        }
    }
    return false;
}

/* True if the letters in the word spell a money name.
   We only look at the letters, so "Rs." and "Rs500" both count as "rs". */
static bool has_money_name(const char *word, size_t length) {
    char letters[16];
    size_t count = 0;

    for (size_t i = 0; i < length; i++) {
        if (is_letter(word[i])) {
            if (count == sizeof letters - 1) {
                return false; /* too long to be a money name */
            }
            letters[count++] = (char)tolower((unsigned char)word[i]);
        }
    }
    letters[count] = '\0';

    for (size_t k = 0; k < COUNT(MONEY_NAMES); k++) {
        if (strcmp(letters, MONEY_NAMES[k]) == 0) {
            return true;
        }
    }
    return false;
}

/* Find the next word at or after spot "from".
   Returns false if there are no more words. */
static bool find_word(const char *text, size_t length, size_t from,
                      size_t *start, size_t *end) {
    size_t i = from;
    while (i < length && is_space(text[i])) {
        i++;
    }
    if (i == length) {
        return false;
    }
    *start = i;
    while (i < length && !is_space(text[i])) {
        i++;
    }
    *end = i; /* one past the last character of the word */
    return true;
}

char *reverse_words(const char *text, ReverseStats *stats) {
    size_t length = strlen(text);

    /* Make a copy of the text. We change the copy, not the original.
       Spaces, numbers, and punctuation are already in the right spots
       in the copy, so we only need to fix the letters. */
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
    size_t start, end;
    size_t from = 0;
    bool last_word_had_number = false;

    while (find_word(text, length, from, &start, &end)) {
        const char *word = text + start;
        size_t word_length = end - start;
        bool this_word_has_number = has_number(word, word_length);
        from = end;

        /* Money stays exactly the same, so the amount means the same
           thing in English and in XYZ. The copy already has it right,
           so we just skip the word. Money looks like one of these:
             - a number with a money sign:   "$100.50", "₹500"
             - a number with a money name:   "Rs500", "20usd"
             - a money name next to a number: "100 dollars", "Rs 500" */
        if (this_word_has_number) {
            if (has_money_sign(word, word_length) || has_money_name(word, word_length)) {
                last_word_had_number = true;
                continue;
            }
        } else if (has_money_name(word, word_length)) {
            size_t next_start, next_end;
            bool next_word_has_number =
                find_word(text, length, end, &next_start, &next_end) &&
                has_number(text + next_start, next_end - next_start);

            if (last_word_had_number || next_word_has_number) {
                last_word_had_number = false;
                continue;
            }
        }
        last_word_had_number = this_word_has_number;

        /* Step 1: push every letter in the word onto the stack.
           For "don't" the stack gets d, o, n, t (with t on top). */
        for (size_t j = start; j < end; j++) {
            if (is_letter(text[j])) {
                if (!stack_push(&stack, text[j])) {
                    stack_free(&stack);
                    free(result);
                    return NULL;
                }
                pushes++;
            }
        }

        /* Step 2: walk through the word again.
           Every spot that had a letter gets the top of the stack.
           Numbers and punctuation are skipped, so they stay put.
           For "don't" we fill in t, n, o, ' , d to get "tno'd". */
        for (size_t j = start; j < end; j++) {
            if (is_letter(text[j])) {
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

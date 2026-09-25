/*
 * A small program to try the reverse function by hand.
 * Type a line of English, press Enter, and see it in XYZ.
 * Press Ctrl+D to stop.
 *
 * Run with: make demo
 */

#include "reverse.h"

#include <stdio.h>
#include <stdlib.h>

int main(void) {
    char line[4096];

    printf("Type English and press Enter. Press Ctrl+D to stop.\n> ");
    fflush(stdout);

    while (fgets(line, sizeof line, stdin) != NULL) {
        ReverseStats stats;
        char *xyz = reverse_words(line, &stats);
        if (xyz == NULL) {
            fprintf(stderr, "Out of memory.\n");
            return 1;
        }

        /* The line already ends with a new line, so no extra \n here. */
        printf("XYZ: %s", xyz);
        printf("(stack: %zu pushes, %zu pops)\n> ", stats.pushes, stats.pops);
        fflush(stdout);
        free(xyz);
    }

    printf("\n");
    return 0;
}

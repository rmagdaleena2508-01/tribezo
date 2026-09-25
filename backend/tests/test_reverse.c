/* Tests for turning English into XYZ. Run with: make test */

#include "../src/reverse.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int failures = 0;

/* Reverse the input and compare it with what we expect. */
static void expect(const char *input, const char *expected) {
    char *got = reverse_words(input, NULL);
    if (got == NULL || strcmp(got, expected) != 0) {
        printf("  FAIL: \"%s\"\n", input);
        printf("        expected \"%s\"\n", expected);
        printf("        got      \"%s\"\n", got ? got : "(NULL)");
        failures++;
    }
    free(got);
}

static void test_basic_words(void) {
    expect("", "");
    expect("a", "a");
    expect("hello", "olleh");
    expect("hello world", "olleh dlrow");
    expect("you are kind", "uoy era dnik");
}

static void test_punctuation_stays(void) {
    expect("hello, world!", "olleh, dlrow!");
    expect("how are you?", "woh era uoy?");
    expect("you are kind.", "uoy era dnik.");
    expect("don't", "tno'd");
    expect("(hi)", "(ih)");
    expect("\"wow\"", "\"wow\"");
    expect("...", "...");
    expect("well-known", "nwon-kllew");
}

static void test_spaces_stay(void) {
    expect("  hi  ", "  ih  ");
    expect("hi   there", "ih   ereht");
    expect("line one\nline two", "enil eno\nenil owt");
    expect("tab\there", "bat\tereh");
}

static void test_numbers(void) {
    expect("123", "321");
    expect("room 42b", "moor b24");
}

static void test_money_stays(void) {
    expect("$100.50", "$100.50");
    expect("it costs $20.", "ti stsoc $20.");
    expect("pay 100$ now", "yap 100$ won");
    expect("only \xE2\x82\xB9" "500!", "ylno \xE2\x82\xB9" "500!");       /* ₹500 */
    expect("\xE2\x82\xAC" "9.99 each", "\xE2\x82\xAC" "9.99 hcae");     /* €9.99 */
    expect("\xC2\xA3" "5, please", "\xC2\xA3" "5, esaelp");             /* £5 */
    expect("$5,000", "$5,000");
    /* A money sign with no number is not money, so the word is reversed. */
    expect("$ab", "$ba");
}

static void test_mixed_case(void) {
    expect("Hello World", "olleH dlroW");
}

static void test_counts(void) {
    /* "hi, you" has 5 letters, so 5 pushes and 5 pops. */
    ReverseStats stats;
    char *got = reverse_words("hi, you", &stats);
    if (got == NULL || stats.pushes != 5 || stats.pops != 5) {
        printf("  FAIL: counts for \"hi, you\" (pushes %zu, pops %zu)\n",
               stats.pushes, stats.pops);
        failures++;
    }
    free(got);
}

static void test_long_paragraph(void) {
    /* Build a long paragraph by repeating one sentence many times. */
    const char *sentence = "The tribe is kind, friendly, and welcoming! ";
    const char *reversed = "ehT ebirt si dnik, yldneirf, dna gnimoclew! ";
    size_t times = 2000;
    size_t n = strlen(sentence);

    char *input = malloc(n * times + 1);
    char *expected = malloc(n * times + 1);
    for (size_t i = 0; i < times; i++) {
        memcpy(input + i * n, sentence, n);
        memcpy(expected + i * n, reversed, n);
    }
    input[n * times] = '\0';
    expected[n * times] = '\0';

    char *got = reverse_words(input, NULL);
    if (got == NULL || strcmp(got, expected) != 0) {
        printf("  FAIL: long paragraph\n");
        failures++;
    }
    free(got);
    free(input);
    free(expected);
}

static void test_reversing_twice_gives_back_english(void) {
    /* XYZ reversed again should be the original English. */
    const char *english = "Hi there, friend! Can I visit your village?";
    char *xyz = reverse_words(english, NULL);
    char *back = reverse_words(xyz, NULL);
    if (back == NULL || strcmp(back, english) != 0) {
        printf("  FAIL: reversing twice did not give back the English\n");
        failures++;
    }
    free(xyz);
    free(back);
}

int main(void) {
    printf("Reverse tests\n");
    test_basic_words();
    test_punctuation_stays();
    test_spaces_stay();
    test_numbers();
    test_money_stays();
    test_mixed_case();
    test_counts();
    test_long_paragraph();
    test_reversing_twice_gives_back_english();

    if (failures == 0) {
        printf("  all passed\n");
        return 0;
    }
    printf("  %d failed\n", failures);
    return 1;
}

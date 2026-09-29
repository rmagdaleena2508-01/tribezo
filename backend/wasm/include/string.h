/* A tiny string.h for WebAssembly. Only what stack.c and reverse.c use. */
#ifndef TRIBEZO_WASM_STRING_H
#define TRIBEZO_WASM_STRING_H
#include <stddef.h>
size_t strlen(const char *s);
int strcmp(const char *a, const char *b);
int memcmp(const void *a, const void *b, size_t n);
void *memcpy(void *to, const void *from, size_t n);
#endif

/* A tiny stdlib.h for WebAssembly. Only what stack.c and reverse.c use. */
#ifndef TRIBEZO_WASM_STDLIB_H
#define TRIBEZO_WASM_STDLIB_H
#include <stddef.h>
void *malloc(size_t size);
void *realloc(void *ptr, size_t size);
void free(void *ptr);
#endif

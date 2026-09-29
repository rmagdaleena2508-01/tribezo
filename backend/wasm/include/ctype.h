/* A tiny ctype.h for WebAssembly. Plain English letters only, the same as
   the normal C library does by default. */
#ifndef TRIBEZO_WASM_CTYPE_H
#define TRIBEZO_WASM_CTYPE_H
int isalpha(int c);
int isdigit(int c);
int isalnum(int c);
int isspace(int c);
int tolower(int c);
#endif

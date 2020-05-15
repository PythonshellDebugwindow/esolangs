#include <stdio.h>

void plusOrMinus(const char* code) {
  int acc = 0;
  unsigned long i;
  for(i = 0; code[i]; ++i) {
    if(code[i] == '+' && ++acc > 255) acc = 0;
    if(code[i] == '-') {
      printf("%c", (char) acc);
      if(--acc < 0) acc = 255;
    }
  }
  printf("\n\033[32;1m=> %d\033[0m\n", acc);
}

#ifndef _PLUS_OR_MINUS_H
#define _PLUS_OR_MINUS_H

#include <stdio.h>

void plusOrMinus(const char *code)
{
  short acc = 0;
  unsigned long i;
  for(i = 0; code[i]; ++i)
  {
    if(code[i] == '+' && ++acc > 255)
      acc = 0;
    else if(code[i] == '-')
    {
      printf("%c", (char) acc);
      if(--acc < 0)
        acc = 255;
    }
  }
  printf("\n\033[32;1m=> %d\033[0m\n", acc);
}

#endif //_PLUS_OR_MINUS_H

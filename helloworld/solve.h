#ifndef __SOLVE_H
#define __SOLVE_H

#include <stdbool.h>

long solveEquation(char *equation, int line);
long handleSubtraction(char *addToken, char **subSave, int line);
long handleMultiplication(char *subToken, char **mulSave, int line);

bool isValidInt(const char *str);

#endif //__SOLVE_H

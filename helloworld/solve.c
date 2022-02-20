#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "solve.h"

long solveEquation(char *equation, int line)
{
  long result = 0;

  char *addToken, *addSave, *mulSave, *divToken, *divSave;
  
  addToken = strtok_r(equation, "+", &addSave);
  do
  {
    result += handleSubtraction(addToken, &mulSave, line);
  }
  while((addToken = strtok_r(NULL, "+", &addSave)));
  
  return result;
}

long handleSubtraction(char *addToken, char **subSave, int line)
{
  char *subToken = strtok_r(addToken, "-", subSave), *mulSave;
  long result = handleMultiplication(subToken, &mulSave, line);
  
  while((subToken = strtok_r(NULL, "-", subSave)))
  {
    result -= handleMultiplication(subToken, &mulSave, line);
  }
  return result;
}

long handleMultiplication(char *subToken, char **mulSave, int line)
{
  long result = 1;
  char *mulToken = strtok_r(subToken, "*", mulSave);
  char *divToken, *divSave;
  do
  {
    divToken = strtok_r(mulToken, "/", &divSave);
    if(!isValidInt(divToken))
    {
      fprintf(stderr, "Error on line %d: `%s' is not a valid integer\n", line + 2, divToken);
      exit(1);
    }
    long divResult = atol(divToken);
    while((divToken = strtok_r(NULL, "/", &divSave)))
    {
      if(!isValidInt(divToken))
      {
        fprintf(stderr, "Error on line %d: `%s' is not a valid integer\n", line + 2, divToken);
        exit(1);
      }
      divResult /= atol(divToken);
    }
    
    result *= divResult;
  }
  while((mulToken = strtok_r(NULL, "*", mulSave)));
  return result;
}

bool isValidInt(const char *str)
{
  for(int i = 0; str[i]; ++i)
    if(str[i] < '0' || str[i] > '9')
      return false;
  return true;
}

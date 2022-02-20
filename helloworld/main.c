#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "solve.h"

bool startsWith(const char *str, const char *prefix);

int main(int argc, char **argv)
{
  if(argc < 2)
  {
    fprintf(stderr, "Usage: %s [FILE]\n", argv[0]);
    return 1;
  }
  char *filename = argv[1];
  FILE *myfile = fopen(filename, "r");
  
  int ch, lines = 0;
  do
  {
    ch = fgetc(myfile);
    if(ch == '\n')
      ++lines;
  }
  while(ch != EOF);
  
  rewind(myfile);
  
  size_t len;
  char *line;
  int i;
  for(i = 0; i < lines; ++i)
  {
    len = 0;
    getline(&line, &len, myfile);
    if(strcmp(line, "HELLO\n") == 0)
      break;
  }
  if(i == lines)
  {
    fprintf(stderr, "Error: `HELLO' not found in program\n"); 
    return 1;
  }
  
  long drhResult;
  bool hasRunDrh = false;
  for(; i < lines; ++i)
  {
    len = 0;
    getline(&line, &len, myfile);
    
    if(line[strlen(line) - 1] == '\n')
      line[strlen(line) - 1] = '\0';
    
    if(strcmp(line, "WORLD") == 0)
      break;
    else if(startsWith(line, "drh(") && line[strlen(line) - 1] == ')')
    {
      line += 4;
      line[strlen(line) - 1] = '\0';
      drhResult = solveEquation(line, i);
      hasRunDrh = true;
    }
    else if(startsWith(line, "hrl(") && line[strlen(line) - 1] == ')')
    {
      line += 4;
      line[strlen(line) - 1] = '\0';
      if(strcmp(line, "drh") == 0)
      {
        if(hasRunDrh)
          printf("%ld\n", drhResult);
        else
        {
          fprintf(stderr, "Error on line %d: drh referenced before being set\n", i + 2);
          return 1;
        }
      }
      else if(isValidInt(line))
        printf("%s\n", line);
      else
      {
        fprintf(stderr, "Error on line %d: invalid argument `%s' to hrl\n", i + 2, line);
        return 1;
      }
    }
    else
    {
      fprintf(stderr, "Error on line %d: invalid command `%s'\n", i + 2, line);
      return 1;
    }
  }
  if(i == lines)
  {
    fprintf(stderr, "Error: `WORLD' not found in program\n");
    return 1;
  }
  return 0;
}

bool startsWith(const char *str, const char *prefix)
{
  return strncmp(prefix, str, strlen(prefix)) == 0;
}

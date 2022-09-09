#include "main.hpp"

int main(int argc, char **argv)
{
  int hasOption = 0;
  OUTPUT_MODE = NUMERIC_OUTPUT;
  
  if(argc < 2)
  {
    printUsage(argv[0]);
    return 1;
  }

  if(strcmp(argv[1], "--help") == 0)
  {
    printHelp(argv[0]);
    return 0;
  }
  
  if(argc > 2)
  {
    hasOption = 1;
    if(strcmp(argv[2], "-a") == 0)
      OUTPUT_MODE = ASCII_OUTPUT;
  }

  char *filename = argv[1];
  ParseResult parseResult = parse(filename);
  run(parseResult);
  return 0;
}

void printUsage(char *filename)
{
  std::cerr << "Usage: " << filename << " FILE [OPTION]\n";
  std::cerr << "Try " << filename << " --help for more information.\n";
}

void printHelp(char *filename)
{
  std::cout << "Usage: " << filename << " FILE [OPTION]\n";
  std::cout << "Run the contents of FILE as Deadfish PDA code. Input is taken from stdin at each step; if multiple characters are given, the first is used and the rest are ignored.\n\n";
  std::cout << "If OPTION is -a, output will be in ASCII. Otherwise, or if it is not supplied, numeric output will be used.\n";
}


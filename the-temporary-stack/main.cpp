#include <codecvt>
#include <fstream>
#include <iostream>
#include <locale>
#include <sstream>
#include <string>

#include "temporary-stack.hpp"

std::wstring readFileAsWstring(const char *filename)
{
  std::wifstream wIfStream(filename);
  wIfStream.imbue(std::locale(std::locale(), new std::codecvt_utf8<wchar_t>));
  std::wstringstream wStringStream;
  wStringStream << wIfStream.rdbuf();
  return wStringStream.str();
}

int main(int argc, char **argv)
{
  if(argc < 2)
  {
    std::cerr << "Usage: " << argv[0] << " FILE\n";
    return 1;
  }
  
  const std::wstring program = readFileAsWstring(argv[1]);
  runTemporaryStack(program);
  return 0;
}
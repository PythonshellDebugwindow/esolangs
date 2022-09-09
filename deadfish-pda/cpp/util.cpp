#include "util.hpp"

CaseMap makeDefaultCaseMap()
{
  CaseMap caseMap = {
    {'X', CaseVector()},
    {'Y', CaseVector()},
    {'Z', CaseVector()},
    {'?', CaseVector()}
  };
  return caseMap;
}

bool isValidInputSymbol(char c)
{
  return c == 'X' || c == 'Y' || c == 'Z' || c == '?';
}

bool isValidStackSymbol(char c)
{
  return c == 'A' || c == 'B' || c == 'C' || c == '!';
}


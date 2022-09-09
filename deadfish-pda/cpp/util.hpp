#ifndef _UTIL_HPP
#define _UTIL_HPP

#include <vector>
#include <map>

#include "case.hpp"

typedef std::vector<Case> CaseVector;
typedef std::map<char, CaseVector> CaseMap;

CaseMap makeDefaultCaseMap();

bool isValidInputSymbol(char c);
bool isValidStackSymbol(char c);

#endif //_UTIL_HPP


#ifndef _PARSE_HPP
#define _PARSE_HPP

#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <cstdlib>
#include <iostream>
#include <set>

#include "case.hpp"
#include "transition.hpp"
#include "parseresult.hpp"
#include "util.hpp"

ParseResult parse(std::string filename);

Transition parseTransitionLine(std::string line, int lineNumber);
BareCase parseCaseLine(std::string line, int lineNumber);

bool validateTransitionLine(std::string line, int lineNumber);
bool validateCaseLine(std::string line, int lineNumber);
bool validateCaseMap(CaseMap caseMap);

void parseError(std::string message, int lineNumber, int column);

#endif //_PARSE_HPP


#include "parseresult.hpp"

ParseResult::ParseResult(Transition defaultTransition, CaseMap caseMap)
{
  this->defaultTransition = defaultTransition;
  this->caseMap = caseMap;
}

Transition ParseResult::getDefaultTransition()
{
  return this->defaultTransition;
}

CaseMap ParseResult::getCaseMap()
{
  return this->caseMap;
}


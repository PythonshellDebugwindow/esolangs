#ifndef _PARSERESULT_HPP
#define _PARSERESULT_HPP

#include "case.hpp"
#include "transition.hpp"
#include "util.hpp"

class ParseResult
{
  private:
    Transition defaultTransition;
    CaseMap caseMap;

  public:
    ParseResult(Transition defaultTransition, CaseMap caseMap);

    Transition getDefaultTransition();
    CaseMap getCaseMap();
};

#endif //_PARSERESULT_HPP


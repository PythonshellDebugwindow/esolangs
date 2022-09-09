#ifndef _CASE_HPP
#define _CASE_HPP

#include "barecase.hpp"
#include "transition.hpp"

class Case : public BareCase
{
  private:
    Transition transition;
    int line;
  
  public:
    Case(int state, char input, char stackTop, Transition transition, int line);
    Case(BareCase bareCase, Transition transition, int line);

    Transition getTransition() const;
    int getLine() const;
};

#endif //_CASE_HPP


#include "case.hpp"

Case::Case(int state, char input, char stackTop, Transition transition, int line) : BareCase(state, input, stackTop)
{
  this->transition = transition;
  this->line = line;
}

Case::Case(BareCase bareCase, Transition transition, int line) : BareCase(bareCase)
{
  this->transition = transition;
  this->line = line;
}

int Case::getLine() const
{
  return this->line;
}

Transition Case::getTransition() const
{
  return this->transition;
}


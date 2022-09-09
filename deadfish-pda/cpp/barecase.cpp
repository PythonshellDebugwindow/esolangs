#include "barecase.hpp"

BareCase::BareCase()
{
  this->state = 0;
  this->input = 0;
  this->stackTop = 0;
}

BareCase::BareCase(int state, char input, char stackTop)
{
  this->state = state;
  this->input = input;
  this->stackTop = stackTop;
}

char BareCase::getInput() const
{
  return this->input;
}

bool operator==(const BareCase& lhs, const BareCase& rhs)
{
  return lhs.state == rhs.state
    && lhs.input == rhs.input
    && lhs.stackTop == rhs.stackTop;
}

bool operator<(const BareCase& lhs, const BareCase& rhs)
{
  return !(lhs == rhs);
}


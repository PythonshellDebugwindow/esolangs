#include "transition.hpp"

Transition::Transition()
{
  this->onActivate = "";
  this->shouldPop = false;
  this->push = 0;
  this->shouldHalt = false;
}

Transition::Transition(std::string onActivate, bool shouldPop, char push, bool shouldHalt)
{
  this->onActivate = onActivate;
  this->shouldPop = shouldPop;
  this->push = push;
  this->shouldHalt = shouldHalt;
}

std::string Transition::getOnActivate() const
{
  return this->onActivate;
}
bool Transition::getShouldPop() const
{
  return this->shouldPop;
}
char Transition::getPush() const
{
  return this->push;
}
bool Transition::getShouldHalt() const
{
  return this->shouldHalt;
}


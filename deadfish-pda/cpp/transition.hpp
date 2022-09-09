#ifndef _TRANSITION_HPP
#define _TRANSITION_HPP

#include <string>
#include <sstream>

class Transition
{
  private:
    std::string onActivate;
    bool shouldPop;
    char push;
    bool shouldHalt;
  
  public:
    Transition();
    Transition(std::string onActivate, bool shouldPop, char push, bool shouldHalt);

    std::string getOnActivate() const;
    bool getShouldPop() const;
    char getPush() const;
    bool getShouldHalt() const;
};

#endif //_TRANSITION_HPP


#include "deadfish.hpp"

int runDeadfish(std::string code, int state)
{
  for(char c : code)
  {
    if(state < 0 || state > 255)
      return -1;
    
    switch(c)
    {
      case 'i':
        ++state;
        break;
      case 'd':
        --state;
        break;
      case 's':
        state *= state;
        break;
      case 'o':
        if(OUTPUT_MODE == NUMERIC_OUTPUT)
          std::cout << state;
        else
          std::cout << (char)state;
        break;
      case '#':
        break;
      default:
        std::cout << "\n";
    }
  }
  
  return state;
}


#include "run.hpp"

void run(ParseResult parseResult)
{
  Transition defaultTransition = parseResult.getDefaultTransition();
  CaseMap caseMap = parseResult.getCaseMap();
  
  int state = 0;
  std::vector<char> stack;

  bool running = true;
  while(running)
  {
    char input = getInput();
    char stackTop = stack.empty() ? '!' : stack.back();
    CaseVector cases = caseMap.at(input);
    BareCase bareCase = BareCase(state, input, stackTop);
    
    auto found = std::find(cases.begin(), cases.end(), bareCase);
    Transition transition = (found != cases.end()) ? found->getTransition() : defaultTransition;
    
    int dfResult = runDeadfish(transition.getOnActivate(), state);
    if(dfResult == -1)
      break;
    else
      state = dfResult;
    
    if(transition.getShouldPop() && !stack.empty())
      stack.pop_back();
    if(transition.getPush() != '#')
      stack.push_back(transition.getPush());
    if(transition.getShouldHalt())
      running = false;
  }
}

char getInput()
{
  std::string input;
  std::cin >> input;
  return (!input.empty() && isValidInputSymbol(input.at(0))) ? input.at(0) : '?';
}


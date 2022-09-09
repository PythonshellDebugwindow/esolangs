#include "parse.hpp"

std::vector<std::string> lines;

ParseResult parse(std::string filename)
{
  std::ifstream fs(filename);
  
  if(!fs.good())
  {
    std::cerr << "Error: " << filename << " does not exist\n";
    exit(1);
  }
  
  std::string line;
  
  while(std::getline(fs, line))
  {
    lines.push_back(line);
  }
  
  if(lines.size() == 0)
  {
    std::cerr << "Error: missing default transition\n";
    exit(1);
  }
  else if((lines.size() & 1) == 0)
  {
    std::cerr << "Error: missing transition\n";
    exit(1);
  }
  
  bool isTransitionLine = true;
  bool parseFailed = false;

  Transition defaultTransition;
  CaseMap caseMap = makeDefaultCaseMap();
  BareCase bareCase;
  
  for(int lineNumber = 0; lineNumber < lines.size(); isTransitionLine = !isTransitionLine, ++lineNumber)
  {
    line = lines.at(lineNumber);
    
    if(isTransitionLine)
    {
      parseFailed |= !validateTransitionLine(line, lineNumber);
      if(!parseFailed)
      {
        Transition transition = parseTransitionLine(line, lineNumber);
        if(lineNumber == 0)
          defaultTransition = transition;
        else
        {
          Case toPush(bareCase, transition, lineNumber);
          caseMap.at(bareCase.getInput()).push_back(toPush);
        }
      }
    }
    else
    {
      parseFailed |= !validateCaseLine(line, lineNumber);
      if(!parseFailed)
      {
        bareCase = parseCaseLine(line, lineNumber);
      }
    }
  }

  parseFailed |= !validateCaseMap(caseMap);
  
  if(parseFailed)
    exit(1);
  
  return ParseResult(defaultTransition, caseMap);
}

Transition parseTransitionLine(std::string line, int lineNumber)
{
  size_t firstSpace = line.find(' ');
  
  std::string onActivate = line.substr(0, firstSpace);
  bool shouldPop = line.at(firstSpace + 1) == '1';
  char stackPush = line.at(firstSpace + 3);
  bool shouldHalt = line.at(firstSpace + 5) == '1';
  return Transition(onActivate, shouldPop, stackPush, shouldHalt);
}

BareCase parseCaseLine(std::string line, int lineNumber)
{
  size_t firstSpace = line.find(' ');
  
  int state = atoi(line.c_str());
  char input = line.at(firstSpace + 1);
  char stackTop = line.at(firstSpace + 3);
  return BareCase(state, input, stackTop);
}

bool validateTransitionLine(std::string line, int lineNumber)
{
  bool valid = true;
  
  size_t firstSpace = line.find(' ');
  if(firstSpace == std::string::npos)
  {
    parseError("no space found in transition line", lineNumber, line.size());
    return false;
  }
  
  if(line.size() != firstSpace + 6)
  {
    parseError("transition line has wrong length", lineNumber, line.size() < firstSpace + 6 ? line.size() - 1 : firstSpace + 6);
    return false;
  }
  
  if(firstSpace == 0)
  {
    parseError("expected Deadfish code or `#'", lineNumber, 0);
    valid = false;
  }
  if(line.at(firstSpace + 1) != '0' && line.at(firstSpace + 1) != '1')
  {
    parseError("expected `0' or `1'", lineNumber, firstSpace + 1);
    valid = false;
  }
  if(line.at(firstSpace + 2) != ' ')
  {
    parseError("expected a space", lineNumber, firstSpace + 2);
    valid = false;
  }
  if(!isValidStackSymbol(line.at(firstSpace + 3)) && line.at(firstSpace + 3) != '#')
  {
    parseError("expected a valid stack symbol or `#'", lineNumber, firstSpace + 3);
    valid = false;
  }
  if(line.at(firstSpace + 4) != ' ')
  {
    parseError("expected a space", lineNumber, firstSpace + 4);
    valid = false;
  }
  if(line.at(firstSpace + 5) != '0' && line.at(firstSpace + 5) != '1')
  {
    parseError("expected `0' or `1'", lineNumber, firstSpace + 5);
    valid = false;
  }
  return valid;
}

bool validateCaseLine(std::string line, int lineNumber)
{
  bool valid = true;
  
  size_t firstSpace = line.find(' ');
  if(firstSpace == std::string::npos)
  {
    parseError("no space found in case line", lineNumber, line.size());
    valid = false;
  }
  
  if(line.size() != firstSpace + 4)
  {
    parseError("case line has wrong length", lineNumber, line.size() < firstSpace + 4 ? line.size() - 1 : firstSpace + 4);
    return false;
  }
  
  if(firstSpace == 0)
  {
    parseError("state is empty", lineNumber, 0);
    valid = false;
  }
  else if(firstSpace > 3)
  {
    parseError("state is too high (maximum is 255)", lineNumber, 0);
    valid = false;
  }
  
  size_t firstNotOf = line.find_first_not_of("0123456789");
  if(firstNotOf != firstSpace)
  {
    parseError("invalid character in state (must be a positive integer)", lineNumber, firstNotOf);
    valid = false;
  }
  
  int state = atoi(line.c_str());
  if(state > 255)
  {
    parseError("state is too high (maximum is 255)", lineNumber, 0);
    valid = false;
  }
  
  if(!isValidInputSymbol(line.at(firstSpace + 1)))
  {
    parseError("expected a valid input symbol", lineNumber, firstSpace + 1);
    valid = false;
  }
  if(line.at(firstSpace + 2) != ' ')
  {
    parseError("expected a space", lineNumber, firstSpace + 2);
    valid = false;
  }
  if(!isValidStackSymbol(line.at(firstSpace + 3)))
  {
    parseError("expected a valid stack symbol", lineNumber, firstSpace + 3);
    valid = false;
  }
  return valid;
}

bool validateCaseMap(CaseMap caseMap)
{
  bool valid = true;
  std::set<Case> seen;
  for(CaseMap::iterator mit = caseMap.begin(); mit != caseMap.end(); ++mit)
  {
    for(Case caseToCheck : mit->second)
    {
      auto found = seen.find(caseToCheck);
      if(found != seen.end())
      {
        std::stringstream ss;
        ss << "duplicate case found (original at line ";
        ss << found->getLine() << ")";
        parseError(ss.str(), caseToCheck.getLine() - 1, 0);
        valid = false;
      }
      seen.insert(caseToCheck);
    }
    seen.clear();
  }
  return valid;
}

void parseError(std::string message, int lineNumber, int column)
{
  std::cerr << "Error on line " << lineNumber + 1 << ": " << message << "\n";
  std::cerr << "  " << lines.at(lineNumber) << "\n";
  std::cerr << std::string(column + 2, ' ') << "^\n";
}


#include <iostream>
#include <random>
#include <sstream>
#include <vector>

#include "temporary-stack.hpp"

std::vector<std::wstring> instructions;
std::vector<long> stack;
bool useAsciiOutput;
int resetCounter;

const std::wstring validFirstChars(L"@v*Oo+:\\€#");

std::random_device commandRandomDevice;
std::mt19937 commandRNG(commandRandomDevice());
std::uniform_int_distribution<std::mt19937::result_type> commandDist(0, 8);

void incrementResetCounter()
{
  ++resetCounter;
  if(resetCounter == 15)
  {
    resetCounter = 0;
    stack.clear();
  }
}

void pushToStack(const long value)
{
  stack.push_back(value);
  while(stack.size() > 1)
  {
    const long bottomValue = stack.at(0);
    const auto secondElement = std::next(stack.begin(), 1);
    const long topSum = std::accumulate(secondElement, stack.end(), 0);
    if(topSum / 2.0 > bottomValue)
    {
      const long outputValue = bottomValue - 1;
      if(useAsciiOutput)
      {
        std::cout << (char)outputValue;
      }
      else
      {
        std::cout << outputValue;
      }
      stack.erase(stack.begin());
    }
    else
    {
      break;
    }
  }
}

void getInstructions(const std::wstring wstring)
{
  std::wstringstream wStringStream(wstring);
  std::wstring word;
  while(getline(wStringStream, word, L' '))
  {
    while(word.size() > 0 &&
          validFirstChars.find(word.at(0)) >= validFirstChars.size())
    {
      word.erase(word.begin());
    }
    instructions.push_back(word);
  }
}

void executeInstruction(size_t& i, std::wstring instruction)
{
  if(instruction.size() == 0)
  {
    return;
  }
  
  const wchar_t initial = instruction.at(0);
  if(initial == L'@')
  {
    std::string userInput;
    getline(std::cin, userInput);
    
    for(const char inputChar : userInput)
    {
      pushToStack((long)inputChar);
    }
  }
  else if(initial == L'O')
  {
    useAsciiOutput = false;
  }
  else if(initial == L'o')
  {
    useAsciiOutput = true;
  }
  else if(initial == L'+')
  {
    if(stack.size() > 0)
    {
      pushToStack(stack.back());
    }
    else
    {
      std::cerr << "Error: cannot run `+` on an empty stack\n";
      exit(1);
    }
  }
  else if(initial == L':')
  {
    if(i + 1 < instructions.size())
    {
      incrementResetCounter();
      ++i;
      const size_t originalStackSize = stack.size();
      while(stack.size() == originalStackSize)
      {
        executeInstruction(i);
      }
    }
    else
    {
      std::cerr << "Error: cannot run `:` with no following instruction\n";
      exit(1);
    }
  }
  else if(initial == L'\\')
  {
    if(i + 1 < instructions.size())
    {
      incrementResetCounter();
      ++i;
      while(stack.size() > 0)
      {
        executeInstruction(i);
      }
    }
    else
    {
      std::cerr << "Error: cannot run `\\` with no following instruction\n";
      exit(1);
    }
  }
  else if(initial == L'€')
  {
    const int randomIndex = commandDist(commandRNG);
    const std::wstring chosenCommand(1, validFirstChars.at(randomIndex));
    executeInstruction(i, chosenCommand);
  }
  else if(instruction.size() >= 2)
  {
    if(initial == L'v')
    {
      std::wstring integerString;
      for(size_t j = 1; j < instruction.size(); ++j)
      {
        const char jthChar = instruction.at(j);
        if(std::isdigit(jthChar))
        {
          integerString += jthChar;
        }
      }
      if(integerString.size() > 0)
      {
        pushToStack(std::stol(integerString));
      }
    }
    else if(initial == L'*')
    {
      for(const char charToPush : instruction.substr(1))
      {
        pushToStack((long)charToPush);
      }
    }
  }
}

void executeInstruction(size_t& i)
{
  executeInstruction(i, instructions.at(i));
}

void runTemporaryStack(const std::wstring program)
{
  getInstructions(program);
  useAsciiOutput = false;
  resetCounter = 0;
  
  for(size_t i = 0; i < instructions.size(); ++i)
  {
    executeInstruction(i);
    incrementResetCounter();
  }
}
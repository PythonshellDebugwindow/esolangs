#ifndef __TEMPORARY_STACK_HPP
#define __TEMPORARY_STACK_HPP

#include <string>

void incrementResetCounter();
void pushToStack(const long value);
void getInstructions(const std::wstring wstring);
void executeInstruction(size_t& i, std::wstring instruction);
void executeInstruction(size_t& i);
void runTemporaryStack(const std::wstring program);

#endif //__TEMPORARY_STACK_HPP
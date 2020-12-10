/*
  Symbols are limited to the max value of unsigned long long
*/
#include <iostream>
#include <vector>

int interpret(const std::string& code);

int main(void)
{
  std::cout << "Enter code: ";
  std::string code;
  std::cin >> code;
  return interpret(code);
}

int interpret(const std::string& code)
{
  char c;
  int i, len = code.size();
  std::vector<unsigned long long> st;
  for(int i = 0; i < len; ++i)
  {
    c = code.at(i);
    if(c == '#')
    {
      st.push_back(0);
    }
    else if(c >= 48 && c <= 57)
    {
      if(st.size() > 0)
      {
        int t = st.back();
        st.pop_back();
        st.push_back(t * 10 + c - 48);
      }
      else
      {
        std::cerr << "Error: Stack empty at `" << c << '`' << std::endl;
        return 1;
      }
    }
    else if(c == '.')
      if(st.size() > 0)
      {
        std::cout << st.back() << std::endl;
        st.pop_back();
      }
      else
      {
        std::cerr << "Error: Stack empty at `.`" << std::endl;
        return 1;
      }
  }
  return 0;
}

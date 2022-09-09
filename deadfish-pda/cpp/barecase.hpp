#ifndef _BARECASE_HPP
#define _BARECASE_HPP

class BareCase
{
  private:
    int state;
    char input;
    char stackTop;
  
  public:
    BareCase();
    BareCase(int state, char input, char stackTop);

    char getInput() const;

    friend bool operator==(const BareCase& lhs, const BareCase& rhs);
    friend bool operator<(const BareCase& lhs, const BareCase& rhs);
};

#endif //_BARECASE_HPP


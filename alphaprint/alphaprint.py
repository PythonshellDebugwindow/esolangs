import re

def interpret(code):
  r = "^(abcdefghijklmnopqrstuvwxyz)*(a(b(c(d(e(f(g(h(i(j(k(l(m(n(o(p(q(r(s(t(u(v(w(x(y(z?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?$"
  if re.match(r, code, re.I):
    last=""
    for i in range(len(code)):
      if code[i].isupper():
        print(end=chr(i % 256))
    print("\n\033[92m=>", i % 256, "\033[0m")
  else:
    raise SyntaxError("Invalid source code" if code.isalpha() else "Invalid character in source code")

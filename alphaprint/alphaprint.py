import sys, re

def alphaprint(code):
  r = "^(abcdefghijklmnopqrstuvwxyz)*(a(b(c(d(e(f(g(h(i(j(k(l(m(n(o(p(q(r(s(t(u(v(w(x(y(z?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?$"
  if re.match(r, code, re.I):
    last=""
    for i in range(len(code)):
      if code[i].isupper():
        print(end=chr(i % 256))
    print("\n=>", i % 256)
  else:
    my_filename = sys.argv[0].replace("\\", "/").split("/")[-1]
    err_msg = "Invalid source code"
    if not code.isalpha():
      err_msg = "Invalid character '"
      err_msg += re.sub("[A-Za-z]", "", code)[0]
      err_msg += "' in source code"
    print(f"{my_filename}: Error: {err_msg}")

if __name__ == "__main__":
  my_filename = sys.argv[0].replace("\\", "/").split("/")[-1]
  if len(sys.argv) <= 1:
    print(f"Usage: {my_filename} [OPTION] FILE")
    print(f"Type '{my_filename} --help' for more information")
  elif "--help" in sys.argv:
    print(f"""Usage: {my_filename} [OPTION] FILE
FILE should not start with a dash.
Options:
    --help       Print this message
    -i, --input  Get the code from STDIN instead of reading from a file""")
  else:
    code = ""
    if "-i" in sys.argv or "--input" in sys.argv:
      code = input("Enter code: ")
    elif any(map(lambda a: a[0] != "-", sys.argv[1:])):
      code = open(tuple(filter(lambda a: a[0] != "-", sys.argv[1:]))[0]).read()
    else:
      print(f"{my_filename}: Error: no FILE provided")
      sys.exit(1)
    alphaprint(code)

import sys, random

def n_refine(code, debug=True):
  try:
    code = list(map(int, code.split()))
  except ValueError:
    my_filename = sys.argv[0].replace("\\", "/").split("/")[-1]
    print(f"{my_filename}: Error: invalid syntax")
    sys.exit(1)
  numbers = {}
  i = 0
  while 0 <= i < len(code):
    a, b = code[i], code[i + 1]
    jump = b if a == 0 else None
    a, b = numbers.get(a, a), numbers.get(b, b)
    if debug:
      print(i, a, b)
    if jump != None:
      i = jump * 2 - 2
    elif random.randint(0, 1) == 0:
      numbers[a] = b
    else:
      numbers[b] = a
    i += 2

if __name__ == "__main__":
  my_filename = sys.argv[0].replace("\\", "/").split("/")[-1]
  if len(sys.argv) <= 1:
    print(f"Usage: {my_filename} [OPTION] FILE")
    print(f"Type '{my_filename} --help' for more information")
  elif "--help" in sys.argv:
    print(f"""Usage: {my_filename} [OPTION] FILE
FILE should not start with a dash.
Options:
    -d, --debug  Use debug mode (prints the current instruction before executing)
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
    n_refine(code, "-d" in sys.argv or "--debug" in sys.argv)

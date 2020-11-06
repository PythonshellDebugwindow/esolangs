import sys

def plus_or_minus(code, is_original):
  accumulator = 18 if is_original else 0
  max_value = 461 if is_original else 255
  for char in code:
    if char == "+":
      accumulator += 1
    if char == "-":
      print(end=chr(accumulator))
      accumulator -= 1
    if accumulator < 0:
      accumulator = max_value
    if accumulator > max_value:
      accumulator = 0
  print()

if __name__ == "__main__":
  my_filename = sys.argv[0].replace("\\", "/").split("/")[-1]
  if len(sys.argv) < 2:
    print(f"Usage: {my_filename} [OPTION] FILE")
  elif "--help" in sys.argv:
    print(f"""Usage: {my_filename} [OPTION] FILE
FILE should not start with a dash.
Options:
    --help          Print this message
    -i, --input     Get the code from STDIN instead of reading from a file
    -o, --original  Use the original version of PlusOrMinus (accumulator starts at 18, goes from 0 to 461""")
  else:
    code = ""
    if "-i" in sys.argv or "--input" in sys.argv:
      code = input("Enter code: ")
    elif any(map(lambda a: a[0] != "-", sys.argv[1:])):
      code = open(tuple(filter(lambda a: a[0] != "-", sys.argv[1:]))[0]).read()
    else:
      print(f"{my_filename}: Error: no FILE provided")
      sys.exit(1)
    plus_or_minus(code, "-o" in sys.argv or "--original" in sys.argv)

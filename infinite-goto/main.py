import sys

from infinite_goto import interpret_infinite_goto


def print_help_text() -> None:
  print(f"""Usage: {sys.argv[0]} FILE
An interpreter for Infinite Goto: <https://esolangs.org/wiki/Infinite_Goto>

Options:
  -h, --help            Print this message and exit.""")

def print_usage() -> None:
  print(f"Usage: {sys.argv[0]} FILE", file=sys.stderr)
  print_more_information()

def print_more_information() -> None:
  print(f"Try '{sys.argv[0]} --help' for more information.", file=sys.stderr)


def parse_arguments() -> str:
  filename = None
  
  for arg in sys.argv[1:]:
    if arg in ("-h", "--help"):
      print_help_text()
      sys.exit(0)
    
    elif filename is None:
      filename = arg
    
    else:
      print("Too many arguments", file=sys.stderr)
      print_more_information()
      sys.exit(1)
  
  if filename is not None:
    try:
      with open(filename) as file:
        return file.read()
    
    except FileNotFoundError:
      print(f"Cannot open {filename}: no such file or directory", file=sys.stderr)
      sys.exit(1)
    
    except IsADirectoryError:
      print(f"{filename} is a directory", file=sys.stderr)
      sys.exit(1)
  
  else:
    print_usage()
    sys.exit(1)


def main() -> None:
  program = parse_arguments()
  interpret_infinite_goto(program)

if __name__ == "__main__":
  main()

import sys
from typing import Tuple

from brainfunc import interpret_brainfunc


def print_help_text() -> None:
  print(f"""Usage: {sys.argv[0]} [options] [FILE | -c PROGRAM]
An interpreter for brainfunc: <https://esolangs.org/wiki/Brainfunc>

Options:
  -c PROGRAM            The program is PROGRAM.
  -d, --debug           Enable the ? command.
  -h, --help            Print this message and exit.""")

def print_usage() -> None:
  print(f"Usage: {sys.argv[0]} [options] [FILE | -c PROGRAM]", file=sys.stderr)
  print_more_information()

def print_more_information() -> None:
  print(f"Try '{sys.argv[0]} --help' for more information.", file=sys.stderr)


def parse_arguments() -> Tuple[str, bool]:
  program = None
  filename = None
  debug_mode = False
  skip_next = True
  
  for i, arg in enumerate(sys.argv):
    if skip_next:
      skip_next = False
      continue
    
    elif arg[0] == "-":
      arg_rest = arg[1:]
      if len(arg_rest) == 0:
        print("Missing option after '-'", file=sys.stderr)
        print_more_information()
        sys.exit(1)
      
      elif arg_rest[0] == "-":
        if arg == "--debug":
          debug_mode = True
        
        elif arg == "--help":
          print_help_text()
          sys.exit(0)
        
        else:
          print(f"Invalid option: '{arg}'", file=sys.stderr)
          print_more_information()
          sys.exit(1)
      
      else:
        for char in arg_rest:
          if char == "c":
            if not skip_next:
              if program is not None:
                print("Too many arguments", file=sys.stderr)
                print_more_information()
                sys.exit(1)
              elif i + 1 == len(sys.argv):
                print("Argument expected for the -c option", file=sys.stderr)
                print_more_information()
                sys.exit(1)
              else:
                program = sys.argv[i + 1]
                skip_next = True
          
          elif char == "d":
            debug_mode = True
          
          elif char == "h":
            print_help_text()
            sys.exit(0)
          
          else:
            print(f"Invalid option: '{char}'", file=sys.stderr)
            print_more_information()
            sys.exit(1)
    
    elif program is None and filename is None:
      filename = arg
    
    else:
      print("Too many arguments", file=sys.stderr)
      print_more_information()
      sys.exit(1)

  if program is None and filename is not None:
    try:
      with open(filename) as file:
        program = file.read()
    except FileNotFoundError:
      print(f"Cannot open {filename}: no such file or directory", file=sys.stderr)
      sys.exit(1)
    except IsADirectoryError:
      print(f"{filename} is a directory", file=sys.stderr)
      sys.exit(1)
  
  if program is None:
    print_usage()
    sys.exit(1)
  
  return program, debug_mode


def main():
  program, debug_mode = parse_arguments()
  interpret_brainfunc(program, debug_mode=debug_mode)

if __name__ == "__main__":
  main()


import sys
from typing import List


def interpret_brainfunc(program: str, *, debug_mode=False) -> None:
  *function_indices, start_index = get_function_indices(program)
  
  #Make sure that a final ^ will be executed
  program += " "
  
  is_reading_number = False
  current_number = ""

  cells = [0]
  current_cell = 0
  call_stack = []

  i = start_index
  while i < len(program):
    char = program[i]
    
    if is_reading_number:
      if char in "0123456":
        current_number += char
      else:
        if len(current_number) == 0:
          print_error(program, i, "no base-7 number was given after `^'")
        elif cells[current_cell] > 0:
          function_index = int(current_number, base=7)
          if function_index < len(function_indices):
            call_stack.append(i)
            i = function_indices[function_index]
            is_reading_number = False
            current_number = ""
            continue
          else:
            index = program.rindex("^", 0, i) + 1
            print_error(program, index, f"function {current_number} is not defined")
    
    elif char == "+":
      cells[current_cell] += 1
      if cells[current_cell] > 255:
        cells[current_cell] = 0

    elif char == ">":
      current_cell += 1
      if current_cell >= len(cells):
        cells.append(0)

    elif char == "<":
      if current_cell > 0:
        current_cell -= 1
      else:
        cells.insert(0, 0)
    
    elif char == "%":
      if cells[current_cell] >= 32 or cells[current_cell] == 10:
        print(end=chr(cells[current_cell]))
      else:
        user_input = input(" ")
        if len(user_input) > 0:
          cells[current_cell] = ord(user_input[0]) % 256
        else:
          cells[current_cell] = 10
    
    elif char == "^":
      if cells[current_cell] > 0:
        is_reading_number = True

    elif char == ")":
      i = call_stack.pop()
      continue
    
    elif char == "?" and debug_mode:
      previous_cells = cells[:current_cell]
      previous_end = ", " if len(previous_cells) > 0 else ""
      
      next_cells = cells[current_cell + 1:]
      next_end = ", " if len(next_cells) > 0 else ""
      
      print(end="\033[38;2;0;255;0m")
      print(str(previous_cells)[:-1], end=previous_end)
      print(f"<{cells[current_cell]}>", end=next_end)
      print(str(next_cells)[1:] + "\033[0;0;0m")
    
    i += 1


def print_error(program: str, index: int, message: str) -> None:
  #Remove extra space
  program = program[:-1]
  
  line_index = 0
  lines = program.split("\n")
  while index >= 0:
    index -= len(lines[line_index]) + 1
    line_index += 1
  line = lines[line_index - 1]
  column = index + len(line) + 1

  print(f"Error on line {line_index}: {message}", file=sys.stderr)
  print("  " + line + "\n" + " " * (2 + column) + "^", file=sys.stderr)
  sys.exit(1)


def get_function_indices(program: str) -> List[int]:
  function_indices = [0]
  last_function_index = 0
  
  while ")" in program[last_function_index:]:
    last_function_index = program.index(")", last_function_index) + 1
    function_indices.append(last_function_index)
  
  return function_indices


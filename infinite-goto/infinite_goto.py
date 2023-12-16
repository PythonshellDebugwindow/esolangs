import random

def interpret_infinite_goto(program: str) -> None:
  lines = program.split("\n")
  line_validity = tuple(map(is_valid_line, lines))
  
  current_line_number = 0
  previous_line_number = 0
  
  current_cell = 0
  cells = {current_cell: 0}
  
  other_special_lines = (0, 20, 21, 28, 29, 30, 31, 32)
  
  while True:
    if not line_validity[current_line_number]:
      previous_line_number = current_line_number
      current_line_number += 1
      if current_line_number == len(lines):
        current_line_number = 0
      continue
    
    effect = current_line_number % 45
    
    if effect == 5:
      user_input = input()
      cells[current_cell] = int(user_input) if user_input.isdigit() else 0
    
    elif effect == 16:
      print(cells[current_cell])
    
    elif effect == 19:
      previous_line_number = current_line_number
      
      jump_base = current_line_number // 45
      jump_offset = 20 if cells[current_cell] > 0 else 21
      current_line_number = jump_base + jump_offset
    
    elif effect == 27:
      previous_line_number = current_line_number
      
      jump_base = current_line_number // 45
      jump_offset = random.randint(28, 32)
      current_line_number = jump_base + jump_offset
    
    elif effect == 35:
      current_cell = previous_line_number % 45
      if current_cell not in cells:
        cells[current_cell] = 0
    
    elif effect not in other_special_lines:
      if effect % 2 == 0:
        cells[current_cell] += 1
      else:
        if cells[current_cell] > 0:
          cells[current_cell] -= 1
    
    
    if effect != 19 and effect != 27:
      previous_line_number = current_line_number
      current_line_number = int(lines[current_line_number])
    
    if current_line_number < 0:
      current_line_number = 0
    elif current_line_number >= len(lines):
      current_line_number = len(lines) - 1


def is_integer(string: str) -> bool:
  if string[0] == "0" and len(string) > 1:
    return False
  else:
    return all(c in "0123456789" for c in string)

def is_valid_line(line: str) -> bool:
  if len(line) > 0 and is_integer(line):
    return True
  
  elif len(line) > 1 and line[0] == "-" and is_integer(line[1:]):
    return True
  
  else:
    return False

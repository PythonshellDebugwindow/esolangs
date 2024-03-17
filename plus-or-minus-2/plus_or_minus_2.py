import sys

def get_num_rows(lines, num_columns):
  columns = ("".join(line[c] for line in lines) for c in range(num_columns))
  return min(len(column.rstrip()) for column in columns)

def interpret_plus_or_minus_2(program):
  lines = program.split("\n")
  
  num_columns = min(len(line.rstrip()) for line in lines)
  num_rows = get_num_rows(lines, num_columns)
  
  current_row = 0
  current_column = 0
  delta_row = 0
  delta_column = 1
  
  accumulator = 0
  
  while 0 <= current_row < num_rows and 0 <= current_column < num_columns:
    command = lines[current_row][current_column]
    
    if command == "+":
      accumulator += 1
      if accumulator == 256:
        accumulator = 0
    
    elif command == "-":
      print(end=chr(accumulator))
      accumulator -= 1
      if accumulator == -1:
        accumulator = 255
    
    elif command == "^":
      delta_row = -1
      delta_column = 0
    
    elif command == ">":
      delta_row = 0
      delta_column = 1
    
    elif command == "V":
      delta_row = 1
      delta_column = 0
    
    elif command == "<":
      delta_row = 0
      delta_column = -1
    
    elif command == "|":
      if accumulator == 0:
        delta_row = 1
        delta_column = 0
    
    else:
      print(f"Error on line {current_row + 1}: invalid character `{command}'", file=sys.stderr)
      print("  " + lines[current_row], file=sys.stderr)
      print(" " * (2 + current_column) + "^", file=sys.stderr)
      sys.exit(1)

    current_row += delta_row
    current_column += delta_column

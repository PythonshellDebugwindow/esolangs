import sys, random

def print_err(s):
  print("\033[38;2;255;0;0m" + s + "\033[0;0;0m")
  sys.exit(1)

if __name__ != "__main__":
  sys.exit()

if len(sys.argv) < 2:
  print("Eso2D: missing file operand")
  sys.exit(1)

filename = sys.argv[1]

try:
  contents = open(filename).read()
  code = contents.split("\n") if len(contents) > 0 else [" "]
except FileNotFoundError:
  print(f"Eso2D: {filename}: no such file or directory")
  sys.exit(1)
except IsADirectoryError:
  print("Eso2D: cannot run a directory")
  sys.exit(1)
else:
  CODE_WIDTH, CODE_HEIGHT = max(map(len, code)), len(code)
  for i in range(CODE_HEIGHT):
    if len(code[i]) < CODE_WIDTH:
      code[i] = code[i].ljust(CODE_WIDTH, " ")
  mem, mem_index, row, col, direction = [0], 0, 0, 0, 1
  # direction: 0 = up, 1 = right, 2 = down, 3 = left
  while True:
    c = code[row][col]
    #print("Char:", c) # DEBUG
    if c == "^":
      direction = 0
    elif c == ">":
      direction = 1
    elif c == "v":
      direction = 2
    elif c == "<":
      direction = 3
    elif c == ",":
      mem[mem_index] += 1
    elif c == "_":
      mem[mem_index] -= 1
    elif c == "X":
      direction += 2
      direction %= 4
    elif c == "~":
      if direction == 0 or direction == 2:
        direction = (0 if direction == 2 else 2)
      else:
        if mem[mem_index] < 85:
          direction = 0
        elif mem[mem_index] > 170:
          direction = 2
    elif c == "`":
      if mem[mem_index] == 0:
        direction = 2
    elif c == "&":
      try:
        mem[mem_index] = ord(input(" ")[0]) % 256
      except IndexError: #Empty input given
        mem[mem_index] = 10
    elif c == "$":
      try:
        mem[mem_index] = int(input(" ")) % 256
      except ValueError:
        mem[mem_index] = 10
    elif c == ":":
      s = input()
      if s:
        for i, c in enumerate(s):
          if mem_index + i == len(mem):
            mem.append(ord(c))
          else:
            mem[mem_index + i] = ord(c)
      else:
        mem[mem_index] = 10
    elif c == "#":
      if mem[mem_index] != 10:
        print(end = chr(mem[mem_index]))
      else:
        print()
    elif c == "*":
      print(mem[mem_index], end = " ")
    elif c == "@":
      break
    elif c == "0":
      mem[mem_index] += 5
    elif c == "1":
      mem[mem_index] += 50
    elif c == "2":
      mem[mem_index] += 97
    elif c == "3":
      mem[mem_index] -= 200
    elif c == "4":
      mem[mem_index] -= 5
    elif c == "5":
      mem[mem_index] -= 50
    elif c == "=":
      # 'Jump' the IP 2 spaces this iteration instead of just 1,
      # but only if mem[mem_index] > 0
      if mem[mem_index] > 0:
        if direction == 0:
          row -= 1
          if row < 0:
            row = CODE_HEIGHT - 1
        elif direction == 1:
          col += 1
          if col >= CODE_WIDTH:
            col = 0
        elif direction == 2:
          row += 1
          if row >= CODE_HEIGHT:
            row = 0
        else:
          col -= 1
          if col < 0:
            col = CODE_WIDTH - 1
    elif c == "O":
        # 'Jump' the IP 2 spaces this iteration instead of just 1
        if direction == 0:
          row -= 1
          if row < 0:
            row = CODE_HEIGHT - 1
        elif direction == 1:
          col += 1
          if col >= CODE_WIDTH:
            col = 0
        elif direction == 2:
          row += 1
          if row >= CODE_HEIGHT:
            row = 0
        else:
          col -= 1
          if col < 0:
            col = CODE_WIDTH - 1
    elif c == "?":
      direction = random.randint(0, 3)
    elif c == "}":
      mem_index += 1
      if mem_index == len(mem):
        mem.append(0)
    elif c == "{":
      mem_index -= 1
      if mem_index == -1:
        print_err(f"Negative memory index at char {col + 1} of line {row + 1}")
    elif c != " ":
      print_err(f"Invalid character '{c}' encountered at char {col + 1} of line {row + 1}")
    
    if direction == 0:
      row -= 1
      if row < 0:
        row = CODE_HEIGHT - 1
    elif direction == 1:
      col += 1
      if col >= CODE_WIDTH:
        col = 0
    elif direction == 2:
      row += 1
      if row >= CODE_HEIGHT:
        row = 0
    else:
      col -= 1
      if col < 0:
        col = CODE_WIDTH - 1
    
    if mem[mem_index] < 0 or mem[mem_index] > 255:
      mem[mem_index] %= 256
  
  print("\n\033[38;2;0;255;0m=>", mem, "\nCP =", mem_index, "\033[0;0;0m")

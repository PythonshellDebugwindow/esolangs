import sys

def print_err(s):
  print("\033[38;2;255;0;0m" + s + "\033[0;0;0m")

cells, cur_cell = [0], 0
def interpret(code, f=(False,[])):
  is_f = f[0]
  global cells, cur_cell
  wants_num, cur_num = False, ""
  if is_f:
    fs = f[1]
  else:
    fs = []
    while ")" in code:
      fs.append(code[:code.index(")")])
      code = code[code.index(")") + 1:]
  for c in code:
    if wants_num:
      if c in "0123456":
        cur_num += c
        continue
      else:
        if cur_num == "":
          print_err("Error: No base-7 number specified after '^'")
          return 1
        elif cells[cur_cell] > 0:
          try:
            if interpret(fs[int(cur_num, base=7)], (True, fs)) == 1:
              return 1
          except IndexError:
            print_err("Error: Not enough functions")
            return 1
          wants_num = False
          cur_num = ""
    if c == "+":
      cells[cur_cell] += 1
      if cells[cur_cell] > 255:
        cells[cur_cell] = 0
    elif c == ">":
      cur_cell += 1
      if cur_cell >= len(cells):
        cells.append(0)
    elif c == "<":
      cur_cell -= 1
      if cur_cell < 0:
        print_err("Error: Negative cell index")
        return 1
    elif c == "%":
      if cells[cur_cell] != 10 and cells[cur_cell] < 32:
        try:
          cells[cur_cell] = ord(input(" ")[0]) % 256
        except IndexError:
          cells[cur_cell] = 10
      else:
        print(end=chr(cells[cur_cell]))
    elif c == "^" and cells[cur_cell] > 0:
      wants_num = True
  if wants_num:
    if cur_num == "":
      print_err("Error: No base-7 number specified after '^'")
      return 1
    elif cells[cur_cell] > 0:
      try:
        if interpret(fs[int(cur_num, base=7)], (True, fs)) == 1:
          return 1
      except IndexError:
        print_err("Error: Not enough functions")
        return 1
      wants_num = False
      cur_num = ""
  if not is_f:
    print("\n\033[38;2;0;255;0m=>", cells, "\033[0;0;0m")
    cells, cur_cell = [0], 0

print("Brainfunc interpreter")

while True:
  interpret(input("> "))

import os
import time

def print_grid(code, x, y):
  os.system("cls" if os.name == "nt" else "clear")
  for i, line in enumerate(code):
    for j, c in enumerate(line):
      if i == y and j == x:
        print(end=f"\033[32m{c}\033[39m")
      else:
        print(end=c)
    print()

def interpretRegimin(code):
  regs = [0, 0, 0]
  ip_x, ip_y, ip_dir = 0, 0, 1 #URDL
  code = code.split("\n")
  CODE_HEIGHT, CODE_WIDTH = len(code) - 1, len(code[0]) - 1
  
  while True:
    c = code[ip_y][ip_x]
    
    if c in "^>v<":
      ip_dir = "^>v<".index(c)
    elif c in "123":
      regs["123".index(c)] += 1
    elif c in "456":
      regs["456".index(c)] -= 1
    elif c in "789":
      if regs["789".index(c)] == 0:
        if ip_dir == 0:
          ip_y -= 1
        elif ip_dir == 1:
          ip_x += 1
        elif ip_dir == 2:
          ip_y += 1
        elif ip_dir == 3:
          ip_x -= 1
    
    print_grid(code, ip_x, ip_y)
    print(*map(lambda n: str(n).ljust(2), regs))
    time.sleep(0.75)
    
    if ip_dir == 0:
      ip_y -= 1
    elif ip_dir == 1:
      ip_x += 1
    elif ip_dir == 2:
      ip_y += 1
    elif ip_dir == 3:
      ip_x -= 1

    if ip_x < 0 or ip_x > CODE_WIDTH or ip_y < 0 or ip_y > CODE_HEIGHT:
      #Get stuck at the wall
      ip_x, ip_y = max(min(ip_x, CODE_WIDTH), 0), max(min(ip_y, CODE_HEIGHT), 0)
      while True:
        print_grid(code, ip_x, ip_y)
        print(*map(lambda n: str(n).ljust(2), regs))
        time.sleep(0.65)

interpretRegimin(open("test.rgm").read())

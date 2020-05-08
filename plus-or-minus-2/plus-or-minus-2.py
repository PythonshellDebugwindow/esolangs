def print_err(s):
  print("\033[38;2;255;0;0m" + s + "\033[0;0;0m")

# The function described in flip45Deg_help.txt
def flip45Deg(l):
  res = []
  temp = ""
  w = min(len(row) for row in l)# + 1
  #print("w=",w,";l=",l)#TEST
  l = [row[:w] for row in l]
  #print("now l=",l)#TEST
  # n=len(l) + len(l)-2
  # n=max(len(row)for row in l)
  n=w
  for i in range(n):
    try:
      res.append([c for c in [row[i] for row in l]])
    except IndexError:
      print("cont'd @",i,"of",n)
      continue
    #print("res[-1(",i,")]=",res[-1])#TEST
    #print("col=",[c for c in[row[i]for row in l]])#TEST
  return res
#print([[1,2,12],[3,4,34],[5,6,56],[7,8,78]])#TEST
#print(flip45Deg([[1,3,5,7],[2,4,6,8],[12,34,56,78]]))#TEST

def plusOrMinus2(code):
  code = code.split("\n")
  print("code:",code,"flip45(code):",flip45Deg(code))
  CODE_WIDTH, CODE_HEIGHT = min(len(row) for row in code), min(len(row) for row in flip45Deg(code))
  code = code[:CODE_HEIGHT]
  code = [row[:CODE_WIDTH] for row in code]
  ip_x, ip_y = 0, 0
  ip_dir = 1 # 0:U, 1:R, 2:D, 3:L
  acc = 0

  while True:
    c = code[ip_y][ip_x]
    if c == "+":
      acc += 1
      if acc > 255:
        acc = 0
    elif c == "-":
      print(end=chr(acc))
      acc -= 1
      if acc < 0:
        acc = 255
    elif c == "^":
      ip_dir = 0
    elif c == ">":
      ip_dir = 1
    elif c == "V":
      ip_dir = 2
    elif c == "<":
      ip_dir = 3
    elif c == "|":
      if acc == 0:
        ip_dir = 2
    else:
      print_err(f"Error: Invalid character '{c}' at line {ip_y}, col {ip_x} in source code")
      break
    
    if ip_dir == 0:
      ip_y -= 1
    elif ip_dir == 1:
      ip_x += 1
    elif ip_dir == 2:
      ip_y += 1
    else:
      ip_x -= 1
    if ip_x < 0 or ip_x >= CODE_WIDTH or ip_y < 0 or ip_y >= CODE_HEIGHT:
      #print("exited @ row",ip_x,"col",ip_y,"w:",CODE_WIDTH,"h:",CODE_HEIGHT)#TEST
      break
  
  print("\n\033[38;2;0;255;0m=>", acc, "\033[0;0;0m")

print("Welcome to PlusOrMinus 2!")
while (choice := input("  1) Run example code\n  2) Run your own code\nChoose one: ")) not in ("1", "2"):
  print("Choose 1 or 2")

if choice == "1":
  fname = "examples/" + input("Enter filename (in /examples folder): ").split("/")[-1].split(".")[0].replace(" ", "-").replace("_", "-") + ".pom2"
  try:
    f = open(fname).read()
    plusOrMinus2(f)
  except (FileNotFoundError, IsADirectoryError):
    print_err("No file named '" + fname + "'")
else:
  print("Enter code, or nothing to run it:")
  code = []
  while (line := input("> ")):
    code.append(line)
  plusOrMinus2("\n".join(code))

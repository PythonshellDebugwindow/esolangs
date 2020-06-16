import pygame, sys
color = sys.stdout.shell

SCREEN_SIZE = 400
PX_PER_ROW = 50
PX_SIZE = SCREEN_SIZE / PX_PER_ROW
visify_vardict = {}

def err(etype, msg):
  color.write(f"{etype}: {msg}\n", "KEYWORD")
  pygame.quit()
  sys.exit()

def parse(code):
  cur = -1 #none=-1, setup=0, click=1, update=2
  setup, click, update = [], [], []
  sections = (setup, click, update)
  for i, line in enumerate(code):
    if "#" in line:
      line = line[:line.index("#")]
    
    if len(line) >= 2 and line[0] == "=":
      if line[1:] in ("setup", "click", "update"):
        cur = ("setup", "click", "update").index(line[1:])
        
      else:
        err("UnrecognizedHeaderError", "Unrecognized header =" + line[1:])
    else:
      if cur > -1:
        #Uses i+1 b/c Visify lines are 1-based
        for _ in range(i + 1):
          sections[cur].append("")
        sections[cur].append(line)
      elif line != "":
        err("HeaderlessLineError", "Line before header")

  return (setup, click, update)

def main():
  pygame.init()
  pygame.display.set_caption("Visify Interpreter")

  code = open("visify-code.vsf").read().splitlines()
  code_setup, code_click, code_update = parse(code)
  del code
  black = (0, 0, 0)
  white = (255, 255, 255)
  
  screen = pygame.display.set_mode((SCREEN_SIZE, SCREEN_SIZE))
  pixels = [[i, [[j, False] for j in range(PX_PER_ROW)]]
            for i in range(PX_PER_ROW)]
  pxrects = [[pygame.Rect(j * PX_SIZE, i * PX_SIZE, PX_SIZE, PX_SIZE)
              for j in range(PX_PER_ROW)] for i in range(PX_PER_ROW)]

  def run(code):
    global visify_vardict
    i = 0
    
    def parse_arg(arg):
      if arg == "":
        err("ValueError", "No argument provided")

      if arg[0] == "!":
        if len(arg) >= 1:
          return 1 if parse_arg(arg[1:]) != 1 else 0
        else:
          err("ValueError", "Nothing to negate")
          
      elif arg.isdigit() or (arg[0] == "-" and arg[1:].isdigit()):
        return int(arg)
      
      elif "+" in arg:
        return sum(map(parse_arg, arg.split("+")))
      
      elif arg[0] == "$":
        if arg[1:] in visify_vardict:
          return visify_vardict[arg[1:]]
        
        elif arg == "$x":
          return pygame.mouse.get_pos()[1] // 8
        
        elif arg == "$y":
          return pygame.mouse.get_pos()[0] // 8
        
        else:
          err("NameError", "Variable '" + arg[1:] + "' not defined")
          
      else:
        err("SyntaxError", f"Invalid syntax line {i + 1} ('{code[i]}')")
    
    line_count = len(code)
    while 0 <= i < line_count:
      line = code[i].split()
      if len(line) == 3:
        if line[0] == "f":
          p1, p2 = map(parse_arg, line[1:])
          if p1 >= 0 and p1 < 50 and p2 >= 0 and p2 < 50:
            pixels[p1][1][p2][1] = True
        
        elif line[0] == "e":
          p1, p2 = map(parse_arg, line[1:])
          if p1 >= 0 and p1 < 50 and p2 >= 0 and p2 < 50:
            pixels[p1][1][p2][1] = False
        
        elif line[0] == "ve":
          visify_vardict[line[1]] = parse_arg(line[2])
          
        elif line[0] == "jf":
          if parse_arg(line[1]) != 0:
            i = parse_arg(line[2])
            continue
          
##        elif line[0]=="DEBUG":print("DEBUG",*line[1:])
##        elif line[0]=="DBGEVAL":print("DEBUG",*map(parse_arg,line[1:]))
        else:
          err("NameError", "Unknown command '" + line[0] + "'")
          
      elif len(line) > 0:
        err("ArgumentError", "Not enough arguments (" + code[i] + ")")
        
      i += 1

  run(code_setup)
  
  while True:
    for evt in pygame.event.get():
      if evt.type == pygame.QUIT:
        pygame.quit()
        sys.exit()

    if pygame.mouse.get_pressed()[0]:
      run(code_click)

    run(code_update)
    
    for i, row in pixels:
      for j, p in row:
        pygame.draw.rect(screen, black if p else white, pxrects[i][j])
    
    pygame.display.flip()

if __name__ == "__main__":
  try:
    main()
  except Exception as e:
    err(type(e).__name__, e.args)
  finally:
    err("Goodbye", "Goodbye")

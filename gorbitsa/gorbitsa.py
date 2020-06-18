from ubyte import UByte

def gorbitsa(code):
  code = code.split()[:256]
  code_len = len(code)
  ic = 0
  x = UByte(0)
  mem = [UByte(0) for _ in range(256)]
  
  def rest(cmd):
    return int(cmd[1:])

  while ic >= 0 and ic < code_len:
    cmd = code[ic][0]
    n = rest(cmd)

    if cmd == "G":
      x = mem[n]

    elif cmd == "O":
      mem[n] = x

    elif cmd == "R":
      x = UByte(int(input(" ")))

    elif cmd == "B":
      if x == 0:
        ic = n
        continue
    
    elif cmd == "I":
      x += n
    
    elif cmd == "T":
      print(x)

    elif cmd == "S":
      x = UByte(n)

    elif cmd == "A":
      x += mem[n]

    elif cmd == "g":
      x = mem[mem[n]]

    elif cmd == "o":
      mem[mem[n]] = x

    elif cmd == "r":
      mem[n] = UByte(int(input(" ")))

    elif cmd == "b":
      if x == 0:
        ic = mem[n]
        continue

    elif cmd == "i":
      mem[n] += x

    elif cmd == "t":
      print(mem[n])

    elif cmd == "s":
      x ^= n

    elif cmd == "a":
      x += mem[mem[n]]
      
    ic += 1

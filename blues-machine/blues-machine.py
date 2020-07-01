from collections import defaultdict
def blues_machine(code):
  code = list(map(lambda l: l.replace(", ", ",").replace("blues ", "blues,").split(","), code.split("\n")))
  clen = len(code)
  mem = defaultdict(lambda: 0)
  i = 0
  while 0 <= i < clen:
    if code[i][0] == "blues":
      a,b,c,d,e,f,g,h = map(int, code[i][1:])
      mem[a] += 1
      mem[b] *= mem[c]
      if mem[e] != 0:
        mem[d] //= mem[e]
      else:
        mem[d] = 0
      if mem[f] != 0:
        i = (h if g else mem[h])
        continue
    elif code[i][0] != "" and code[i][0][0] != "#":
      raise SyntaxError("blues machine: invalid syntax")
    i += 1

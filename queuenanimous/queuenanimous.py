def brkmap(s):
  t = []
  r = {}
  for i, c in enumerate(s):
    if c == "[":
      t.append(i)
    elif c == "]":
      r[t.pop()] = i
  return r

def queuenanimous(code):
  clen = len(code)
  q = []
  i = 0
  b = brkmap(code)
  rb = {v: k for k, v in b.items()}
  while 0 <= i < clen:
    if code[i] == "0":
      q.append(0)
    elif code[i] == "+":
      q.append((q or [0]).pop(0) + 1)
    elif code[i] == "-":
      q.append((q or [0]).pop(0) - 1)
    elif code[i] == ">":
      q.append((q or [0]).pop(0))
    elif code[i] == "[":
      if (q or [0]).pop(0) == 0:
        i = b[i]
    elif code[i] == "]":
      i = rb[i] - 1
    i += 1

def brkmap(s):
  t = []
  r = {}
  for i, c in enumerate(s):
    if c == "[":
      t.push(i)
    elif c == "]":
      r[t.pop()] = i
  return r

def queuenanimous(code):
  clen = len(code)
  q = []
  i = 0
  b = brkmap(code)
  rb = {v: k for k, v in b}
  while 0 <= i < clen:
    if code[i] == "0": q.push(0)
    elif code[i] == "+": q.push(q.pop(0) + 1)
    elif code[i] == "-": q.push(q.pop(0) - 1)
    elif code[i] == ">": q.push(q.pop(0))
    elif code[i] == "[" and q.pop(0) == 0: i = b[i]
    elif code[i] == "]": i = rb[i]
    i += 1

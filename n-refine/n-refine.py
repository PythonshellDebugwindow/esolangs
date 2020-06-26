import random

def n_refine(code, debug=True):
  code = list(map(int, code.split()))
  numbers = {}
  i = 0
  while 0 <= i < len(code):
    a, b = code[i], code[i + 1]
    jump = b if a == 0 else None
    a, b = numbers.get(a, a), numbers.get(b, b)
    if debug:
      print(i, a, b)
    if jump != None:
      i = jump * 2 - 2
    elif random.randint(0, 1) == 0:
      numbers[a] = b
    else:
      numbers[b] = a
    i += 2

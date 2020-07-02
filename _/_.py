def interpret(code):
  clen = len(code)
  i = 0
  while i < clen:
    if code[i] == "%":
      code = code[:-1]
    elif code[i] == "$":
      c = code[-1]
      code = code[:i + 1] + c + code[i + 2:-1]
    elif code[i] == "^":
      if code[-1] == "0":
        i += 1
    elif code[i] == "\":
      code += code[i + 1]
      i += 1
    else:
      code += code[i]
    i += 1

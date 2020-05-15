def interpretPlusOrMinus(code):
  accumulator = 0
  for char in code:
    if char == "+":
      accumulator += 1
    if char == "-":
      print(end = chr(accumulator))
      accumulator -= 1
    if accumulator < 0:
      accumulator = 255
    if accumulator > 255:
      accumulator = 0
  print()

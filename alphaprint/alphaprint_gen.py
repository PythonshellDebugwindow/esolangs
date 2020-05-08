def gen_code_to_print(s):
  alphabet, gen_code = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", ""
  char_codes, chars_done, cur_char, i = [ord(c) % 256 for c in s], 0, 0, 0
  
  while chars_done < len(char_codes):
    if i == char_codes[chars_done]:
      gen_code += alphabet[cur_char + 26]
      chars_done += 1
    else:
      gen_code += alphabet[cur_char]
    cur_char += 1
    cur_char %= 26
    i += 1
    i %= 256
  return gen_code

class UByte:
  def __init__(self, n):
    self.n = n % 256
  
  def __iadd__(self, value):
    if isinstance(value, UByte):
      self.n += value.n
    elif isinstance(value, int):
      self.n += value
    else:
      raise TypeError("cannot add", type(value), "to UByte")
      
    if self.n > 255:
      self.n %= 256
  
  def __isub__(self, value):
    if isinstance(value, UByte):
      self.n -= value.n
    elif isinstance(value, int):
      self.n -= value
    else:
      raise TypeError("cannot subtract", type(value), "from UByte")

    if self.n < 0:
      self.n %= 256

  def __ixor__(self, value):
    if isinstance(value, UByte):
      self.n ^= value.n
    elif isinstance(value, int):
      self.n ^= (value % 256)
    else:
      raise TypeError("cannot perform XOR on", type(value), "and UByte")
  
  def __eq__(self, value):
    if isinstance(value, UByte):
      return self.n == value.n
    elif isinstance(value, int):
      return self.n == value
    else:
      raise TypeError("cannot compare", type(value), "with UByte")
  def __int__(self):
    return self.n

  def __str__(self):
    return str(self.n)

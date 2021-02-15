func gcf(_ x: Int, _ y: Int) -> Int
{
  for i: Int in stride(from: min(x, y), through: 2, by: -1)
  {
    if x % i == 0 && y % i == 0
    {
      return i
    }
  }
  return 1
}

func simplify(numer: Int, denom: Int) -> (Int, Int)
{
  let gcfNumerDenom: Int = gcf(numer, denom)
  let numerSimplified = numer / gcfNumerDenom,
      denomSimplified = denom / gcfNumerDenom
  
  return (numerSimplified, denomSimplified)
}

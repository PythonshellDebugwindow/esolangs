func parseVal(_ val: String, ip: Int, isN: Bool) -> Val?
{
  if let intVal = Int(val)
  {
    if intVal < 0
    {
      if intVal == -1
      {
        return isN ? Val(-1) : Val(ip)
      }
      else if intVal == -2
      {
        return isN ? Val(-2) : Val(valStr: readLine()!)
      }
      else
      {
        return nil
      }
    }
    else
    {
      return Val(intVal)
    }
  }
  else if hasMatchingEnclosingSquareBrackets(val)
  {
    var res = val//[1..<val.count]
    var indirectionCount = 0
    while res.hasPrefix("[")
    {
      res.remove(at: res.startIndex)
      res.remove(at: res.index(before: res.endIndex))
      indirectionCount += 1
    }
    if let intRes = Int(res)
    {
      if intRes < 0
      {
        return nil
      }
      return Val(intRes, indirectionCount)
    }
    else
    {
      return nil
    }
  }
  else
  {
    return nil
  }
}

func hasMatchingEnclosingSquareBrackets(_ val: String) -> Bool
{
  var res = val
  if !res.hasPrefix("[") || !res.hasSuffix("]")
  {
    return false
  }
  else
  {
    while res.hasPrefix("[") && res.hasSuffix("]")
    {
      res.remove(at: res.startIndex)
      res.remove(at: res.index(res.endIndex, offsetBy: -1))
    }
    return !(res.hasPrefix("[") || res.hasSuffix("]"))
  }
}

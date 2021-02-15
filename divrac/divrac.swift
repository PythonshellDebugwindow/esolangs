func divrac(_ code: String, useIO: Bool = true) throws
{
  let lines: [String] = code.components(separatedBy: "\n")
  let numLines: Int = lines.count
  var mem: [Int: Int] = [:]
  var ip: Int = 0
  
  while ip < numLines
  {
    let curLine = lines[ip].replacingOccurrences(of: " ", with: "")
    let vals = curLine.components(separatedBy: ",")
    do
    {
      var vals = [parseVal(vals[0], ip: ip, isN: false),
                  parseVal(vals[1], ip: ip, isN: false),
                  parseVal(vals[2], ip: ip, isN: false),
                  parseVal(vals[3], ip: ip, isN: false),
                  parseVal(vals[4], ip: ip, isN: true)]
      
      var curIndex: Int = 0
      for valOpt: Val? in vals
      {
        guard let val = valOpt else
        {
          throw InvalidValError()
        }
        for _ in 0..<val.indirectionCount
        {
          vals[curIndex] = Val(mem[val.val] ?? 0)
        }
        curIndex += 1
      }
      let a: Val = vals[0]!,
          b: Val = vals[1]!,
          c: Val = vals[2]!,
          d: Val = vals[3]!,
          n: Val = vals[4]!
      
      if b.val == 0 || c.val == 0 || d.val == 0
      {
        throw ZeroDivisionError()
      }
      
      let (numer, denom) = simplify(numer: a.val * d.val,
                                    denom: b.val * c.val)
      
      if n.val >= 0
      {
        mem[n.val] = numer
        mem[n.val + 1] = denom
      }
      else
      {
        if n.val == -1
        {
          /*
            Since lines are 1-indexed in Divrac but arrays are 0-indexed
            in Swift, and the IP will be incremented by 1 at the end of
            the enclosing loop, we must use numer - 2.
          */
          ip = numer - 2
        }
        else if n.val == -2
        {
          print(numer)
        }
        else
        {
          throw InvalidValError()
        }
      }
    }
    catch
    {
      throw InvalidValError()
    }
    ip += 1
  }
}

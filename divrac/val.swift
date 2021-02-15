struct Val : LosslessStringConvertible
{
  let val: Int
  let indirectionCount: Int
  let description: String
  
  init(_ val: Int)
  {
    self.val = val
    self.indirectionCount = 0
    self.description = String(val) + " 0"
  }
  init(_ val: Int, _ indirectionCount: Int)
  {
    self.val = val
    self.indirectionCount = indirectionCount
    self.description = String(val) + " " + String(indirectionCount)
  }
  init(_ description: String)
  {
    let components = description.components(separatedBy: " ")
    self.val = Int(components[0])!
    self.indirectionCount = Int(components[1])!
    self.description = description
  }
  init(valStr: String)
  {
    self.val = Int(valStr)!
    self.indirectionCount = 0
    self.description = valStr + " 0"
  }
}

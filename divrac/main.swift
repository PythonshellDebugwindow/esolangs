import Foundation

do
{
  try divrac("""
  1,7,5,2,0
  [0],1,1,1,-2
  [1],1,1,1,-2
  """)
}
catch _ as InvalidValError
{
  print("Caught InvalidValError which was thrown by divrac")
}

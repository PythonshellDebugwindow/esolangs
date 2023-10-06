const instructionStartIndexesByRow = [5, 2, 1, 0, 0, 0, 1, 2, 5];

function parseCircles(program)
{
  const lines = program.split("\n");
  const circles = [];
  let currentCircle, circleTopRow = 0;
  while(circleTopRow < lines.length)
  {
    currentCircle = "";
    let row = circleTopRow, column = 5, deltaRow = 0, deltaColumn = 1;
    do
    {
      if(row > circleTopRow + 8 || column >= lines[row].length ||
         (lines[row].charAt(column) === " " && column < instructionStartIndexesByRow[row - circleTopRow]))
      {
        const temp = deltaRow;
        deltaRow = deltaColumn;
        deltaColumn = -temp;
        row += deltaRow;
        column += deltaColumn;
      }
      else if(lines[row].charAt(column) === " ")
      {
        const temp = deltaRow;
        deltaRow = -deltaColumn;
        deltaColumn = temp;
        row += deltaRow;
        column += deltaColumn;
      }
      else
      {
        currentCircle += lines[row].charAt(column);
        row += deltaRow;
        column += deltaColumn;
      }
    }
    while(row !== circleTopRow || column !== 5);
    circles.push(currentCircle);
    circleTopRow += 10;
  }
  return circles;
}

module.exports = parseCircles;

const {parseWholeProgram} = require("./parse.js");

const ParseError = require("./parse-error.js");
const runProgram = require("./evaluate.js");


function printParseError(err, program)
{
  const lineNumber = program.substring(0, err.position).split("\n").length - 1;
  const lineStartIndex = program.lastIndexOf("\n", err.position - 1) + 1;
  let lineEndIndex = program.indexOf("\n", err.position);
  if(lineEndIndex === -1) lineEndIndex = program.length;
  const column = err.position - lineStartIndex;

  const line = program.substring(lineStartIndex, lineEndIndex);

  console.error(`Line ${lineNumber + 1}: ${err.message}`);
  console.error("  " + line);
  console.error("  " + " ".repeat(column) + "^");
}

function interpret(program)
{
  try
  {
    const {files, mainFile} = parseWholeProgram(program);
    runProgram(files, mainFile.name);
  }
  catch(err)
  {
    if(err instanceof ParseError)
    {
      if(err.position !== null)
      {
        printParseError(err, program);
      }
      else
      {
        console.error(err.message);
      }
      process.exit(1);
    }
    else
    {
      throw err;
    }
  }
}


module.exports = interpret;

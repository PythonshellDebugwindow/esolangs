const nearley = require("nearley");
const grammar = require("./grammar.js");

const InterpreterError = require("./interpreter-error.js");
const runParsed = require("./evaluate.js");

function logErrorAtPosition(message, program, lineNumber, column)
{
  console.error(`Line ${lineNumber}: ${message}`);
  console.error("  " + program.split("\n")[lineNumber - 1]);
  console.error("  " + "\u3000".repeat(column - 1) + "^");
}

function interpret(program)
{
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  
  try
  {
    parser.feed(program);
  }
  catch(err)
  {
    const match = err.message.match(/line (\d+) col (\d+)/);
    if(match !== null)
    {
      const lineNumber = parseInt(match[1]);
      const column = parseInt(match[2]);
      logErrorAtPosition("Invalid syntax", program, lineNumber, column);
    }
    else
    {
      console.error(err.message);
    }
    process.exit(1);
  }

  if(parser.results.length !== 1)
  {
    console.error("Unexpected end of file");
    process.exit(1);
  }
  
  try
  {
    const result = parser.results[0];
    runParsed(result);
  }
  catch(err)
  {
    if(err instanceof InterpreterError)
    {
      logErrorAtPosition(err.message, program, err.lineNumber, err.column);
      process.exit(1);
    }
    else
    {
      throw err;
    }
  }
}

module.exports = interpret;

const validate = require("./validator.js");
const run = require("./runner.js");

function writeError(error)
{
  const lineNumber = error.lineNumber;
  const errorMessage = error.message || "Invalid syntax";
  console.error(`Error on line ${lineNumber + 1}: ${errorMessage}`);
  console.error("  " + error.line);
  process.exit(1);
}

function interpret(program)
{
  const validationResult = validate(program);
  if(!validationResult.successful)
  {
    writeError(validationResult);
  }
  
  const runResult = run(program);
  if(!runResult.successful)
  {
    writeError(runResult);
  }
}

module.exports = interpret;

const tokenise = require("./tokeniser.js");
const parseFunctions = require("./parser.js");
const getFunctionStatements = require("./functionparser.js");
const parseFunctionStatements = require("./statementparser.js");
const {FunctionCall} = require("./statements.js");
const {validateTokens, validateFunctions} = require("./validator.js");
const {InterpreterException} = require("./util.js");

function printError(error, program, filename)
{
  console.log("\x1b[31m" + filename + ":" + (error.line + 1));
  console.log("  " + program.split("\n")[error.line]);
  console.log("  " + " ".repeat(error.column) + "^");
  console.log("Error: " + error.message + "\x1b[0m");
}

function interpret(program, filename)
{
  const tokeniseResult = tokenise(program);
  if(!tokeniseResult.successful)
  {
    printError(tokeniseResult, program, filename);
    return;
  }

  const validateTokensResult = validateTokens(tokeniseResult.tokens);
  if(!validateTokensResult.successful)
  {
    printError(validateTokensResult, program, filename);
    return;
  }

  const parseFunctionsResult = parseFunctions(tokeniseResult.tokens);
  if(!parseFunctionsResult.successful)
  {
    printError(parseFunctionsResult, program, filename);
    return;
  }
  
  const allFunctions = parseFunctionsResult.functions;
  const validateFunctionsResult = validateFunctions(
    allFunctions, tokeniseResult.tokens
  );
  if(!validateFunctionsResult.successful)
  {
    if(validateFunctionsResult.hasToken)
    {
      printError(validateFunctionsResult, program, filename);
    }
    else
    {
      const message = validateFunctionsResult.message;
      console.log(`\x1b[31mprogram.hgf: ${message}\x1b[0m`);
    }
    return;
  }
  
  const functions = parseFunctionsResult.functions;
  
  const getFunctionStatementsResult = getFunctionStatements(functions);
  if(!getFunctionStatementsResult.successful)
  {
    printError(getFunctionStatementsResult, program, filename);
    return;
  }
  
  const functionArgumentsMap = {};
  for(const functionName in functions)
  {
    functionArgumentsMap[functionName] = functions[functionName].arguments;
  }

  const parseFunctionStatementsResult = parseFunctionStatements(
    getFunctionStatementsResult.result, functionArgumentsMap
  );
  if(!parseFunctionStatementsResult.successful)
  {
    printError(parseFunctionStatementsResult, program, filename);
    return;
  }
  
  try
  {
    const mainCall = new FunctionCall({value: "main"}, []);
    mainCall.bind(
      functionArgumentsMap, parseFunctionStatementsResult.result
    );
    mainCall.evaluate({});
  }
  catch(e)
  {
    if(e instanceof InterpreterException)
    {
      printError(e, program, filename);
      return;
    }
    else
    {
      throw e;
    }
  }
}

module.exports = interpret;
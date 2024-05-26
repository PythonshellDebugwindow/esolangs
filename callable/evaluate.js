const readlineSync = require("readline-sync");

const InterpreterError = require("./interpreter-error.js");
const Types = require("./types.js");

const variables = new Map();

const functions = Object.freeze({
  "CAT": {
    numArguments: 2,
    function: (first, second) => evaluate(first) + evaluate(second)
  },
  "IF-EQ": {
    minArguments: 3,
    function: (first, second, ...body) => {
      if(evaluate(first) === evaluate(second))
      {
        return body.map(evaluate).pop();
      }
      return "";
    },
  },
  "IF-NEQ": {
    minArguments: 3,
    function: (first, second, ...body) => {
      if(evaluate(first) !== evaluate(second))
      {
        return body.map(evaluate).pop();
      }
      return "";
    }
  },
  "INPUT": {
    numArguments: 0,
    function: () => readlineSync.question("", {keepWhitespace: true})
  },
  "PRINT": {
    numArguments: 1,
    function: (rawValue) => {
      const value = evaluate(rawValue);
      process.stdout.write(value);
      return value;
    }
  },
  "SEEK": {
    numArgument: 2,
    function: (rawHaystack, rawNeedle) => {
      const haystack = evaluate(rawHaystack);
      const needle = evaluate(rawNeedle);
      const index = haystack.indexOf(needle);
      if(index === -1)
      {
        return "";
      }
      return haystack.substring(index + needle.length, index + needle.length * 2);
    }
  },
  "SUBTRACT": {
    numArguments: 2,
    function: (rawString, rawToRemove) => {
      const string = evaluate(rawString);
      const toRemove = evaluate(rawToRemove);
      if(string.startsWith(toRemove))
      {
        return string.substring(toRemove.length);
      }
      return string;
    }
  },
  "VAR-GET": {
    numArguments: 1,
    function: (rawVarName) => {
      var varName = evaluate(rawVarName);
      if(variables.has(varName))
      {
        return variables.get(varName);
      }
      return "";
    }
  },
  "VAR-SET": {
    numArguments: 2,
    function: (rawVarName, rawValue) => {
      const varName = evaluate(rawVarName);
      const value = evaluate(rawValue);
      variables.set(varName, value);
      return value;
    }
  },
  "WHILE-EQ": {
    minArguments: 3,
    function: (first, second, ...body) => {
      let result;
      while(evaluate(first) === evaluate(second))
      {
        result = body.map(evaluate).pop();
      }
      return result ?? "";
    }
  },
  "WHILE-NEQ": {
    minArguments: 3,
    function: (first, second, ...body) => {
      let result;
      while(evaluate(first) !== evaluate(second))
      {
        result = body.map(evaluate).pop();
      }
      return result ?? "";
    }
  }
});


function evaluate(value)
{
  if(value.type === Types.STRING)
  {
    return value.value;
  }
  else if(value.type === Types.FUNCTION_CALL)
  {
    return callFunction(value);
  }
  else
  {
    throw new TypeError("Invalid value: " + JSON.stringify(value));
  }
}

function callFunction(value)
{
  if(!Object.hasOwn(functions, value.name))
  {
    throw new InterpreterError(`The function \`${value.name}' does not exist`, value);
  }
  
  const theFunction = functions[value.name];
  
  if("numArguments" in theFunction)
  {
    if(value.arguments.length !== theFunction.numArguments)
    {
      const expected = countNoun(theFunction.numArguments, "argument");
      const received = value.arguments.length;
      throw new InterpreterError(`The function \`${value.name}' expected ${expected}, but received ${received}`, value);
    }
  }
  else if(value.arguments.length < theFunction.minArguments)
  {
    const expected = countNoun(theFunction.minArguments, "argument");
    const received = value.arguments.length;
    throw new InterpreterError(`The function \`${value.name}' expected at least ${expected}, but received ${received}`, value);
  }
  
  return theFunction.function(...value.arguments);
}

function countNoun(count, noun)
{
  return count + " " + noun + (count === 1 ? "" : "s");
}


function evaluateStatements(statements)
{
  statements.map(evaluate);
}

module.exports = evaluateStatements;

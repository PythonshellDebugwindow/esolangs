const readlineSync = require("readline-sync");

const Bytecode = require("./bytecode.js");
const InterpreterError = require("./interpreter-error.js");

function validate(parsed)
{
  const functions = new Map();
  const allIdentifiers = [];
  const functionNames = parsed.map(functionDefinition => functionDefinition.name);
  const numParametersMap = new Map(parsed.map(def => [def.name, def.parameters.length]));
  
  for(const functionDefinition of parsed)
  {
    const localIdentifiers = [];
    const functionName = functionDefinition.name;
    
    for(const parameter of functionDefinition.parameters)
    {
      if(allIdentifiers.includes(parameter.value))
      {
        throw new InterpreterError(`Duplicate identifier \`${parameter.value}' found`, parameter);
      }
      allIdentifiers.push(parameter.value);
      localIdentifiers.push(parameter.value);
    }

    if(allIdentifiers.includes(functionName))
    {
      throw new InterpreterError(`Duplicate identifier \`${functionName}' found`, functionDefinition);
    }
    allIdentifiers.push(functionName);
    functionNames.push(functionName);

    const localScope = {functionNames, numParametersMap, localIdentifiers};
    
    for(const assignment of functionDefinition.body.assignments)
    {
      if(allIdentifiers.includes(assignment.name))
      {
        throw new InterpreterError(`Duplicate identifier \`${assignment.name}' found`, assignment.nameToken);
      }
      assignment.validate(localScope);
      allIdentifiers.push(assignment.name);
      localIdentifiers.push(assignment.name);
    }
    
    for(const output of functionDefinition.body.outputs)
    {
      output.validate(localScope);
    }

    functionDefinition.body.value.validate(localScope);
    
    functions.set(functionName, functionDefinition);
  }
  
  if(!functions.has("冖"))
  {
    console.error("The function `冖' was not defined");
    process.exit(1);
  }
  else if(numParametersMap.get("冖"))
  {
    throw new InterpreterError("The function `冖' cannot take any parameters", functions.get("冖"));
  }
}

function compile(parsed)
{
  let compiled = [];
  let functionStartIndices = new Map();
  
  for(const functionDefinition of parsed)
  {
    functionStartIndices.set(functionDefinition.name, compiled.length);
    
    for(const parameter of functionDefinition.parameters.slice().reverse())
    {
      compiled.push(Bytecode.ASSIGN);
      compiled.push(parameter.value);
    }
    for(const assignment of functionDefinition.body.assignments)
    {
      assignment.compileTo(compiled);
    }
    for(const output of functionDefinition.body.outputs)
    {
      output.compileTo(compiled);
    }
    functionDefinition.body.value.compileTo(compiled);
    compiled.push(Bytecode.RETURN);
  }

  for(let i = 0; i < compiled.length; ++i)
  {
    if(compiled[i] === Bytecode.CALL)
    {
      compiled[i + 1] = functionStartIndices.get(compiled[i + 1]);
    }
  }

  const mainStartIndex = functionStartIndices.get("冖");
  return {compiled, startIndex: mainStartIndex};
}

function outputCacheToString(outputCache)
{
  let numChars = outputCache.length / 8;
  let result = [];
  for(let i = 0; i < numChars; ++i)
  {
    let charCode = 0;
    for(let j = 0; j < 8; ++j)
    {
      charCode |= outputCache[i * 8 + j] << (7 - j);
    }
    result.push(charCode);
  }
  return Buffer.from(result).toString();
}

function runParsed(parsed)
{
  validate(parsed);
  
  const compileResult = compile(parsed);
  const compiled = compileResult.compiled;
  
  let stack = [];
  let localScope = new Map();
  let scopeStack = [];
  let callStack = [compiled.length];
  
  let inputCache = [];
  let outputCache = [];
  
  for(let i = compileResult.startIndex; i < compiled.length; ++i)
  {
    switch(compiled[i])
    {
      case Bytecode.ASSIGN: {
        const name = compiled[++i];
        const value = stack.pop();
        localScope.set(name, value);
        break;
      }
      
      case Bytecode.INPUT_TO_VARIABLE: {
        if(inputCache.length === 0)
        {
          const input = readlineSync.question("", {keepWhitespace: true}) + "\n";
          const inputBuffer = Buffer.from(input);
          for(const byte of inputBuffer)
          {
            for(let i = 7; i >= 0; --i)
            {
              inputCache.push((byte >> i) & 1);
            }
          }
        }
        const name = compiled[++i];
        localScope.set(name, inputCache.shift());
        break;
      }
      
      case Bytecode.OUTPUT:
        outputCache.push(stack.pop());
        if(outputCache.length % 8 === 0)
        {
          const outputString = outputCacheToString(outputCache);
          if(outputString.charAt(0) !== "\ufffd" || outputCache.length === 32)
          {
            process.stdout.write(outputString);
            outputCache.length = 0;
          }
        }
        break;
      
      case Bytecode.RUN_IF_TRUE:
        const condition = stack.pop();
        if(condition)
        {
          ++i;
        }
        else
        {
          const jumpTarget = compiled[i + 1];
          i = jumpTarget - 1;
          stack.push(0);
        }
        break;
      
      case Bytecode.CALL: {
        scopeStack.push(localScope);
        localScope = new Map();
        callStack.push(i + 2);
        const functionStartIndex = compiled[i + 1];
        i = functionStartIndex - 1;
        break;
      }
      
      case Bytecode.AND: {
        const rhs = stack.pop();
        const lhs = stack.pop();
        stack.push(lhs && rhs);
        break;
      }
      
      case Bytecode.OR: {
        const rhs = stack.pop();
        const lhs = stack.pop();
        stack.push(lhs || rhs);
        break;
      }
      
      case Bytecode.NOT: {
        const operand = stack.pop();
        stack.push(1 - operand);
        break;
      }
      
      case Bytecode.ACCESS_VARIABLE: {
        const name = compiled[++i];
        stack.push(localScope.get(name));
        break;
      }
      
      case Bytecode.FALSE:
        stack.push(0);
        break;
      
      case Bytecode.RETURN:
        i = callStack.pop() - 1;
        localScope = scopeStack.pop();
        break;
      
      default:
        throw new TypeError(`Invalid bytecode command ${compiled[i]} at index ${i}`);
    }
  }
  
  if(outputCache.length > 0)
  {
    if(outputCache.length % 8 > 0)
    {
      const paddingLength = 8 - outputCache.length % 8;
      outputCache.push(...new Array(paddingLength).fill(0));
    }
    process.stdout.write(outputCacheToString(outputCache));
  }

  const mainResult = stack.pop();
  if(mainResult !== 0)
  {
    process.exit(1);
  }
}

module.exports = runParsed;

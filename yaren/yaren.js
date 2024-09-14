const readline = require("readline");
const util = require("util");


class InterpreterError extends Error
{
  constructor(message, position)
  {
    super(message);
    this.position = position;
  }
}


function getBracketMap(program)
{
  let bracketMap = new Map();
  let temp = [];

  for(let i = 0; i < program.length; ++i)
  {
    if(program.charAt(i) === '[')
    {
      temp.push(i);
    }
    else if(program.charAt(i) === ']')
    {
      if(temp.length === 0)
      {
        throw new InterpreterError("unmatched `]'", i);
      }
      const match = temp.pop();
      bracketMap.set(match, i);
      bracketMap.set(i, match);
    }
  }

  if(temp.length > 0)
  {
    throw new InterpreterError("`[' was never closed", temp.pop());
  }
  return bracketMap;
}

async function runProgram(program, useIOExtension)
{
  const bracketMap = getBracketMap(program);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = util.promisify(rl.question).bind(rl);

  let cells = [0];
  let cellPointer = 0;

  let ipPosition = 0;
  let ipDelta = 1;

  let inputBuffer = Buffer.alloc(0);
  let inputBufferIndex = 0;

  let outputBuffer = Buffer.alloc(4);
  let outputBufferIndex = 0;

  while(ipPosition >= 0 && ipPosition < program.length)
  {
    switch(program.charAt(ipPosition))
    {
      case "+":
        cells[cellPointer] = 1 - cells[cellPointer];
        ++cellPointer;
        if(cellPointer >= cells.length)
        {
          cells.push(0);
        }
        break;
      
      case "-":
        if(cellPointer === 0)
        {
          cells.unshift(0);
        }
        else
        {
          --cellPointer;
        }
        break;
      
      case "[":
      case "]":
        if(cells[cellPointer] === 0)
        {
          if(program.charAt(ipPosition) === "[" && ipDelta === 1 ||
             program.charAt(ipPosition) === "]" && ipDelta === -1)
          {
            ipPosition = bracketMap.get(ipPosition);
          }
        }
        break;
      
      case "<":
        ipDelta = -1;
        break;
      
      case ">":
        ipDelta = 1;
        break;
      
      case ",":
        if(useIOExtension)
        {
          if(inputBufferIndex >= inputBuffer.length)
          {
            const input = await question("") + "\n";
            inputBuffer = Buffer.from(input);
            inputBufferIndex = 0;
          }

          const byte = inputBuffer[inputBufferIndex];
          for(let i = 0; i < 8; ++i)
          {
            cells[cellPointer + i] = (byte >> i) & 1;
          }
          ++inputBufferIndex;
        }
        break;
      
      case ".":
        if(useIOExtension)
        {
          outputBuffer[outputBufferIndex] = 0;
          for(let i = 0; i < 8; ++i)
          {
            outputBuffer[outputBufferIndex] += cells[cellPointer + i] << i;
          }

          ++outputBufferIndex;
          const subBuffer = outputBuffer.subarray(0, outputBufferIndex);
          if(subBuffer.toString().charAt(0) !== "\ufffd" || outputBufferIndex >= outputBuffer.length)
          {
            process.stdout.write(subBuffer);
            outputBufferIndex = 0;
          }
        }
        break;
    }
    
    ipPosition += ipDelta;
  }

  if(outputBufferIndex > 0)
  {
    process.stdout.write(outputBuffer.subarray(0, outputBufferIndex));
  }

  rl.close();
}

async function interpret(program, useIOExtension)
{
  try
  {
    await runProgram(program, useIOExtension);
  }
  catch(err)
  {
    if(err instanceof InterpreterError)
    {
      const lineNumber = program.substring(0, err.position).split("\n").length - 1;
      const lineStartIndex = program.lastIndexOf("\n", err.position) + 1;
      let lineEndIndex = program.indexOf("\n", err.position);
      if(lineEndIndex === -1) lineEndIndex = program.length;
      const column = err.position - lineStartIndex;

      const line = program.substring(lineStartIndex, lineEndIndex);
      
      console.error(`Line ${lineNumber + 1}: ${err.message}`);
      console.error("  " + line);
      console.error("  " + " ".repeat(column) + "^");
      process.exit(1);
    }
    else
    {
      throw err;
    }
  }
}

module.exports = interpret;

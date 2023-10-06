const fs = require("fs");
const parseCircles = require("./parser.js");

function getChar()
{
  const buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, 0, 1);
  return buffer.toString("utf8");
}

function makeError(i, circlePointer, program, message)
{
  let lineNumber;
  if(i <= 5)
  {
    lineNumber = 0;
  }
  else if(i <= 8)
  {
    lineNumber = 1;
  }
  else if(i <= 13)
  {
    lineNumber = i - 7;
  }
  else if(i <= 16)
  {
    lineNumber = 7;
  }
  else if(i <= 22)
  {
    lineNumber = 8;
  }
  else if(i <= 25)
  {
    lineNumber = 7;
  }
  else if(i <= 30)
  {
    lineNumber = 32 - i;
  }
  else
  {
    lineNumber = 1;
  }
  lineNumber += circlePointer * 10;
  return {
    successful: false,
    line: program.split("\n")[lineNumber],
    lineNumber: lineNumber,
    message: message
  };
}

function run(program)
{
  const circles = parseCircles(program);
  let circlePointer = 0;
  let tape = [0];
  let inputPointer = 0;
  let outputPointer = 0;
  let stack = [];
  
  for(let i = 0; i < circles[circlePointer].length; ++i)
  {
    switch(circles[circlePointer].charAt(i))
    {
      case ">":
        ++inputPointer;
        if(inputPointer >= tape.length)
        {
          tape.push(0);
        }
        break;
      case "<":
        --inputPointer;
        if(inputPointer < 0)
        {
          return makeError(i, circlePointer, program, "Input pointer went out of bounds");
        }
        break;
      case "/":
        ++outputPointer;
        if(outputPointer >= tape.length)
        {
          tape.push(0);
        }
        break;
      case "\\":
        --outputPointer;
        if(outputPointer < 0)
        {
          return makeError(i, circlePointer, program, "Output pointer went out of bounds");
        }
        break;
      case "+":
        ++tape[inputPointer];
        if(tape[inputPointer] === 256)
        {
          tape[inputPointer] = 0;
        }
        break;
      case "-":
        --tape[inputPointer];
        if(tape[inputPointer] === -1)
        {
          tape[inputPointer] = 255;
        }
        break;
      case ".":
        process.stdout.write(String.fromCharCode(tape[outputPointer]));
        break;
      case ",":
        tape[inputPointer] = getChar().charCodeAt(0) % 256;
        break;
      case "v":
        ++circlePointer;
        if(circlePointer >= circles.length)
        {
          circlePointer = 0;
        }
        i = -1;
        break;
      case "^":
        --circlePointer
        if(circlePointer < 0)
        {
          circlePointer = circles.length - 1;
        }
        i = -1;
        break;
      case "#":
        console.log(tape[outputPointer]);
        break;
      case "?":
        if(tape[outputPointer] !== 0)
        {
          ++i;
        }
        break;
      case "*":
        if(tape[outputPointer] === 0)
        {
          ++i;
        }
        break;
      case "$":
        stack.push(tape[outputPointer]);
        break;
      case "~":
        if(stack.length > 0)
        {
          tape[inputPointer] = stack.pop();
        }
        else
        {
          tape[inputPointer] = 0;
        }
        break;
      case "@":
        if(stack.length >= 2)
        {
          stack.unshift(stack.pop());
        }
        break;
      case "r":
        tape[inputPointer] = Math.floor(Math.random() * 256);
        break;
      case "s":
        if(stack.length > 0)
        {
          const number = stack.pop();
          for(let j = 1; j <= number; ++j)
          {
            const cellValue = tape[outputPointer + j];
            process.stdout.write(String.fromCharCode(cellValue));
          }
        }
        break;
      case "%":
        if(stack.length > 0)
        {
          const number = stack.pop();
          const cellValue = tape[outputPointer];
          if(cellValue !== 0)
          {
            stack.push(number % cellValue);
          }
          else
          {
            return makeError(i, circlePointer, program, "Cannot divide by zero");
          }
        }
        break;
      case "x":
        if(stack.length > 0)
        {
          const number = stack.pop();
          if(number > 0)
          {
            circlePointer = (number - 1) % circles.length;
          }
          else
          {
            circlePointer = circles.length - 1;
          }
          i = -1;
        }
        break;
    }
  }
  return {
    successful: true
  };
}

module.exports = run;

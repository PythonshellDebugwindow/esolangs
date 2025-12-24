const readline = require("readline");
const util = require("util");


function exitWithParseError(program, index, message) {
  const lineNumber = program.substring(0, index).split("\n").length;
  const lineStart = program.lastIndexOf("\n", index) + 1;
  const lineEnd = program.indexOf("\n", index);
  const line = program.substring(lineStart, lineEnd >= 0 ? lineEnd : program.length);
  const columnNumber = index - lineStart;
  console.error(`Error on line ${lineNumber}: ${message}`);
  console.error("  " + line);
  console.error("  " + " ".repeat(columnNumber) + "^");
  process.exit(1);
}

function getParenthesisMap(program) {
  const result = {};
  const openingIndices = [];

  for(let i = 0; i < program.length; ++i) {
    if(program[i] === "(") {
      openingIndices.push(i);
    } else if(program[i] === ")") {
      if(openingIndices.length === 0) {
        exitWithParseError(program, i, "unmatched closing parenthesis");
      }
      const matchingIndex = openingIndices.pop();
      result[i] = matchingIndex;
      result[matchingIndex] = i;
    }
  }

  if(openingIndices.length > 0) {
    exitWithParseError(program, openingIndices.pop(), "unmatched opening parenthesis");
  }

  return result;
}

async function interpret(program) {
  const stack = [];
  let valueCell = 0;

  const parenthesisMap = getParenthesisMap(program);
  const loopCounters = [];

  let percentSignCount = 0;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  const question = util.promisify(rl.question).bind(rl, "");

  function assertStackIsNonempty() {
    if(stack.length === 0) {
      exitWithUndefinedBehaviour();
    }
  }

  function exitWithUndefinedBehaviour() {
    console.error("Undefined behaviour!");
    rl.close();
    process.exit(1);
  }

  interpreterLoop:
  for(let i = 0; i < program.length; ++i) {
    switch(program.charAt(i)) {
      case "+":
        stack.push(valueCell);
        valueCell = 0;
        break;

      case "^":
        assertStackIsNonempty();
        valueCell = stack.pop();
        break;

      case "@":
        assertStackIsNonempty();
        valueCell = stack[stack.length - 1];
        break;

      case "%": {
        assertStackIsNonempty();
        const temp = valueCell;
        valueCell = stack.pop();
        stack.push(temp);
        if(percentSignCount < 2) {
          ++percentSignCount;
        }
        break;
      }

      case "_":
        assertStackIsNonempty();
        stack[stack.length - 1] = valueCell;
        valueCell = 0;
        break;

      case "~":
        stack.reverse();
        break;

      case "*":
        valueCell = 0;
        break;

      case "#":
        valueCell = 65;
        break;

      case "?":
        valueCell = 0;
        for(const char of await question()) {
          valueCell += char.charCodeAt(0);
        }
        valueCell %= 256;
        break;

      case "!":
        process.stdout.write(String.fromCharCode(valueCell));
        break;

      case ".":
        break interpreterLoop;

      case "<":
        valueCell = (valueCell + 255) % 256;
        break;

      case ">":
        valueCell = (valueCell + 1) % 256;
        break;

      case "&":
        assertStackIsNonempty();
        stack[stack.length - 1] = (stack[stack.length - 1] + valueCell) % 256;
        valueCell = 0;
        break;

      case "(":
        if(valueCell > 0) {
          loopCounters.push(valueCell);
        } else {
          i = parenthesisMap[i];
        }
        break;

      case ")":
        if(loopCounters[loopCounters.length - 1] > 1) {
          --loopCounters[loopCounters.length - 1];
          i = parenthesisMap[i];
        } else {
          loopCounters.pop();
        }
        break;

      case ";":
        if(loopCounters.length === 0) {
          exitWithUndefinedBehaviour();
        }
        loopCounters.pop();
        for(let depth = 1; i < program.length; ++i) {
          if(program.charAt(i) === "(") {
            ++depth;
          } else if(program.charAt(i) === ")") {
            --depth;
            if(depth === 0) {
              break;
            }
          }
        }
        break;
    }
  }

  rl.close();

  if(percentSignCount >= 2 && program.charAt(program.length - 1) !== ".") {
    console.error("Error: more than one `%' was used, but the program didn't end with `.'");
    process.exit(1);
  }
}


module.exports = interpret;

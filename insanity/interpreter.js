const readline = require("readline");
const util = require("util");

const InterpreterError = require("./interpreter-error.js");
const { CommandType, parse } = require("./parser.js");
const tokenise = require("./tokeniser.js");
const getVariableIndex = require("./utils.js");

function evaluate(expression, variables, program) {
  const stack = [];
  for(const command of expression) {
    if(command.type === CommandType.CONSTANT) {
      stack.push({ value: command.value, position: command.position });
    } else if(command.type === CommandType.VARIABLE) {
      stack.push({ value: variables[command.index], position: command.position });
    } else if(command.type === CommandType.OPERATOR) {
      const { value: rhs, position: rhsPosition } = stack.pop();
      const { value: lhs } = stack.pop();
      switch(command.operator) {
        case '+':
          stack.push({ value: lhs.add(rhs) });
          break;

        case '-':
          stack.push({ value: lhs.subtract(rhs) });
          break;

        case '*':
          stack.push({ value: lhs.multiply(rhs) });
          break;

        case '/':
          if(rhs.isZero()) {
            throw new InterpreterError(program, rhsPosition, "division by zero");
          }
          stack.push({ value: lhs.divide(rhs) });
          break;

        default:
          throw new RangeError(`Internal error: invalid operator \`${operator}'`);
      }
    } else if(command.type === CommandType.NEGATION) {
      const { value, position } = stack.pop();
      stack.push({ value: value.negate(), position });
    } else {
      throw new RangeError(`Internal error: invalid command type \`${command.type}'`);
    }
  }
  return stack[0].value;
}

async function interpret(program, options) {
  const tokenised = tokenise(program);
  const parsed = parse(tokenised, options);

  if(options.output !== null) {
    for(const variable of options.output) {
      if(getVariableIndex(variable) >= parsed[0].length) {
        return { message: `insanity: cannot output undefined variable \`${variable}'` };
      }
    }
  }

  const output = options.output?.split("").map(variable => getVariableIndex(variable));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  const waitForInput = () => new Promise(resolve => rl.question("", resolve));

  const variables = parsed[0].map(compiled => evaluate(compiled, [], program));
  const remainingLines = parsed.slice(1);

  while(true) {
    if(!output) {
      process.stdout.write(variables.join(" "));
    } else if(output.length > 0) {
      process.stdout.write(output.map(index => variables[index]).join(" "));
    }
    if(options.pause) {
      await waitForInput();
    } else if((output ?? variables).length > 0) {
      process.stdout.write("\n");
    }
    for(const line of remainingLines) {
      const oldVariables = variables.slice();
      for(let i = 0; i < line.length; ++i) {
        variables[i] = evaluate(line[i], oldVariables, program);
      }
    }
  }
}

module.exports = interpret;

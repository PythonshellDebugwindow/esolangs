const InterpreterError = require("./interpreter-error.js");
const getVariableIndex = require("./utils.js");

const TokenType = Object.freeze({
  VALUE: Symbol('VALUE'),
  OPERATOR: Symbol('OPERATOR')
});

function tokenise(program) {
  const lines = [];
  let curLine = [];
  let curTokens = [];
  let curValue = null;
  let numVariables = 0;

  const maybePushCurValue = i => {
    if(curValue !== null) {
      if(curValue === ".") {
        throw new InterpreterError(program, i - 1, "invalid syntax");
      }
      curTokens.push({ type: TokenType.VALUE, value: curValue, position: i - curValue.length });
      curValue = null;
    }
  };

  for(let i = 0; i <= program.length; ++i) {
    if(i === program.length || program[i] === "\n") {
      maybePushCurValue(i);
      if(curTokens.length > 0) {
        if(curTokens[curTokens.length - 1].type === TokenType.OPERATOR) {
          throw new InterpreterError(program, i, "unexpected end of input");
        }
        curLine.push(curTokens);
        curTokens = [];
      } else if(curLine.length > 0) {
        throw new InterpreterError(program, i, "unexpected end of input");
      }
      if(lines.length === 0) {
        if(curLine.length > 52) {
          throw new InterpreterError(program, curLine[52][0].position, "too many variable definitions");
        }
        numVariables = curLine.length;
      } else if(curLine.length > 0 && curLine.length !== numVariables) {
        if(curLine.length > numVariables) {
          let errorIndex = program.lastIndexOf("\n", i - 1) + 1;
          for(let j = 0; j < numVariables; ++j) {
            errorIndex = program.indexOf(",", errorIndex) + 1;
          }
          const nextCharRegex = /\S/g;
          nextCharRegex.lastIndex = errorIndex;
          nextCharRegex.test(program);
          errorIndex = nextCharRegex.lastIndex - 1;
          throw new InterpreterError(program, errorIndex, "too many variable assignments");
        } else {
          throw new InterpreterError(program, i, "not enough variable assignments");
        }
      }
      if(curLine.length > 0 || lines.length === 0) {
        for(const tokens of curLine) {
          for(const token of tokens) {
            if(/^[A-Za-z]$/.test(token.value)) {
              if(getVariableIndex(token.value) >= numVariables) {
                throw new InterpreterError(program, token.position, "variable is not defined");
              } else if(lines.length === 0) {
                throw new InterpreterError(program, token.position, "cannot initialise a variable using a variable");
              }
            }
          }
        }
        lines.push(curLine);
        curLine = [];
      }
    } else if(program[i] === ",") {
      maybePushCurValue(i);
      if(curTokens.length === 0 || curTokens[curTokens.length - 1].type !== TokenType.VALUE) {
        throw new InterpreterError(program, i, "unexpected comma");
      }
      curLine.push(curTokens);
      curTokens = [];
    } else if(/[+*/-]/.test(program[i])) {
      if(curValue === null && curTokens[curTokens.length - 1]?.type !== TokenType.VALUE && program[i] !== "-") {
        throw new InterpreterError(program, i, "unexpected operator");
      }
      maybePushCurValue(i);
      curTokens.push({ type: TokenType.OPERATOR, value: program[i] });
    } else if(/[A-Za-z0-9.]/.test(program[i])) {
      const isVariable = /[A-Za-z]/.test(program[i]);
      if(curValue !== null) {
        if(isVariable) {
          throw new InterpreterError(program, i, "invalid syntax");
        }
        curValue += program[i];
      } else if(curTokens[curTokens.length - 1]?.type === TokenType.VALUE) {
        throw new InterpreterError(program, i, "invalid syntax");
      } else if(isVariable) {
        curTokens.push({ type: TokenType.VALUE, value: program[i], position: i });
      } else {
        curValue = program[i];
      }
    } else if(/\s/.test(program[i])) {
      maybePushCurValue(i);
    } else {
      throw new InterpreterError(program, i, "invalid character");
    }
  }

  return lines;
}

module.exports = tokenise;

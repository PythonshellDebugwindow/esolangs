const { NativeFloat, Rational } = require("./arithmetic.js");
const getVariableIndex = require("./utils.js");

const CommandType = Object.freeze({
  CONSTANT: Symbol('CONSTANT'),
  VARIABLE: Symbol('VARIABLE'),
  OPERATOR: Symbol('OPERATOR'),
  NEGATION: Symbol('NEGATION')
});

class Constant {
  constructor(token, isNegative, arithmeticClass) {
    this.value = arithmeticClass.fromLiteral(token.value, isNegative ? -1 : 1);
    this.position = token.position;
  }
  compileTo(result) {
    result.push({ type: CommandType.CONSTANT, value: this.value, position: this.position });
  }
}

class Variable {
  constructor(token, isNegative) {
    this.index = getVariableIndex(token.value);
    this.isNegative = isNegative;
    this.position = token.position;
  }
  compileTo(result) {
    result.push({ type: CommandType.VARIABLE, index: this.index, position: this.position });
    if(this.isNegative) {
      result.push({ type: CommandType.NEGATION });
    }
  }
}

class Operator {
  constructor(operator, lhs, rhs) {
    this.operator = operator;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  compileTo(result) {
    this.lhs.compileTo(result);
    this.rhs.compileTo(result);
    result.push({ type: CommandType.OPERATOR, operator: this.operator });
  }
}

function makeValueNode(tokens, i, arithmeticClass) {
  let isNegative = false;
  while(tokens[i].value === "-") {
    isNegative = !isNegative;
    ++i;
  }
  const token = tokens[i];
  const isNumeric = /[0-9]/.test(token.value);
  const node = isNumeric ? new Constant(token, isNegative, arithmeticClass) : new Variable(token, isNegative);
  return [node, i + 1];
}

function parse(lines, options) {
  const arithmeticClass = options.useNativeArithmetic ? NativeFloat : Rational;
  const result = [];
  for(const line of lines) {
    const lineExpressions = [];
    for(const tokens of line) {
      let [node, i] = makeValueNode(tokens, 0, arithmeticClass);
      while(i < tokens.length) {
        const operation = tokens[i].value;
        const [newRhs, newI] = makeValueNode(tokens, i + 1, arithmeticClass);
        if((node.operator === '+' || node.operator === '-') && (operation === '*' || operation === '/')) {
          node.rhs = new Operator(operation, node.rhs, newRhs);
        } else {
          node = new Operator(operation, node, newRhs);
        }
        i = newI;
      }
      const compiled = [];
      node.compileTo(compiled);
      lineExpressions.push(compiled);
    }
    result.push(lineExpressions);
  }
  return result;
}

module.exports = { CommandType, parse };

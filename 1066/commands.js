const Bytecode = require("./bytecode.js");
const InterpreterError = require("./interpreter-error.js");


class Assignment
{
  constructor(nameToken, value)
  {
    this.name = nameToken.value;
    this.nameToken = nameToken;
    this.value = value;
  }
  validate(localState)
  {
    this.value.validate(localState);
  }
  compileTo(compiled)
  {
    this.value.compileTo(compiled);
    compiled.push(Bytecode.ASSIGN);
    compiled.push(this.name);
  }
}

class InputToVariable
{
  constructor(nameToken)
  {
    this.name = nameToken.value;
    this.nameToken = nameToken;
  }
  validate()
  {}
  compileTo(compiled)
  {
    compiled.push(Bytecode.INPUT_TO_VARIABLE);
    compiled.push(this.name);
  }
}

class Output
{
  constructor(value)
  {
    this.value = value;
  }
  validate(localState)
  {
    this.value.validate(localState);
  }
  compileTo(compiled)
  {
    this.value.compileTo(compiled);
    compiled.push(Bytecode.OUTPUT);
  }
}

class RunIfTrue
{
  constructor(condition, expression)
  {
    this.condition = condition;
    this.expression = expression;
  }
  validate(localState)
  {
    this.condition.validate(localState);
    this.expression.validate(localState);
  }
  compileTo(compiled)
  {
    this.condition.compileTo(compiled);
    compiled.push(Bytecode.RUN_IF_TRUE);
    const jumpTargetIndex = compiled.length;
    compiled.push(-1);
    this.expression.compileTo(compiled);
    compiled[jumpTargetIndex] = compiled.length;
  }
}

class Call
{
  constructor(nameToken, parameters)
  {
    this.name = nameToken.value;
    this.nameToken = nameToken;
    this.arguments = parameters;
  }
  validate(localState)
  {
    this.arguments.forEach(arg => arg.validate(localState));
    
    if(!localState.functionNames.includes(this.name))
    {
      if(localState.localIdentifiers.includes(this.name))
      {
        throw new InterpreterError(`\`${this.name}' is a variable`, this.nameToken);
      }
      else
      {
        throw new InterpreterError(`\`${this.name}' is not defined`, this.nameToken);
      }
    }
    
    const numParameters = localState.numParametersMap.get(this.name);
    if(this.arguments.length !== numParameters)
    {
      const expected = `${numParameters} argument${numParameters === 1 ? "" : "s"}`;
      const received = this.arguments.length;
      throw new InterpreterError(`The function \`${this.name}' expected ${expected}, but received ${received}`, this.nameToken);
    }
  }
  compileTo(compiled)
  {
    this.arguments.forEach(arg => arg.compileTo(compiled));
    compiled.push(Bytecode.CALL);
    compiled.push(this.name);
  }
}

class And
{
  constructor(lhs, rhs)
  {
    this.lhs = lhs;
    this.rhs = rhs;
  }
  validate(localState)
  {
    this.lhs.validate(localState);
    this.rhs.validate(localState);
  }
  compileTo(compiled)
  {
    this.lhs.compileTo(compiled);
    this.rhs.compileTo(compiled);
    compiled.push(Bytecode.AND);
  }
}

class Or
{
  constructor(lhs, rhs)
  {
    this.lhs = lhs;
    this.rhs = rhs;
  }
  validate(localState)
  {
    this.lhs.validate(localState);
    this.rhs.validate(localState);
  }
  compileTo(compiled)
  {
    this.lhs.compileTo(compiled);
    this.rhs.compileTo(compiled);
    compiled.push(Bytecode.OR);
  }
}

class Not
{
  constructor(value)
  {
    this.value = value;
  }
  validate(localState)
  {
    this.value.validate(localState);
  }
  compileTo(compiled)
  {
    this.value.compileTo(compiled);
    compiled.push(Bytecode.NOT);
  }
}

class VariableReference
{
  constructor(nameToken)
  {
    this.name = nameToken.value;
    this.nameToken = nameToken;
  }
  validate(localState)
  {
    if(!localState.localIdentifiers.includes(this.name))
    {
      if(localState.functionNames.includes(this.name))
      {
        throw new InterpreterError(`\`${this.name}' is a function`, this.nameToken);
      }
      else
      {
        throw new InterpreterError(`\`${this.name}' is not defined`, this.nameToken);
      }
    }
  }
  compileTo(compiled)
  {
    compiled.push(Bytecode.ACCESS_VARIABLE);
    compiled.push(this.name);
  }
}

const False = Object.freeze({
  validate: () => {},
  compileTo: (compiled) => compiled.push(Bytecode.FALSE)
});


module.exports = {
  Assignment, InputToVariable, Output,
  RunIfTrue, Call, And, Or, Not, VariableReference, False
};

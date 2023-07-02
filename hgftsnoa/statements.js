const {noReturnValue, InterpreterException} = require("./util.js");

function makeNoReturnError(token)
{
  return new InterpreterException(token, `The function '${token.value}' was used in an expression but did not return a value`);
}

function outputValue(value)
{
  console.log(value.toString());
}

class Nilad
{
  constructor(token)
  {
    this.token = token;
  }
  evaluate(context)
  {
    if(this.isVariable())
    {
      if(this.token.value in context)
      {
        return context[this.token.value];
      }
      else
      {
        throw new InterpreterException(this.token, `The name '${this.token.value}' is not defined`);
      }
    }
    else
    {
      return this.token.value;
    }
  }
  isVariable()
  {
    return this.token.type === "ID";
  }
  getToken()
  {
    return this.token;
  }
  toString()
  {
    return `Nilad(${this.token.type}, ${this.token.value})`;
  }
}

class Operation
{
  constructor(operation, operationToken, ...operationArguments)
  {
    this.operation = operation;
    this.operationToken = operationToken;
    this.arguments = operationArguments;
  }
  evaluate(context)
  {
    const evaluatedArguments = [];
    for(const argument of this.arguments)
    {
      const evaluated = argument.evaluate(context);
      if(evaluated === noReturnValue)
      {
        throw makeNoReturnError(argument.functionCallToken);
      }
      else
      {
        evaluatedArguments.push(evaluated);
      }
    }
    return this.operation(...evaluatedArguments, this.operationToken, context);
  }
  getToken()
  {
    return this.operationToken;
  }
  toString()
  {
    const functionStr = this.operation.toString();
    const operationName = functionStr.substring(9, functionStr.indexOf("("));
    const argumentsStr = this.arguments.map(x => x.toString()).join(", ");
    return `Operation(${operationName}, ${argumentsStr})`;
  }
}

class AssignmentOperation
{
  constructor(variableNameToken, expression)
  {
    this.variableNameToken = variableNameToken;
    this.expression = expression;
  }
  evaluate(context)
  {
    const evaluated = this.expression.evaluate(context);
    
    if(evaluated === noReturnValue)
    {
      throw makeNoReturnError(this.expression.functionCallToken);
    }
    else
    {
      context[this.variableNameToken.value] = evaluated;
    }
  }
  toString()
  {
    const variableName = this.variableNameToken.value;
    const expressionStr = this.expression.toString();
    return `AssignmentOperation(${variableName}, ${expressionStr})`
  }
}

class IfStatement
{
  constructor(condition, body, elseBody = null)
  {
    this.condition = condition;
    this.body = body;
    this.elseBody = elseBody;
  }
  evaluate(context)
  {
    const evaluatedCondition = this.condition.evaluate(context);
    
    if(evaluatedCondition === noReturnValue)
    {
      throw makeNoReturnError(this.condition.functionCallToken);
    }
    else if(evaluatedCondition !== 0n && evaluatedCondition !== "")
    {
      for(const statement of this.body)
      {
        const evaluated = statement.evaluate(context);
        if(evaluated instanceof ReturnStatement)
        {
          return evaluated;
        }
        else if(evaluated !== undefined && evaluated !== noReturnValue)
        {
          outputValue(evaluated);
        }
      }
    }
    else if(this.elseBody !== null)
    {
      for(const statement of this.elseBody)
      {
        const evaluated = statement.evaluate(context);
        if(evaluated instanceof ReturnStatement)
        {
          return evaluated;
        }
        else if(evaluated !== undefined && evaluated !== noReturnValue)
        {
          outputValue(evaluated);
        }
      }
    }
  }
  toString()
  {
    const conditionStr = this.condition.toString();
    const bodyStr = this.body.map(x => x.toString()).join(", ");
    const elseStr = (this.elseBody || []).map(x => x.toString()).join(", ");
    return `IfStatement(${conditionStr}, [${bodyStr}], [${elseStr}])`
  }
}

class ReturnStatement
{
  constructor(operation)
  {
    this.operation = operation;
    this.returnedValue = null;
  }
  evaluate(context)
  {
    const evaluated = this.operation.evaluate(context);
    
    if(evaluated === noReturnValue)
    {
      throw makeNoReturnError(this.operation.functionCallToken);
    }
    else
    {
      this.returnedValue = evaluated;
      return this;
    }
  }
  getReturnedValue()
  {
    return this.returnedValue;
  }
  toString()
  {
    return `ReturnStatement(${this.operation.toString()})`;
  }
}

class FunctionCall
{
  constructor(functionCallToken, functionArguments)
  {
    this.functionCallToken = functionCallToken;
    this.functionName = functionCallToken.value;
    this.argumentOperations = functionArguments;
  }
  bind(functionArgumentsMap, functionStatementsMap)
  {
    if(this.functionName in functionStatementsMap)
    {
      this.argumentNames = functionArgumentsMap[this.functionName];
      this.statements = functionStatementsMap[this.functionName];
      
      if(this.argumentNames.length !== this.argumentOperations.length)
      {
        throw new Error(`The function ${this.functionName} needs ${this.argumentNames.length} parameters but was given ${this.argumentOperations.length} upon creation (this should never be reached`);
      }
    }
    else
    {
      throw new Error(`The function ${this.functionName} is not defined (this should never be reached)`);
    }
  }
  evaluate(context)
  {
    const newContext = {};
    for(let i = 0; i < this.argumentNames.length; ++i)
    {
      newContext[this.argumentNames[i]] = this.argumentOperations[i].evaluate(context);
    }
    
    for(const statement of this.statements)
    {
      const evaluated = statement.evaluate(newContext);
      if(statement instanceof ReturnStatement ||
         evaluated instanceof ReturnStatement)
      {
        return evaluated.getReturnedValue();
      }
      else if(evaluated !== undefined && evaluated !== noReturnValue)
      {
        outputValue(evaluated);
      }
    }
    
    return noReturnValue;
  }
  toString()
  {
    const functionName = this.functionCallToken.value;
    const argumentsStr = this.argumentOperations.map(x => x.toString());
    const callStr = [functionName, ...argumentsStr].join(", ");
    return `FunctionCall(${callStr})`;
  }
}

module.exports = {
  Nilad, Operation, AssignmentOperation,
  IfStatement, ReturnStatement, FunctionCall
};
const {
  Nilad, Operation, AssignmentOperation,
  IfStatement, ReturnStatement, FunctionCall
} = require("./statements.js");
const {
  keywords, globalKeywordRegexps, makeError, InterpreterException
} = require("./util.js");

const operations = {
  IF:       0,
  IF_ELSE:  1,
  RETURN:   2,
  INDEX:    3,
  ASSIGN:   4,
  COMPARE:  5,
  AND:      6,
  MINUS:    7,
  FUNCTION: 8
};

function indexOperator(left, right, operatorToken)
{
  const leftType = typeof left;
  const rightType = typeof right;

  if(leftType === "string" && rightType === "bigint")
  {
    if(right >= 0)
    {
      if(right < left.length)
      {
        return left[right];
      }
      else
      {
        return "";
      }
    }
    else
    {
      if(Math.abs(right) <= left.length)
      {
        return left.charAt(left.length + right);
      }
      else
      {
        return "";
      }
    }
  }
  else
  {
    const rightTypeName = (rightType === "bigint") ? "integer" : rightType;
    throw new InterpreterException(operatorToken, `Unsupported operand types for TTTT: ${leftType} and ${rightTypeName}`);
  }
}
function comparisonOperator(first, second)
{
  return (first === second) ? 1n : 0n;
}
function andOperator(left, right)
{
  const leftType = typeof left;
  const rightType = typeof right;

  if(leftType === "bigint")
  {
    if(rightType === "bigint")
    {
      return left + right;
    }
    else if(/^[0-9]+$/.test(right))
    {
      return left + BigInt(right);
    }
    else
    {
      //right is an invalid integer, so it is treated as zero
      return left;
    }
  }
  else
  {
    return left + right;
  }
}
function minusOperator(value, _token, context)
{
  if("bigint" === typeof value)
  {
    return -value;
  }
  else
  {
    //Expand keywords before variables
    value = value.replace(globalKeywordRegexps.AND, "AND")
                 .replace(globalKeywordRegexps.OR, "OR")
                 .replace(globalKeywordRegexps.THEN, "%HEN")
                 .replace(globalKeywordRegexps.IS, "IS")
                 .replace(globalKeywordRegexps.IT, "I%")
                 .replace(globalKeywordRegexps.IF, "IF")
                 .replace(globalKeywordRegexps.GOODBYE, "GOODBYE")
                 .replace(globalKeywordRegexps.HELLO, "HELLO")
                 .replace(/%/g, "T");
    
    //Expand variables (expand the variables with the longest names first)
    const variableNames = Object.keys(context).sort();
    for(let i = variableNames.length - 1; i >= 0; --i)
    {
      const variableNameRegexp = new RegExp(variableNames[i], "g");
      let expanded = context[variableNames[i]];
      if("string" === typeof expanded)
      {
        expanded = expanded.replace(/t/g, "%");
      }
      value = value.replace(variableNameRegexp, expanded);
    }

    return value.replace(/%/g, "t");
  }
}

const dyadOperations = {};
dyadOperations[operations.INDEX]   = indexOperator;
dyadOperations[operations.COMPARE] = comparisonOperator;
dyadOperations[operations.AND]     = andOperator;

function parseFunctionStatements(statementsMap, functionArguments)
{
  const result = {};
  const allFunctionCalls = [];
  
  for(const functionName in statementsMap)
  {
    const statements = statementsMap[functionName];
    result[functionName] = [];
    
    for(const statement of statements)
    {
      const parseResult = parseOneFunctionStatement(
        statement, allFunctionCalls, functionArguments
      );
      if(parseResult.successful)
      {
        result[functionName].push(parseResult.result);
      }
      else
      {
        return parseResult;
      }
    }
  }
  
  for(const call of allFunctionCalls)
  {
    call.bind(functionArguments, result);
  }
  return {
    successful: true,
    result: result
  };
}

function parseOneFunctionStatement(statement, allFunctionCalls, functionArguments, isIfStatementCondition = false)
{
  if(statement[0].type === "KEYWORD" && statement[0].value === keywords.IF)
  {
    return parseOneIfStatement(statement, allFunctionCalls, functionArguments);
  }
  
  const operationStack = [];
  const operationTokenStack = [];
  const valueStack = [];
  let assignedVariableNameToken = null;
  let isReturnStatement = false;
  
  for(let i = 0; i < statement.length; ++i)
  {
    const token = statement[i];
    
    if(token.type === "KEYWORD")
    {
      if(token.value === keywords.IT)
      {
        if(i === 0)
        {
          isReturnStatement = true;
        }
        else
        {
          operationStack.push(operations.INDEX);
          operationTokenStack.push(token);
        }
      }
      else if(token.value === keywords.IS)
      {
        if(i === 1 && !isIfStatementCondition &&
           valueStack[0] instanceof Nilad &&
           valueStack[0].isVariable())
        {
          operationStack.push(operations.ASSIGN);
        }
        else
        {
          operationStack.push(operations.COMPARE);
        }
        operationTokenStack.push(token);
      }
      else if(token.value === keywords.AND)
      {
        operationStack.push(operations.AND);
        operationTokenStack.push(token);
      }
      else
      {
        return makeError(token, "This should never be reached");
      }
    }
    else if(token.type === "-")
    {
      operationStack.push(operations.MINUS);
      operationTokenStack.push(token);
    }
    else if(token.type === "ID" || token.type === "INTEGER" ||
            token.type === "STRING")
    {
      let tokenNilad;
      if(token.type === "ID" && token.isFunctionCall)
      {
        const functionBody = [];
        const numArguments = functionArguments[token.value].length;
        
        for(let j = 0; j < numArguments; ++j)
        {
          const parseResult = parseOneFunctionStatement(
            statement[++i], allFunctionCalls, functionArguments, true
          );
          if(parseResult.successful)
          {
            functionBody.push(parseResult.result);
          }
          else
          {
            return parseResult;
          }
        }
        const call = new FunctionCall(token, functionBody);
        tokenNilad = call;
        allFunctionCalls.push(call);
      }
      else
      {
        tokenNilad = new Nilad(token);
      }
      
      if(operationStack.length === 0)
      {
        valueStack.push(tokenNilad);
      }
      else
      {
        let topOperation = operationStack.pop();
        if(topOperation === operations.MINUS)
        {
          let op = new Operation(
            minusOperator, operationTokenStack.pop(), tokenNilad
          );
          while(
            operationStack.length > 0 &&
            operationStack[operationStack.length - 1] === operations.MINUS
          )
          {
            op = new Operation(
              minusOperator, operationTokenStack.pop(), op
            );
            operationStack.pop();
          }
          tokenNilad = op;
          
          if(operationStack.length > 0)
          {
            topOperation = operationStack.pop();
          }
          else
          {
            topOperation = null;
          }
        }
        
        if(topOperation !== null)
        {
          if(topOperation === operations.ASSIGN)
          {
            assignedVariableNameToken = valueStack.pop().getToken();
            operationTokenStack.pop();
            valueStack.push(tokenNilad);
          }
          else if(topOperation in dyadOperations)
          {
            valueStack.push(
              new Operation(
                dyadOperations[topOperation], operationTokenStack.pop(),
                valueStack.pop(), tokenNilad
              )
            );
          }
          else
          {
            valueStack.push(tokenNilad);
          }
        }
        else
        {
          valueStack.push(tokenNilad);
        }
      }
    }
    else
    {
      return makeError(token, "This should never be reached");
    }
  }

  let result;
  if(assignedVariableNameToken !== null)
  {
    result = new AssignmentOperation(
      assignedVariableNameToken, valueStack.pop()
    );
  }
  else
  {
    if(isReturnStatement)
    {
      result = new ReturnStatement(valueStack.pop());
    }
    else
    {
      result = valueStack.pop();
    }
  }
  
  return {
    successful: true,
    result: result
  };
}

function parseOneIfStatement(statement, allFunctionCalls, functionArguments)
{
  const conditionParseResult = parseOneFunctionStatement(
    statement[1], allFunctionCalls, functionArguments, true
  );
  if(!conditionParseResult.successful)
  {
    return conditionParseResult;
  }
  
  const condition = conditionParseResult.result;
  
  const ifStatementBody = [];
  let elseStatementBody = null;
  
  for(const bodyStatement of statement[2])
  {
    const parseResult = parseOneFunctionStatement(
      bodyStatement, allFunctionCalls, functionArguments
    );
    if(parseResult.successful)
    {
      ifStatementBody.push(parseResult.result);
    }
    else
    {
      return parseResult;
    }
  }
  
  if(statement.length === 6)
  {
    elseStatementBody = [];
    for(const elseStatement of statement[4])
    {
      const parseResult = parseOneFunctionStatement(
        elseStatement, allFunctionCalls, functionArguments
      );
      if(parseResult.successful)
      {
        elseStatementBody.push(parseResult.result);
      }
      else
      {
        return parseResult;
      }
    }
  }
  
  const ifStatement = new IfStatement(
    condition, ifStatementBody, elseStatementBody
  );
  return {
    successful: true,
    result: ifStatement
  };
}

module.exports = parseFunctionStatements;
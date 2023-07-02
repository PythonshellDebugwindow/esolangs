const {keywords, makeError} = require("./util.js");

const states = {
  RETURN:    0,
  VALUE:     1,
  BINOP:     2,
  VALUE_RHS: 3
};

function getFunctionStatements(functions)
{
  const functionNumArgumentsMap = {};
  const result = {};
  for(const functionName in functions)
  {
    if(functionName !== "main")
    {
      const functionArguments = functions[functionName].arguments;
      functionNumArgumentsMap[functionName] = functionArguments.length;
    }
    result[functionName] = [];
  }
  
  for(const functionName in functions)
  {
    const fn = functions[functionName];
    let i = 0;
    while(i < fn.tokens.length)
    {
      const parseResult = parseOneExpression(fn, i, functionNumArgumentsMap);
      
      if(parseResult.successful)
      {
        result[functionName].push(parseResult.tokens);
        i += parseResult.numTokensUsed;
      }
      else
      {
        return parseResult;
      }
    }
  }
  return {
    successful: true,
    result: result
  };
}

function parseOneExpression(
  fn, startIndex, functionNumArgumentsMap,
  isIfStatementCondition = false
)
{
  const tokens = fn.tokens;
  
  if(tokens.length > startIndex &&
     tokens[startIndex].type === "KEYWORD" &&
     tokens[startIndex].value === keywords.IF)
  {
    return parseOneIfStatement(fn, startIndex, functionNumArgumentsMap);
  }
  
  const resultTokens = [];
  let numTokensUsed = 0;
  let currentState = states.RETURN;
  
  for(let i = startIndex; i < tokens.length; ++i, ++numTokensUsed)
  {
    const token = tokens[i];
    if(token.type === "KEYWORD")
    {
      if(token.value === keywords.IT)
      {
        if(i === startIndex)
        {
          if(isIfStatementCondition)
          {
            return makeError(token, "Invalid syntax");
          }
          else if(currentState === states.RETURN)
          {
            resultTokens.push(token);
            currentState = states.VALUE;
          }
          else
          {
            return makeError(token, "Invalid syntax");
          }
        }
        else if(currentState === states.BINOP)
        {
          resultTokens.push(token);
          currentState = states.VALUE_RHS;
        }
        else
        {
          return makeError(token, "Invalid syntax");
        }
      }
      else if(token.value === keywords.IS ||
              token.value === keywords.AND)
      {
        if(currentState === states.BINOP)
        {
          resultTokens.push(token);
          currentState = states.VALUE_RHS;
        }
        else
        {
          return makeError(token, "Invalid syntax");
        }
      }
      else if(token.value === keywords.IF ||
              token.value === keywords.OR ||
              token.value === keywords.THEN)
      {
        if(currentState === states.BINOP)
        {
          break;
        }
        else
        {
          return makeError(token, "Invalid syntax");
        }
      }
      else
      {
        return makeError(token, "Invalid syntax");
      }
    }
    else if(token.type === "-")
    {
      if(currentState === states.RETURN ||
         currentState === states.VALUE ||
         currentState === states.VALUE_RHS)
      {
        resultTokens.push(token);
        if(currentState === states.RETURN)
        {
          currentState = states.VALUE;
        }
      }
      else
      {
        //Wanted a binary operator, but could also be the end of the
        //  expression
        break;
      }
    }
    else if(token.type === "ID")
    {
      if(currentState === states.RETURN ||
         currentState === states.VALUE ||
         currentState === states.VALUE_RHS)
      {
        resultTokens.push(token);
        if(token.value in functionNumArgumentsMap)
        {
          const numArguments = functionNumArgumentsMap[token.value];
          if(numArguments > 0)
          {
            ++i;
            ++numTokensUsed;
            for(let j = 0; j < numArguments; ++j)
            {
              if(i >= tokens.length)
              {
                return makeError(token, `The function '${token.value}' takes exactly ${numArguments} argument${numArguments === 1 ? '' : 's'} (${j} given)`);
              }
              
              if(tokens[i].type === "KEYWORD" &&
                 tokens[i].value === keywords.IS)
              {
                return makeError(token, `The function '${token.value}' takes exactly ${numArguments} argument${numArguments === 1 ? '' : 's'} (${j} given)`);
              }
              else if(tokens[i].type === "KEYWORD")
              {
                return makeError(token, `The function '${token.value}' takes exactly ${numArguments} argument${numArguments === 1 ? '' : 's'} (${j} given)`);
              }
              
              const parseResult = parseOneExpression(
                fn, i, functionNumArgumentsMap
              );
              if(!parseResult.successful)
              {
                return parseResult;
              }
              else if(parseResult.numTokensUsed === 0)
              {
                return makeError(token, `The function '${token.value}' takes exactly ${numArguments} argument${numArguments === 1 ? '' : 's'} (${j} given)`);
              }
              else
              {
                resultTokens.push(parseResult.tokens);
                i += parseResult.numTokensUsed;
                numTokensUsed += parseResult.numTokensUsed;
              }
            }
            --i;
            --numTokensUsed;
          }
          token.isFunctionCall = true;
        }
        else
        {
          token.isFunctionCall = false;
        }
        currentState = states.BINOP;
      }
      else
      {
        //Wanted a binary operator, but could also be the end of the
        //  expression
        break;
      }
    }
    else if(token.type === "INTEGER" ||
            token.type === "STRING")
    {
      if(currentState === states.RETURN ||
         currentState === states.VALUE ||
         currentState === states.VALUE_RHS)
      {
        if(token.type === "INTEGER")
        {
          token.value = BigInt(token.value);
        }
        resultTokens.push(token);
        currentState = states.BINOP;
      }
      else
      {
        //Wanted a binary operator, but could also be the end of the
        //  expression
        break;
      }
    }
    else
    {
      return makeError(token, "This should never be reached");
    }
  }

  if(currentState === states.VALUE_RHS)
  {
    return makeError(tokens[tokens.length - 1], "Unexpected end of input");
  }
  
  return {
    successful: true,
    numTokensUsed: numTokensUsed,
    tokens: resultTokens
  };
}

function parseOneIfStatement(fn, startIndex, functionNumArgumentsMap)
{
  const tokens = fn.tokens;
  const resultTokens = [tokens[startIndex]];
  let currentTokens = [];
  let hasSeenOr = false;
  let i = startIndex + 1;
  
  const parseResult = parseOneExpression(
    fn, i, functionNumArgumentsMap, true
  );
  if(parseResult.successful)
  {
    resultTokens.push(parseResult.tokens);
    i += parseResult.numTokensUsed;
  }
  else
  {
    return parseResult;
  }

  while(i < tokens.length)
  {
    if(tokens[i].type === "KEYWORD" &&
       tokens[i].value === keywords.OR)
    {
      if(!hasSeenOr)
      {
        resultTokens.push(currentTokens);
        currentTokens = [];
        resultTokens.push(tokens[i]);
        hasSeenOr = true;
        ++i;
      }
      else
      {
        return makeError(tokens[i], "Invalid syntax");
      }
    }
    else if(tokens[i].type === "KEYWORD" &&
            tokens[i].value === keywords.IF)
    {
      const parseResult = parseOneIfStatement(
        fn, i, functionNumArgumentsMap
      );
      if(parseResult.successful)
      {
        currentTokens.push(parseResult.tokens);
        i += parseResult.numTokensUsed;
      }
      else
      {
        return parseResult;
      }
    }
    else if(tokens[i].type === "KEYWORD" &&
            tokens[i].value === keywords.THEN)
    {
      resultTokens.push(currentTokens);
      resultTokens.push(tokens[i]);
      return {
        successful: true,
        numTokensUsed: i - startIndex + 1,
        tokens: resultTokens
      };
    }
    else
    {
      const parseResult = parseOneExpression(fn, i, functionNumArgumentsMap);
      if(parseResult.successful)
      {
        if(parseResult.length === 0)
        {
          return makeError(tokens[tokens.length - 1], "Unexpected end of input");
        }
        else
        {
          currentTokens.push(parseResult.tokens);
          i += parseResult.numTokensUsed;
        }
      }
      else
      {
        return parseResult;
      }
    }
  }
  
  return makeError(tokens[tokens.length - 1], "Unexpected end of input");
}

module.exports = getFunctionStatements;
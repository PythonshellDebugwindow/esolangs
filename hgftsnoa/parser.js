const {keywords, makeError} = require("./util.js");

const states = {
  FUNCTION_NAME:      0,
  FUNCTION_IS:        1,
  FUNCTION_ARGUMENTS: 2
};

function makeEndOfInputError(tokens)
{
  const lastToken = tokens[tokens.length - 1];
  return {
    successful: false,
    line: lastToken.startLine,
    column: lastToken.startColumn,
    message: "Unexpected end of input"
  };
}

function parseFunctions(tokens)
{
  const functions = {};
  let i = 0;
  
  while(i < tokens.length)
  {
    const parseResult = parseOneFunction(tokens, i);
    if(parseResult.successful)
    {
      if(parseResult.functionName in functions)
      {
        return makeError(tokens[i], `The function '${parseResult.functionName}' has already been defined`);
      }
      else
      {
        functions[parseResult.functionName] = {
          functionName: parseResult.functionName,
          arguments: parseResult.arguments,
          nameToken: parseResult.nameToken,
          tokens: parseResult.tokens
        };
        i += parseResult.numTokensUsed + 1;
      }
    }
    else
    {
      return parseResult;
    }
  }

  return {
    successful: true,
    functions: functions
  };
}

function parseOneFunction(tokens, startIndex)
{
  const functionArguments = [];
  let functionName = null;
  let nameToken = null;
  let currentState = states.FUNCTION_NAME;

  for(let i = startIndex, numTokensUsed = 0; i < tokens.length; ++i)
  {
    const token = tokens[i];

    if(token.type === "KEYWORD")
    {
      if(token.value === keywords.HELLO)
      {
        if(currentState === states.FUNCTION_NAME ||
           currentState === states.FUNCTION_ARGUMENTS)
        {
          if(functionName === null)
          {
            functionName = "main";
          }

          ++i;
          while(i < tokens.length)
          {
            const parseResult = getFunctionBody(tokens, i);
            
            if(parseResult.successful)
            {
              numTokensUsed += parseResult.numTokensUsed;
              i += parseResult.numTokensUsed;

              if(i >= tokens.length)
              {
                return makeError(tokens[i - 1], "Unexpected end of input");
              }
              else if(tokens[i].type === "KEYWORD" &&
                 tokens[i].value === keywords.GOODBYE)
              {
                ++numTokensUsed;
                return {
                  successful: true,
                  numTokensUsed: numTokensUsed,
                  functionName: functionName,
                  arguments: functionArguments,
                  nameToken: (functionName === "main") ? tokens[0] : nameToken,
                  tokens: parseResult.tokens
                };
              }
            }
            else
            {
              return parseResult;
            }
          }

          return makeEndOfInputError(tokens);
        }
        else if(currentState === states.FUNCTION_IS)
        {
          return makeError(token, "Invalid syntax");
        }
        else
        {
          return makeError(token, "Functions cannot be nested");
        }
      }
      else if(token.value === keywords.IS)
      {
        if(currentState === states.FUNCTION_IS)
        {
          currentState = states.FUNCTION_ARGUMENTS;
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
    else if(token.type === "ID")
    {
      if(currentState === states.FUNCTION_NAME)
      {
        nameToken = token;
        functionName = token.value;
        currentState = states.FUNCTION_IS;
      }
      else if(currentState === states.FUNCTION_ARGUMENTS)
      {
        functionArguments.push(token.value);
      }
      else
      {
        return makeError(token, "Invalid syntax");
      }
    }
    ++numTokensUsed;
  }

  return makeEndOfInputError(tokens);
}

function getFunctionBody(tokens, startIndex)
{
  const statementTokens = [];
  
  for(let i = startIndex; i < tokens.length; ++i)
  {
    const token = tokens[i];
    
    if(token.type === "KEYWORD")
    {
      if(token.value === keywords.HELLO)
      {
        return makeError(token, "Invalid syntax");
      }
      else if(token.value === keywords.GOODBYE)
      {
        break;
      }
      else
      {
        statementTokens.push(token);
      }
    }
    else
    {
      statementTokens.push(token);
    }
  }
  
  return {
    successful: true,
    numTokensUsed: statementTokens.length,
    tokens: statementTokens
  };
}

module.exports = parseFunctions;
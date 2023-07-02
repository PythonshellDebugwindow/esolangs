const {makeError} = require("./util.js");

function validateTokens(tokens)
{
  for(const token of tokens)
  {
    if(token.type === "KEYWORD")
    {
      if(token.value.length > 8)
      {
        return {
          successful: false,
          line: token.startLine,
          column: token.startColumn,
          message: `'${token.value}' is not a valid keyword`
        };
      }
    }
  }
  return {successful: true};
}

function validateFunctions(functionMap, allTokens)
{
  const names = Object.keys(functionMap);
  
  for(let i = 0; i < names.length; ++i)
  {
    const currentFunction = functionMap[names[i]];
    const functionArguments = currentFunction.arguments;

    for(let j = 0; j < functionArguments.length; ++j)
    {
      for(let k = j + 1; k < functionArguments.length; ++k)
      {
        if(functionArguments[j] === functionArguments[k])
        {
          const nameToken = currentFunction.nameToken;
          const nameTokenIndex = allTokens.indexOf(nameToken);
          const token = allTokens[nameTokenIndex + 2 + k];
          const error = makeError(token, `The function '${names[i]}' cannot take two parameters named '${functionArguments[i]}'`);
          error.hasToken = true;
          return error;
        }
      }
    }
    
    for(let j = 0; j < names.length; ++j)
    {
      for(let k = 0; k < functionArguments.length; ++k)
      {
        if(functionArguments[k] === names[j])
        {
          const nameToken = currentFunction.nameToken;
          const nameTokenIndex = allTokens.indexOf(nameToken);
          const token = allTokens[nameTokenIndex + 2 + k];
          const error = makeError(token, `The function parameter '${names[j]}' cannot share a name with the function '${names[j]}'`);
          error.hasToken = true;
          return error;
        }
      }
    }
  }
  
  if(names.indexOf("main") === -1)
  {
    return {
      successful: false,
      hasToken: false,
      message: "no main function was defined"
    };
  }

  return {successful: true};
}

module.exports = {validateTokens, validateFunctions};
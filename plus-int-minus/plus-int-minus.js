const TokenTypes = {
  PLUS:   "+",
  MINUS:  "-",
  NUMBER: "NUMBER"
};

function tokenise(program)
{
  const tokens = [];
  let currentToken = null;
  
  for(let i = 0; i < program.length; ++i)
  {
    const currentChar = program.charAt(i);
    if(currentChar === "+" || currentChar === "-")
    {
      if(currentToken !== null)
      {
        tokens.push(currentToken);
        currentToken = null;
      }
      tokens.push({
        type: currentChar,
        value: currentChar
      });
    }
    else if(/[0-9]/.test(currentChar))
    {
      if(currentToken !== null && currentToken.type === TokenTypes.NUMBER)
      {
        currentToken.value += currentChar;
      }
      else
      {
        if(currentToken !== null)
        {
          tokens.push(currentToken);
        }
        currentToken = {
          type: TokenTypes.NUMBER,
          value: currentChar
        };
      }
    }
    else
    {
      if(currentToken !== null)
      {
        tokens.push(currentToken);
        currentToken = null;
      }
    }
  }
  
  if(currentToken !== null)
  {
    tokens.push(currentToken);
  }
  return tokens;
}

function plusIntMinus(program, isOriginal)
{
  const tokens = tokenise(program);

  const maximumAccumulatorValue = (isOriginal ? 461 : 255);
  const accumulatorModulus = maximumAccumulatorValue + 1;
  let accumulator = (isOriginal ? 18 : 0);
  
  let output = "";
  
  for(let i = 0; i < tokens.length; ++i)
  {
    const token = tokens[i];
    if(token.type === TokenTypes.PLUS)
    {
      if(i + 1 < tokens.length && tokens[i + 1].type === TokenTypes.NUMBER)
      {
        accumulator += parseInt(tokens[i + 1].value);
        if(accumulator > maximumAccumulatorValue)
        {
          accumulator %= accumulatorModulus;
        }
        ++i;
      }
      else
      {
        ++accumulator;
        if(accumulator > maximumAccumulatorValue)
        {
          accumulator = 0;
        }
      }
    }
    else if(token.type === TokenTypes.MINUS)
    {
      output += String.fromCharCode(accumulator);
      --accumulator;
      if(accumulator < 0)
      {
        accumulator = maximumAccumulatorValue;
      }
    }
  }
  
  return output;
}

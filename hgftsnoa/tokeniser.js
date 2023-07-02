function getType(c)
{
  if(c === "T")
  {
    return "KEYWORD";
  }
  else if(c === "t")
  {
    return "ID";
  }
  else if(/[0-9]/.test(c))
  {
    return "INTEGER";
  }
  else
  {
    return c;
  }
}

function tokenise(program)
{
  const tokens = [];
  let currentToken = {type: null, value: null};
  let stringMode = false;
  let currentLine = 0;
  let currentColumn = 0;

  function saveCurrentToken()
  {
    if(currentToken.type !== null)
    {
      tokens.push(currentToken);
    }
  }
  function setCurrentToken(type, value)
  {
    currentToken = {
      type: type,
      value: value,
      startLine: currentLine,
      startColumn: currentColumn
    };
  }

  for(let i = 0; i < program.length; ++i)
  {
    const c = program.charAt(i);

    if(stringMode)
    {
      if(c === '"')
      {
        stringMode = false;
        saveCurrentToken();
        currentToken = {type: null, value: null};
      }
      else if(/[Tt0-9 \n-]/.test(c))
      {
        currentToken.value += c;
      }
      else
      {
        return {
          successful: false,
          line: currentLine,
          column: currentColumn,
          message: "Invalid character"
        };
      }
    }
    else if(/[Tt0-9]/.test(c))
    {
      if(currentToken.type === null)
      {
        saveCurrentToken();
        setCurrentToken(getType(c), c);
      }
      else if(currentToken.type === getType(c))
      {
        currentToken.value += c;
      }
      else
      {
        return {
          successful: false,
          line: currentLine,
          column: currentColumn,
          message: "Invalid syntax"
        };
      }
    }
    else if(c === "-")
    {
      saveCurrentToken();
      setCurrentToken("-", "-");
      tokens.push(currentToken);
      currentToken = {type: null, value: null};
    }
    else if(c === '"')
    {
      saveCurrentToken();
      setCurrentToken("STRING", "");
      stringMode = true;
    }
    else if(c === " " || c === "\n")
    {
      saveCurrentToken();
      currentToken = {type: null, value: null};
    }
    else
    {
      return {
        successful: false,
        line: currentLine,
        column: currentColumn,
        message: "Invalid character"
      };
    }

    if(c === "\n")
    {
      ++currentLine;
      currentColumn = 0;
    }
    else
    {
      ++currentColumn;
    }
  }

  if(stringMode)
  {
    return {
      successful: false,
      line: currentToken.startLine,
      column: currentToken.startColumn,
      message: "Unclosed string"
    };
  }

  saveCurrentToken();
  return {
    successful: true,
    tokens: tokens
  };
}

module.exports = tokenise;
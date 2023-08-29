const valueRegexpString = String.raw`(\|\^*\||~|I)`;
const expressionRegexpString = (
  " *< *" + valueRegexpString + "( *[x/+-] *" + valueRegexpString + ")* *> *"
);
const printASCIIRegex = new RegExp(
  String.raw`^\{(` + expressionRegexpString + String.raw`|~)\}(@~)?$`
);
const printIntegerRegex = new RegExp(
  String.raw`^\{\{(` + expressionRegexpString + String.raw`|~)\}\}(@~)?$`
);

function validateProgram(lines)
{
  for(let i = 0; i < lines.length; ++i)
  {
    const line = lines[i];
    if(line.length > 0)
    {
      if(!printASCIIRegex.test(line) && !printIntegerRegex.test(line))
      {
        return {
          success: false,
          message: "Invalid syntax on line " + (i + 1)
        };
      }
    }
  }
  return {success: true};
}

function runExp(program, input)
{
  const lines = program.split("\n");
  
  var validationResult = validateProgram(lines);
  if(!validationResult.success)
  {
    console.error(validationResult.message);
    process.exit(1);
  }

  let inputIndex = 0;
  let accumulator = null;
  let lineNumber = 0;
  
  function parseValue(value)
  {
    if(value === "~")
    {
      if(accumulator === null)
      {
        console.error(`Error on line ${lineNumber + 1}: the accumulator has not been assigned a value`);
        process.exit(1);
      }
      else
      {
        return accumulator;
      }
    }
    else if(value === "I")
    {
      if(inputIndex < input.length)
      {
        return input.charCodeAt(inputIndex++);
      }
      else
      {
        return 0;
      }
    }
    else
    {
      return value.length - 2;
    }
  }
  
  for(lineNumber = 0; lineNumber < lines.length; ++lineNumber)
  {
    const line = lines[lineNumber];
    if(line.length === 0)
    {
      continue;
    }
    
    let result;
    if(line.startsWith("{~}") || line.startsWith("{{~}}"))
    {
      result = accumulator;
    }
    else
    {
      const tokens = line.substring(line.indexOf("<") + 1, line.indexOf(">"))
                         .replace(/ /g, "").match(/\|\^*\||[I~x/+-]/g);
      result = parseValue(tokens[0]);
      for(let i = 2; i < tokens.length; ++i)
      {
        const operator = tokens[i - 1];
        const operand = parseValue(tokens[i]);
        
        if(operator === "+")
        {
          result += operand;
        }
        else if(operator === "-")
        {
          result -= operand;
        }
        else if(operator === "x")
        {
          result *= operand;
        }
        else if(operator === "/")
        {
          if(operand === 0)
          {
            console.error(`Error on line ${lineNumber + 1}: Cannot divide by zero`);
            process.exit(1);
          }
          else
          {
            result = Math.floor(result / operand);
          }
        }
      }
    }
    if(line.endsWith("@~"))
    {
      accumulator = result;
    }
    else if(line.startsWith("{{"))
    {
      process.stdout.write(result.toString());
    }
    else
    {
      process.stdout.write(String.fromCharCode(result));
    }
  }
}

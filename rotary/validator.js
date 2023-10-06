const instructionRegexp = "[></\\\\+\\\-.,v^#?*$~@!rs%x]";
const instructionRegexp3 = instructionRegexp + "{3}";
const instructionRegexp6 = instructionRegexp + "{6}";

let regexpStrings = [
  " ".repeat(5) + instructionRegexp6,
  "  " + instructionRegexp3 + " ".repeat(6) + instructionRegexp3,
  " " + instructionRegexp + " ".repeat(12) + instructionRegexp
];
regexpStrings.push(...regexpStrings.slice().reverse());
regexpStrings.push("");

const middleRegexp = instructionRegexp + " ".repeat(14) + instructionRegexp;
for(let i = 0; i < 3; ++i)
{
  regexpStrings.splice(3, 0, middleRegexp);
}

const regexps = regexpStrings.map(string => new RegExp("^" + string + "$"));

function validate(program)
{
  if(program.length === 0)
  {
    return {
      successful: false,
      line: "",
      lineNumber: 0,
      message: "Expected a line, got nothing"
    };
  }
  
  const lines = program.split("\n");
  let regexpIndex = 0;
  for(let i = 0; i < lines.length; ++i)
  {
    const line = lines[i];
    if(regexps[regexpIndex].test(line))
    {
      ++regexpIndex;
      if(regexpIndex === regexps.length)
      {
        regexpIndex = 0;
      }
    }
    else
    {
      return {
        successful: false,
        line: line,
        lineNumber: i
      };
    }
  }
  
  if(regexpIndex !== regexps.length - 1)
  {
    return {
      successful: false,
      line: lines[lines.length - 1],
      lineNumber: lines.length - 1
    };
  }
  
  return {
    successful: true
  };
}

module.exports = validate;

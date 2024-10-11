const nearley = require("nearley");
const grammar = require("./grammar.js");

const ParseError = require("./parse-error.js");


function parseWholeProgram(program)
{
  if(/^\s*$/.test(program))
  {
    throw new ParseError("Error: Unexpected end of file", null);
  }
  else if(!/^\s*=/.test(program))
  {
    throw new ParseError("Invalid syntax", program.search(/[^\s]/));
  }

  const files = new Map();
  const filenamesSeen = new Set();
  let mainFile = null;

  let programIndex = program.indexOf("=");
  while(programIndex < program.length)
  {
    let fileStartIndex = program.indexOf("\n", programIndex) + 1;
    if(fileStartIndex === 0) fileStartIndex = program.length + 1;
    const isMain = program.charAt(fileStartIndex - 2) === "!";
    const filename = program.substring(programIndex + 1, fileStartIndex - 1 - isMain);

    if(filename.length === 0)
    {
      throw new ParseError("Filenames cannot be empty", programIndex + 1);
    }
    else if(filenamesSeen.has(filename))
    {
      throw new ParseError(`Duplicate filename: \`${filename}'`, programIndex + 1);
    }

    if(isMain)
    {
      if(mainFile !== null)
      {
        throw new ParseError("Only one file can be marked with `!'", fileStartIndex - 2);
      }
      mainFile = {name: filename, startIndex: Math.min(fileStartIndex, program.length)};
    }

    filenamesSeen.add(filename);

    // Find the end of the current file
    let fileEndIndex = fileStartIndex;
    let isInString = false;
    for(; fileEndIndex < program.length; ++fileEndIndex)
    {
      const char = program.charAt(fileEndIndex);
      if(isInString)
      {
        if(char === "\\")
        {
          ++fileEndIndex;
        }
        else if(char === '"')
        {
          isInString = false;
        }
      }
      else if(char === '"')
      {
        isInString = true;
      }
      else if(char === ";")
      {
        const equalsSignIndex = program.indexOf("=", fileEndIndex);
        const untilEqualsSign = program.substring(fileEndIndex + 1, equalsSignIndex);
        if(/^\s*$/.test(untilEqualsSign))
        {
          fileEndIndex = equalsSignIndex;
          break;
        }
      }
    }

    const fileContents = program.substring(fileStartIndex, fileEndIndex);
    files.set(filename, fileContents);

    programIndex = fileEndIndex;
  }

  if(mainFile === null)
  {
    throw new ParseError("Error: No file was marked with `!'", null);
  }

  return {files, mainFile};
}


function parseSingleFile(program, isFirstFileRun)
{
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try
  {
    parser.feed(program);
  }
  catch(err)
  {
    const match = err.message.match(/line (\d+) col (\d+)/);
    if(match !== null)
    {
      if(isFirstFileRun)
      {
        const lineNumber = parseInt(match[1]);
        const column = parseInt(match[2]);
        const line = program.split("\n")[lineNumber - 1];
        
        console.error(`Line ${lineNumber + 1}: Invalid syntax`);
        console.error("  " + line);
        console.error("  " + " ".repeat(column - 1) + "^");
      }
      return null;
    }
    else
    {
      throw err;
    }
  }

  if(parser.results.length === 0)
  {
    if(isFirstFileRun)
    {
      console.error("Error: Unexpected end of file");
      process.exit(1);
    }
    else
    {
      return null;
    }
  }
  else if(parser.results.length > 1)
  {
    console.error("Internal error: Ambiguity detected in grammar");
    process.exit(1);
  }

  return parser.results[0];
}


module.exports = {parseWholeProgram, parseSingleFile};

const readline = require("readline");
const util = require("util");

const {parseSingleFile} = require("./parse.js");

const Commands = require("./commands.js");
const ProgramException = require("./program-exception.js");


async function runProgram(files, mainFilename)
{
  const mainContents = files.get(mainFilename);
  const mainParsed = parseSingleFile(mainContents, true);
  if(mainParsed === null)
  {
    process.exit(1);
  }

  const importStack = [{statements: mainParsed, statementIndex: 0}];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = util.promisify(rl.question).bind(rl);

  const inputDictionary = new Map();

  const env = {files, inputDictionary};

  importLoop:
  while(importStack.length > 0)
  {
    try
    {
      const currentFile = importStack[importStack.length - 1];
      while(currentFile.statementIndex < currentFile.statements.length)
      {
        const statement = currentFile.statements[currentFile.statementIndex];
        switch(statement.type)
        {
          case Commands.IMPORT: {
            const filename = statement.filename(env);
            if(typeof filename === "string")
            {
              if(!files.has(filename))
              {
                throw ProgramException;
              }
              const fileContents = files.get(filename);
              const fileParsed = parseSingleFile(fileContents, false);
              if(fileParsed === null)
              {
                throw ProgramException;
              }
              importStack.push({statements: fileParsed, statementIndex: 0});
              ++currentFile.statementIndex;
              continue importLoop;
            }
            else if(filename.isInteger())
            {
              const input = await question("");
              inputDictionary.set(filename.getNumerator(), input);
            }
            else
            {
              throw ProgramException;
            }
            break;
          }
          
          case Commands.PRINT: {
            const toPrint = statement.value(env) + (statement.printTrailingNewline ? "\n" : "");
            process.stdout.write(toPrint);
            break;
          }
          
          case Commands.WRITE_TO_FILE: {
            const filename = statement.filename(env);
            if(typeof filename !== "string")
            {
              throw ProgramException;
            }
            const toPrint = statement.value(env);
            if(toPrint.length === 0)
            {
              files.set(filename, toPrint);
            }
            else
            {
              const oldContents = files.get(filename) ?? "";
              const newContents = toPrint + (statement.printTrailingNewline ? "\n" : "");
              files.set(filename, oldContents + newContents);
            }
            break;
          }
          
          case Commands.PRINT_IMPORT: {
            const filename = statement.filename(env);
            if(typeof filename !== "string" || !files.has(filename))
            {
              throw ProgramException;
            }
            console.log(files.get(filename));
            break;
          }
          
          case Commands.VALUE:
            statement.value(env);
            break;
          
          default:
            throw new TypeError("Invalid statement type: " + statement.type);
        }
        ++currentFile.statementIndex;
      }
    }
    catch(err)
    {
      if(err !== ProgramException)
      {
        throw err;
      }
    }
    importStack.pop();
  }

  rl.close();
}


module.exports = runProgram;

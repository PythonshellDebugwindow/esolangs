const fs = require("fs");
const path = require("path");

const interpret = require("./2kwlang.js");
const Rational = require("./rational.js");

function getFileBasename()
{
  return path.basename(process.argv[1]);
}

function printHelpText()
{
  console.log(`Usage: node ${getFileBasename()} FILE`);
  console.log(`An interpreter for 2KWLang: <https://esolangs.org/wiki/2KWLang>

Options:
  -d, --real-digits DIGITS   Reals will have a maximum of DIGITS fractional digits when output. Default is 5.
  -h, --help                 Print this message.`);
}

function printMoreInformationMessage()
{
  const fileBasename = getFileBasename();
  console.error(`Usage: node ${fileBasename} FILE`);
  console.error(`Try \`node ${fileBasename} --help' for more information.`);
}

function printMissingArgumentMessage(option)
{
  console.error(`2kwlang: option ${option} requires an argument`);
  console.error(`Try \`node ${getFileBasename()} --help' for more information.`);
}

function printInvalidArgumentMessage(argument, option)
{
  console.error(`2kwlang: invalid argument \`${argument}' for option ${option}`);
  console.error(`Try \`node ${getFileBasename()} --help' for more information.`);
}

function printUnrecognisedOptionMessage(option)
{
  console.error(`2kwlang: Unrecognised option: ${option}`);
  console.error(`Try \`node ${getFileBasename()} --help' for more information`);
}

function printTooManyArgumentsMessage()
{
  console.error("2kwlang: Too many arguments");
  console.error(`Try \`node ${getFileBasename()} --help' for more information`);
}

function printMissingFileOperandMessage()
{
  console.error("2kwlang: Missing file operand");
  console.error(`Try \`node ${getFileBasename()} --help' for more information`);
}

function tryReadFile(filename)
{
  try
  {
    return fs.readFileSync(filename).toString();
  }
  catch(err)
  {
    if(err.code === "ENOENT")
    {
      console.error(`2kwlang: \`${filename}' does not exist`);
    }
    else if(err.code === "EISDIR")
    {
      console.error(`2kwlang: \`${filename}' is a directory`);
    }
    else
    {
      console.error(`2kwlang: \`${filename}' could not be opened`);
    }
    process.exit(1);
  }
}

function run()
{
  if(process.argv.length < 3)
  {
    printMoreInformationMessage();
    process.exit(1);
  }

  let filename = null;
  for(let i = 2; i < process.argv.length; ++i)
  {
    const arg = process.argv[i];
    if(arg === "-h" || arg === "--help")
    {
      printHelpText();
      process.exit(0);
    }
    else if(arg === "-d" || arg === "--real-digits")
    {
      ++i;
      if(i === process.argv.length)
      {
        printMissingArgumentMessage(arg);
        process.exit(1);
      }
      else if(!/^[0-9]+$/.test(process.argv[i]))
      {
        printInvalidArgumentMessage(process.argv[i], arg);
        process.exit(1);
      }
      Rational.setMaxFractionalDigits(parseInt(process.argv[i]));
    }
    else if(arg.charAt(0) === "-")
    {
      printUnrecognisedOptionMessage(arg);
      process.exit(1);
    }
    else if(filename !== null)
    {
      printTooManyArgumentsMessage();
      process.exit(1);
    }
    else
    {
      filename = process.argv[i];
    }
  }

  if(filename === null)
  {
    printMissingFileOperandMessage();
    process.exit(1);
  }

  const program = tryReadFile(filename);
  interpret(program);
}

run();

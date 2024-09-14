const fs = require("fs");
const path = require("path");

const interpret = require("./yaren.js");


function getFileBasename()
{
  return path.basename(process.argv[1]);
}

function printHelpText()
{
  console.log(`Usage: node ${getFileBasename()} FILE`);
  console.log(`An interpreter for Yaren: <https://esolangs.org/wiki/Yaren>

Options:
  --help, -h            Print this message.
  --no-io, -n           Disable the IO extension.`);
}

function printMoreInformationMessage()
{
  const fileBasename = getFileBasename();
  console.error(`Usage: node ${fileBasename} FILE`);
  console.error(`Try \`node ${fileBasename} --help' for more information.`);
}

function printUnrecognisedOptionMessage(option)
{
  console.error(`yaren: Unrecognised option: ${option}`);
  console.error(`Try \`node ${getFileBasename()} --help' for more information.`);
}

function printTooManyArgumentsMessage()
{
  console.error(`yaren: Too many arguments`);
  console.error(`Try \`node ${getFileBasename()} --help' for more information.`);
}

function printNoFileOperandMessage()
{
  console.error(`yaren: Missing file operand`);
  console.error(`Try \`node ${getFileBasename()} --help' for more information.`);
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
      console.error(`yaren: \`${filename}' does not exist`);
    }
    else if(err.code === "EISDIR")
    {
      console.error(`yaren: \`${filename}' is a directory`);
    }
    else
    {
      console.error(`yaren: \`${filename}' could not be opened`);
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
  let useIOExtension = true;

  for(let i = 2; i < process.argv.length; ++i)
  {
    const arg = process.argv[i];
    if(arg === "--help" || arg === "-h")
    {
      printHelpText();
      process.exit(0);
    }
    else if(arg === "--no-io" || arg === "-n")
    {
      useIOExtension = false;
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
      filename = arg;
    }
  }

  if(filename === null)
  {
    printNoFileOperandMessage();
    process.exit(1);
  }

  const program = tryReadFile(filename);
  interpret(program, useIOExtension);
}

run();

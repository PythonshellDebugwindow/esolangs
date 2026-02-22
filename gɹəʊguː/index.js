const fs = require("fs");
const path = require("path");

const interpret = require("./interpreter.js");

function getFileBasename() {
  return path.basename(process.argv[1]);
}

function printHelpText() {
  console.log(`Usage: node ${getFileBasename()} FILE`);
  console.log(`An interpreter for /gɹəʊguː/: <https://esolangs.org/wiki//gɹəʊguː/>

Options:
  --help, -h            Print this message.`);
}

function printMoreInformationMessage() {
  const fileBasename = getFileBasename();
  console.error(`Usage: node ${fileBasename} FILE`);
  console.error(`Try \`node ${fileBasename} --help' for more information.`);
}

function tryReadFile(filename) {
  try {
    return fs.readFileSync(filename).toString();
  } catch(err) {
    if(err.code === "ENOENT") {
      console.error(`Error: \`${filename}' does not exist`);
    } else if(err.code === "EISDIR") {
      console.error(`Error: \`${filename}' is a directory`);
    } else {
      console.error(`Error: \`${filename}' could not be opened`);
    }
    process.exit(1);
  }
}

function run() {
  if(process.argv.length !== 3) {
    printMoreInformationMessage();
    process.exit(1);
  } else if(process.argv[2] === "--help" || process.argv[2] === "-h") {
    printHelpText();
    process.exit(0);
  }
  const filename = process.argv[2];
  const program = tryReadFile(filename);
  interpret(program);
}

run();

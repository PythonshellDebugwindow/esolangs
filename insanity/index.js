const fs = require("fs");
const path = require("path");

const interpret = require("./interpreter.js");
const InterpreterError = require("./interpreter-error.js");

function getFileBasename() {
  return path.basename(process.argv[1]);
}

function printUsageMessage() {
  console.error(`Usage: node ${getFileBasename()} [OPTIONS] FILE`);
}

function printMoreInformationMessage() {
  console.error(`Try \`node ${getFileBasename()} --help' for more information.`);
}

function printHelpText() {
  printUsageMessage();
  console.log(`An interpreter for Insanity: <https://esolangs.org/wiki/Insanity>

Options:
  -f, --floating-point  Use floating-point arithmetic instead of exact arithmetic.
  -h, --help            Print this message.
  -o, --output VARS     Output only the variables in VARS ([a-zA-Z]*) before every loop.
  -p, --pause           Wait for the Enter key before every loop.`);
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

function parseArgv() {
  let filename = null;
  let isReadingOutputArgument = false;
  const options = { output: null, pause: false, useNativeArithmetic: false };

  const processOption = option => {
    if(option === "f" || option === "--floating-point") {
      options.useNativeArithmetic = true;
    } else if(option === "h" || option === "--help") {
      printHelpText();
      process.exit(0);
    } else if(option === "o" || option === "--output") {
      if(options.output !== null) {
        console.error("insanity: the variables to be output cannot be specified twice");
        printMoreInformationMessage();
        process.exit(1);
      }
      options.output = option === "o" ? "-o" : "--output";
      isReadingOutputArgument = true;
    } else if(option === "p" || option === "--pause") {
      options.pause = true;
    } else {
      console.error(`insanity: unrecognised option \`${option}'`);
      printMoreInformationMessage();
      process.exit(1);
    }
  };

  for(const argv of process.argv.slice(2)) {
    if(isReadingOutputArgument) {
      if(!/^[a-zA-Z]*$/.test(argv)) {
        console.error(`insanity: invalid variable name in ${options.output} argument: \`${argv.match(/[^a-zA-Z]/)[0]}'`);
        printMoreInformationMessage();
        process.exit(1);
      }
      options.output = argv;
      isReadingOutputArgument = false;
    } else if(argv.startsWith("--")) {
      processOption(argv);
    } else if(argv[0] === "-") {
      for(const option of argv.substring(1)) {
        processOption(option);
      }
    } else {
      if(filename !== null) {
        printUsageMessage();
        printMoreInformationMessage();
        process.exit(1);
      }
      filename = argv;
    }
  }
  if(isReadingOutputArgument) {
    console.error("insanity: missing argument to " + options.output);
    printMoreInformationMessage();
    process.exit(1);
  } else if(filename === null) {
    printUsageMessage();
    printMoreInformationMessage();
    process.exit(1);
  }
  return { filename, options };
}

async function run() {
  const { filename, options } = parseArgv();
  const program = tryReadFile(filename);
  try {
    const result = await interpret(program, options);
    if(result) {
      console.error(result.message);
      printMoreInformationMessage();
      process.exit(1);
    }
  } catch(err) {
    if(err instanceof InterpreterError) {
      console.error("Error on line " + err.lineNumber + ": " + err.message);
      console.error("  " + err.line);
      console.error("  " + " ".repeat(err.column) + "^");
      process.exit(1);
    } else {
      throw err;
    }
  }
}

run();

const fs = require("fs");
const compile = require("./compile.js");

function readFile(filename)
{
  return fs.readFileSync(filename).toString();
}

function run()
{
  const filename = prompt("Enter filename");
  const code = readFile(filename);
  const compiledCode = compile(code);
  eval(compiledCode);
}
run();

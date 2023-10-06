const fs = require("fs");

if(process.argv.length <= 2)
{
  console.error("Error: Missing file operand");
  process.exit(1);
}

const filename = process.argv[2];
if(!fs.existsSync(filename))
{
  console.log(`Error: The file ${filename} does not exist`);
  process.exit(1);
}
else if(!fs.lstatSync(filename).isFile())
{
  console.log(`Error: ${filename} is a directory`);
  process.exit(1);
}

const interpret = require("./interpreter.js");

const program = fs.readFileSync(filename).toString();
interpret(program);

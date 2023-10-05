const fs = require("fs");

if(process.argv.length > 2)
{
  const filename = process.argv[2];
  if(fs.existsSync(filename))
  {
    if(fs.lstatSync(filename).isFile())
    {
      const interpret = require("./runner.js");
      const program = fs.readFileSync(filename).toString();
      interpret(program, filename);
    }
    else
    {
      console.log(`Error: ${filename} is a directory`);
    }
  }
  else
  {
    console.log(`Error: The file ${filename} does not exist`);
  }
}
else
{
  console.log(`Error: Missing file operand`);
}

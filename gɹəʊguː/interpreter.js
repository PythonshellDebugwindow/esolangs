const readline = require("readline");
const util = require("util");

async function interpret(program) {
  let nr = 0;
  let dm = 0;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  const question = util.promisify(rl.question).bind(rl, "");

  interpreterLoop:
  for(let i = 0; i < program.length; ++i) {
    switch(program[i]) {
      case "[":
        console.log("[no output]");
        break;

      case ";": {
        const input = await question();
        nr = /^-?[0-9]+$/.test(input) ? parseInt(input) : 0;
        break;
      }

      case "]":
        program += "[";
        i = program.lastIndexOf("[", i);
        break;

      case "&":
        if(/[0-9]/.test(program[i + 1])) {
          ++i;
          nr += parseInt(program[i]);
        }
        break;

      case "<":
        --nr;
        break;

      case "!":
        if(nr < 0) {
          ++i;
          if(program[i] === "&" && /[0-9]/.test(program[i + 1])) {
            ++i;
          }
        }
        break;

      case ",":
        console.log(Math.floor(nr / 2).toString());
        break;

      case "+":
        nr *= 2;
        break;

      case "-":
        nr = 0;
        break;

      case "{":
        dm = nr;
        break;

      case "}":
        nr = dm;
        break;

      case "?":
        break interpreterLoop;
    }
  }

  rl.close();
}

module.exports = interpret;

const {question} = require("readline-sync");

function interpret(code) {
  code = code.split("\n");
  var v = {};
  var i, l, t;

  function ivalue(i) {
    t = l[i];

    if(/^[0-9]+$/.test(t)) {
      return parseInt(t);
    } else if(t == "$") {
      return Math.abs(parseInt(question("> "))) || 0;
    } else if(/^-[0-9]+$/.test(t)) {
      return v[-parseInt(t)] || 0;
    } else {
      return 0;
    }
  }

  for(var i = 0; i < code.length; i++) {
    l = code[i].split(" ");
    
    switch(l[0]) {
      case "W":
        v[ivalue(1)] = ivalue(2);
        break;
      case "A":
        if(ivalue(1) in v) {
          v[ivalue(1)]++;
        } else {
          v[ivalue(1)] = 1;
        }
        break;
      case "D":
        if(ivalue(1) in v) {
          v[ivalue(1)]--;
          if(v[ivalue(1)] < 0) {
            v[ivalue(1)] = 0;
          }
        } else {
          v[ivalue(1)] = 0;
        }
        break;
      case "R":
        console.log(ivalue(1).toString());
        break;
      case "J":
        if(ivalue(1) >= code.length) {
          console.log("JUMPERROR LINE " + i + "!");
          return;
        }
        i = ivalue(1) - 1;
        break;
      case "N":
        if(ivalue(2) != 0) {
          if(ivalue(1) >= code.length) {
            console.log("JUMPERROR LINE " + i + "!");
            return;
          }
          i = ivalue(1) - 1;
        }
        break;
      case "H":
        return;
      default:
        if(code[i] != "") {
          console.log("SYNTAXERROR LINE " + i + "!");
          return;
        }
    }
  }
}

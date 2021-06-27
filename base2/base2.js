function interpret(code) {
  let cellA = Math.random() >= 0.5;
  let cellB = Math.random() >= 0.5;
  let codeHasError = false;
  code = code.split("\n");
  
  /* This cellSequence function has to be here, else the cells would have to
  be passed as parameters */
  function cellSequence(str) {
    let result = "";
    for(let i = 0; i < str.length; i++) {
      if(str.charAt(i) == "A") result += cellA? "1":"0";
      else if(str.charAt(i) == "B") result += cellB? "1":"0";
      else return -1;
    }
    return parseInt(result, 2);
  }
  // There must be 2^n lines (instructions) in each program
  if(Math.log2(code.length) % 1 !== 0) {
    console.log("Error: not 2^n lines");
    return;
  }
  
  code.forEach(function(i) {
    if(codeHasError) return;
    
    if(i == "") {
      return;
    }
    i = i.split(" ");
    switch(i[0]) {
      case "set":
        if (i.length === 1) {
          codeHasError = true;
          return;
        }
        if(i[1] === "A") {
          cellA = true;
        } else if(i[1] === "B") {
          cellB = true;
        }
        break;
      case "offset":
        if(i[1] === "A") {
          cellA = !cellA;
        } else if(i[1] === "B") {
          cellB = !cellB;
        }
        break;
      case "swap":
        let temp = cellA;
        cellA = cellB;
        cellB = temp;
        break;
      case "yell":
        if(i.length === 1) {
          codeHasError = true;
          return;
        }
        if(i[1] == "A") {
          console.log(cellA ? "true" : "ntrue");
        } else if(i[1] == "B") {
          console.log(cellB ? "true" : "ntrue");
        }
        break;
      case "scream":
        if(i.length === 1) {
          codeHasError = true;
          return;
        }
        if(cellSequence(i[1]) != -1) process.stdout.write(String.fromCharCode(cellSequence(i[1])));
        break;
      case "doorbell":
        if(i.length === 1 || cellSequence(i[i.length - 1]) == -1) {
          codeHasError = true;
          return;
        }
        for(let j = 0; j < cellSequence(i[1]); j++) {
          console.log("Ding-dong!");
        }
        break;
      default:
        if(i[0] != "true" && i[0] != "ntrue" && i[0] && cellSequence(i[0]) == -1) {
          codeHasError = true;
          return;
        }
    }
    for(let j = 1; j < i.length; j++) {
      if(i[j] != "true" && i[j] != "ntrue" && cellSequence(i[j]) == -1) {
        codeHasError = true;
        return;
      }
    }
  });
  if(codeHasError) console.log("Error");
}

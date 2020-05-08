function interpret(s) {
  var acc = 0;
  var out = "";
  
  for(var i = 0; i < s.length; i++) {
    if(s[i] == "+" && ++acc > 255) acc = 0;
    if(s[i] == "-") {
      out += String.fromCharCode(acc);
      if(--acc < 0) acc = 255;
    }
  }
  console.log(out);
}

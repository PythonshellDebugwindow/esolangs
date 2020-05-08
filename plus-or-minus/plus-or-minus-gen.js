function genPlusOrMinusToPrint(s) {
  s = s.split("").map(c => c.charCodeAt(0));
  var c = "";
  var a = 0;
  var i = 0;
  while(i < s.length) {
    if(a == s[i]) {
      c += "-";
      i++;
      if(--a < 0) a = 255;
    } else {
      c += "+";
      if(++a > 255) a = 0;
    }
  }
  return c;
}

function interpret() {
  if (!/^(\r?\n)*$/.test(document.getElementById("code").value)) {
    let output = document.getElementById("output");
    output.style.color = "red";
    output.value = "SyntaxError: Invalid character in source code";
  }
}

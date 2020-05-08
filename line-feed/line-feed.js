function interpret(code) {
  if (!/^(\r?\n)*$/.test(code)) {
    console.log("\033[38;2;255;0;0mSyntaxError: Invalid character in source code\033[0;0;0m");
  }
}

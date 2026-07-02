class InterpreterError extends Error {
  constructor(program, i, message) {
    super(message);
    const lineStart = program.lastIndexOf("\n", i - 1) + 1;
    let lineEnd = program.indexOf("\n", i);
    if(lineEnd === -1) {
      lineEnd = program.length;
    }
    this.line = program.substring(lineStart, lineEnd);
    this.lineNumber = program.substring(0, i).split("\n").length;
    this.column = i - lineStart;
  }
}

module.exports = InterpreterError;

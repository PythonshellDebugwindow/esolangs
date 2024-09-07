class InterpreterError extends Error
{
  constructor(message, token)
  {
    super(message);
    this.lineNumber = token.lineNumber;
    this.column = token.column;
  }
}

module.exports = InterpreterError;

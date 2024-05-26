class InterpreterError extends Error
{
  constructor(message, position)
  {
    super(message);
    this.lineNumber = position.lineNumber;
    this.column = position.column;
  }
}

module.exports = InterpreterError;

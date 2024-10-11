class ParseError extends Error
{
  constructor(message, position)
  {
    super(message);
    this.position = position;
  }
}

module.exports = ParseError;

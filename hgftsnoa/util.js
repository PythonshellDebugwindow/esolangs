const keywords = {
  HELLO:   "T",
  GOODBYE: "TT",
  IF:      "TTT",
  IT:      "TTTT",
  IS:      "TTTTT",
  THEN:    "TTTTTT",
  OR:      "TTTTTTT",
  AND:     "TTTTTTTT"
};

const globalKeywordRegexps = {};
for(const name in keywords)
{
  globalKeywordRegexps[name] = new RegExp(keywords[name], "g");
}

const noReturnValue = Symbol("no return value");

function makeError(token, message)
{
  return {
    successful: false,
    line: token.startLine,
    column: token.startColumn,
    message: message
  };
}

class InterpreterException extends Error
{
  constructor(token, message)
  {
    super(message);
    this.name = "InterpreterException";
    this.line = token.startLine;
    this.column = token.startColumn;
    this.message = message;
  }
}

module.exports = {
  keywords, globalKeywordRegexps,
  noReturnValue, makeError, InterpreterException
};
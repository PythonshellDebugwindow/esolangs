@{%
const moo = require("moo");

const lexer = moo.compile({
  newline: {match: /[\n]+/, lineBreaks: true},
  ws:      /[ \t]+/,
  id:      /[A-Za-z-]+/,
  string:  {match: /"[^"]*?"/, lineBreaks: true},
  lparen:  "(",
  rparen:  ")",
  comma:   ","
});

const Types = require("./types.js");

function parseRawString(rawString)
{
  return rawString.substring(1, rawString.length - 1);
}
%}

@lexer lexer

main -> multiline_ws:? (function_call multiline_ws):* function_call:? {%
  ([, functionCalls, lastFunctionCall]) => {
    let statements = functionCalls.map(id);
    if(lastFunctionCall !== null)
    {
      statements.push(lastFunctionCall);
    }
    return statements;
  }
%}

multiline_ws -> (%ws:? %newline):+ %ws:?

mws -> (%ws | %newline):*

function_call -> %id mws %lparen mws arguments %rparen {%
  ([nameToken, , , , rawArguments, , ,]) => {
    let arguments = [];
    if(rawArguments.length > 0)
    {
      arguments.push(rawArguments[0]);
      if(rawArguments.length > 1)
      {
        for(const argument of rawArguments[1])
        {
          arguments.push(argument[3]);
        }
      }
    }
    return {
      type: Types.FUNCTION_CALL, name: nameToken.value, arguments,
      lineNumber: nameToken.line, column: nameToken.col
    };
  }
%}

arguments -> null {% () => [] %} |
             (argument (mws %comma mws argument):*) mws {% id %}

argument -> function_call {% id %} |
            string {% id %}

string -> %string {%
  ([string]) => ({type: Types.STRING, value: parseRawString(string.value)})
%}

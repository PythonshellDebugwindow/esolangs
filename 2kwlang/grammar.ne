@{%
const moo = require("moo");

const lexer = moo.compile({
  import_:   {match: /i\s*m\s*p\s*o\s*r\s*t/, lineBreaks: true},
  print:     {match: /p\s*r\s*i\s*n\s*t/, lineBreaks: true},
  float:     {match: /(?:[0-9]\s*)+\.(?:\s*[0-9])+/, lineBreaks: true},
  integer:   {match: /(?:[0-9]\s*)*[0-9]/, lineBreaks: true},
  string:    {match: /"(?:[^\\"]|\\"|\\)+"/, lineBreaks: true},
  emptyStr:  '""',
  semicolon: ";",
  pipe:      "|",
  add:       "+",
  sub:       "-",
  mul:       "*",
  div:       "/",
  mod:       "%",
  eq:        {match: /=\s*=/, lineBreaks: true},
  neq:       {match: /!\s*=/, lineBreaks: true},
  lte:       {match: /<\s*=/, lineBreaks: true},
  gte:       {match: />\s*=/, lineBreaks: true},
  lt:        "<",
  gt:        ">",
  lparen:    "(",
  rparen:    ")",
  ws:        {match: /\s+/, lineBreaks: true}
});

const Commands = require("./commands.js");
const Operations = require("./operations.js");
const Rational = require("./rational.js");
%}

@lexer lexer

file -> ws (statement ws):* {%
  ([, body]) => body.map(id)
%}

# import statement
statement -> %import_ ws value ws %semicolon {%
  ([, , value, , ]) => ({
    type: Commands.IMPORT, filename: value
  })
%}

# print statement (to standard output)
statement -> %print ws value_no_gt ws %semicolon {%
  ([, , value, , ]) => ({
    type: Commands.PRINT, printTrailingNewline: true, value
  })
%}
statement -> %print ws value (ws %pipe ws %emptyStr ws %semicolon) {%
  ([, , value, ]) => ({
    type: Commands.PRINT, printTrailingNewline: false, value
  })
%}

# print statement (to a file)
statement -> %print ws value (ws %gt ws) value_no_gt ws %semicolon {%
  ([, , value, , filename, , ]) => ({
    type: Commands.WRITE_TO_FILE, printTrailingNewline: true, value, filename
  })
%}
statement -> %print ws value (ws %pipe ws %emptyStr ws %gt ws) value ws %semicolon {%
  ([, , value, , filename, , ]) => ({
    type: Commands.WRITE_TO_FILE, printTrailingNewline: false, value, filename
  })
%}

# print import statement
statement -> (%print ws %import_ ws) value ws %semicolon {%
  ([, value, ,]) => ({
    type: Commands.PRINT_IMPORT, filename: value
  })
%}

# value
statement -> value ws %semicolon {% ([value, ,]) => ({type: Commands.VALUE, value}) %}

value -> value (ws %eq  ws) sum {% ([lhs, , rhs]) => Operations.equals(lhs, rhs) %}
       | value (ws %neq ws) sum {% ([lhs, , rhs]) => Operations.notEquals(lhs, rhs) %}
       | value (ws %lt  ws) sum {% ([lhs, , rhs]) => Operations.lessThan(lhs, rhs) %}
       | value (ws %gt  ws) sum {% ([lhs, , rhs]) => Operations.greaterThan(lhs, rhs) %}
       | value (ws %lte ws) sum {% ([lhs, , rhs]) => Operations.lessThanOrEqualTo(lhs, rhs) %}
       | value (ws %gte ws) sum {% ([lhs, , rhs]) => Operations.greaterThanOrEqualTo(lhs, rhs) %}
       | sum {% id %}

value_no_gt -> value_no_gt (ws %eq  ws) sum {% ([lhs, , rhs]) => Operations.equals(lhs, rhs) %}
             | value_no_gt (ws %neq ws) sum {% ([lhs, , rhs]) => Operations.notEquals(lhs, rhs) %}
             | value_no_gt (ws %lt  ws) sum {% ([lhs, , rhs]) => Operations.lessThan(lhs, rhs) %}
             | value_no_gt (ws %lte ws) sum {% ([lhs, , rhs]) => Operations.lessThanOrEqualTo(lhs, rhs) %}
             | value_no_gt (ws %gte ws) sum {% ([lhs, , rhs]) => Operations.greaterThanOrEqualTo(lhs, rhs) %}
             | sum {% id %}

sum -> sum (ws %add ws) product {% ([lhs, , rhs]) => Operations.add(lhs, rhs) %}
     | sum (ws %sub ws) product {% ([lhs, , rhs]) => Operations.subtract(lhs, rhs) %}
     | product {% id %}

product -> product (ws %mul ws) basicValue {% ([lhs, , rhs]) => Operations.multiply(lhs, rhs) %}
         | product (ws %div ws) basicValue {% ([lhs, , rhs]) => Operations.divide(lhs, rhs) %}
         | product (ws %mod ws) basicValue {% ([lhs, , rhs]) => Operations.modulo(lhs, rhs) %}
         | basicValue {% id %}

basicValue -> parens      {% id %}
            | importPrint {% id %}
            | string      {% id %}
            | int         {% id %}
            | real        {% id %}

parens -> %lparen value %rparen {%
  ([, value, ]) => value
%}

importPrint -> (%import_ ws %print ws) basicValue {%
  ([, filename]) => Operations.importPrint(filename)
%}

string -> %string {%
  ([string]) => {
    const value = string.value.substring(1, string.value.length - 1).replace(/\\"/g, '"');
    return (e) => value.replace(/\\([0-9]+)/g, (_, n) => e.inputDictionary.get(BigInt(n)) || "");
  }
%}
string -> %emptyStr {% () => () => "" %}

int -> (%sub ws):? %integer {%
  ([negative, int]) => {
    const intStr = int.value.replace(/\s+/g, "");
    const sign = negative ? -1n : 1n;
    return () => new Rational(BigInt(intStr), 1n, sign);
  }
%}

real -> (%sub ws):? %float {%
  ([negative, real]) => {
    const sign = negative ? -1n : 1n;
    const realStr = real.value.replace(/\s+/g, "").replace(/0+$/, "");
    if(realStr.endsWith("."))
    {
      const intStr = realStr.substring(0, realStr.length - 1);
      return () => new Rational(BigInt(intStr), 1n, sign);
    }
    else
    {
      const dividend = BigInt(realStr.replace(".", ""))
      const divisorMagnitude = realStr.length - realStr.indexOf(".") - 1;
      const divisor = 10n ** BigInt(divisorMagnitude);
      return () => new Rational(dividend, divisor, sign);
    }
  }
%}

ws -> %ws:?

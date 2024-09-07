@{%
const moo = require("moo");

const lexer = moo.compile({
  newline: {match: /\n/u, lineBreaks: true},
  idChar: {
    match: /[\u4E00-\u9FFF]/u, // CJK Unified Ideographs
    type: moo.keywords({
      ifTrue:       "凹",
      argument:     "兄",
      beginFnStart: "九",
      beginFnEnd:   "丫",
      endFn:        "乞",
      callFn:       "也",
      beginSetVar:  "儳",
      endSetVar:    "墎",
      input:        "卯",
      output:       "吇",
      and:          "习",
      or:           "乡",
      not:          "乢",
      false:        "乣"
    })
  }
});

const commands = require("./commands");
%}

@lexer lexer

program -> functionDef (%newline:? functionDef):* %newline:? {%
  ([first, rest, ]) => [first, ...rest.map(([, fnDef]) => fnDef)]
%}

functionDef -> parameter:* %beginFnStart id %beginFnEnd body %endFn {%
  ([parameters, , nameToken, , body, ]) => ({
    parameters, name: nameToken.value, body,
    lineNumber: nameToken.lineNumber, column: nameToken.column
  })
%}

parameter -> %argument id {% ([, nameToken]) => nameToken %}

body -> assignment:* output:* value {%
  ([assignments, outputs, value]) => ({assignments, outputs, value})
%}

assignment -> id %beginSetVar value %endSetVar {%
  ([nameToken, , value, ]) => new commands.Assignment(nameToken, value)
%}

assignment -> id %beginSetVar %input %endSetVar {%
  ([nameToken, , , ]) => new commands.InputToVariable(nameToken)
%}

output -> value %output {% ([value, ]) => new commands.Output(value) %}

value -> value %ifTrue basic {%
  ([condition, , expr]) => new commands.RunIfTrue(condition, expr)
%}

value -> value %and basic {%
  ([lhs, , rhs]) => new commands.And(lhs, rhs)
%}

value -> value %or basic {%
  ([lhs, , rhs]) => new commands.Or(lhs, rhs)
%}

value -> value %not {%
  ([value, ]) => new commands.Not(value)
%}

value -> basic {% id %}

basic -> argument:* %callFn id {%
  ([arguments, , nameToken]) => new commands.Call(nameToken, arguments)
%}

argument -> %argument value {% ([, value]) => value %}

basic -> id {% ([nameToken]) => new commands.VariableReference(nameToken) %}

basic -> %false {% () => commands.False %}

id -> %idChar:+ {%
  ([chars]) => ({
    value: chars.map(char => char.value).join(""),
    lineNumber: chars[0].line,
    column: chars[0].col
  })
%}

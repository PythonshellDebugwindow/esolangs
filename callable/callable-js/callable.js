const fs = require("fs");
const ohm = require("ohm-js");
const grammar = ohm.grammar(fs.readFileSync("callable.ohm"));
const semantics = grammar.createSemantics();

var vars = {};

const FUNCS = {
  "IF-EQ": (x, y, code1, ...code) => x.parse() === y.parse() ? [code1, ...code].map(c => c.parse())[code.length] : "",
  "IF-NEQ": (x, y, code1, ...code) => x.parse() !== y.parse() ? [code1, ...code].map(c => c.parse())[code.length] : "",
  "INPUT": () => prompt(""),
  "PRINT": value => console.log(value.parse()),
  "VAR-GET": name => vars[name.sourceString] || "",
  "VAR-SET": (name, value) => (vars[name.sourceString] = value.parse().slice()),
  "WHILE-EQ": (x, y, code1, ...code) => {
    var res = "";
    var body = [code1, ...code];
    while(x.parse() === y.parse())
      res = body.map(c => c.parse())[code.length];
    return res;
  },
  "WHILE-NEQ": (x, y, code1, ...code) => {
    var res = "";
    var body = [code1, ...code];
    while(x.parse() !== y.parse())
      res = body.map(c => c.parse())[code.length];
    return res;
  }
};

function callFunc(id, ...args)
{
  var name = id.sourceString;
  if(name in FUNCS)
    return FUNCS[name](...args);
  else
    throw new ReferenceError("no function named `" + name + "'");
}

semantics.addOperation(
  "parse", {
    Prog: (firstLine, newlines, lines) =>  [firstLine, ...lines.children].map(c => c.parse()),
    Call_noArgs: (name, _l, _r) => callFunc(name),
    Call_oneArg: (name, _l, arg, _r) => callFunc(name, arg),
    Call_multiArgs: (name, _l, arg1, _c, otherArgs, _r) => callFunc(name, arg1, ...otherArgs.children),
    Arg: arg => arg.parse(),
    string: (_l, str, _r) => str.sourceString,
    id: id => id.sourceString
  }
);

module.exports = prog => {
  vars = {};
  const result = grammar.match(prog);
  if(!result.succeeded())
    throw new Error("Parsing failed: " + result);
  else
    return semantics(result).parse();
};

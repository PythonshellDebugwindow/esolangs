const ProgramException = require("./program-exception.js");
const Rational = require("./rational.js");


function equals(x, y)
{
  if(typeof x !== typeof y)
  {
    return false;
  }
  else if(typeof x === "string")
  {
    return x === y;
  }
  else
  {
    return Rational.equals(x, y);
  }
}

function boolToRational(bool)
{
  return new Rational(BigInt(bool), 1n, 1n);
}

function importPrint(filename, e)
{
  const name = filename(e);
  if(!e.files.has(name))
  {
    throw ProgramException;
  }
  return e.files.get(name);
}

const Operations = Object.freeze({
  add:      (x, y) => (e) => Rational.add(x(e), y(e)),
  subtract: (x, y) => (e) => Rational.subtract(x(e), y(e)),
  multiply: (x, y) => (e) => Rational.multiply(x(e), y(e)),
  divide:   (x, y) => (e) => Rational.divide(x(e), y(e)),
  modulo:   (x, y) => (e) => Rational.modulo(x(e), y(e)),
  equals:      (x, y) => (e) => boolToRational(equals(x(e), y(e))),
  notEquals:   (x, y) => (e) => boolToRational(!equals(x(e), y(e))),
  lessThan:    (x, y) => (e) => boolToRational(Rational.lessThan(x(e), y(e))),
  greaterThan: (x, y) => (e) => boolToRational(Rational.greaterThan(x(e), y(e))),
  lessThanOrEqualTo: (x, y) => (e) => boolToRational(!Rational.greaterThan(x(e), y(e))),
  greaterThanOrEqualTo: (x, y) => (e) => boolToRational(!Rational.lessThan(x(e), y(e))),
  importPrint: (filename) => (e) => importPrint(filename, e)
});


module.exports = Operations;

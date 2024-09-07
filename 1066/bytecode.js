const Bytecode = Object.freeze({
  ASSIGN: Symbol("ASSIGN"),
  INPUT_TO_VARIABLE: Symbol("INPUT_TO_VARIABLE"),
  OUTPUT: Symbol("OUTPUT"),
  RUN_IF_TRUE: Symbol("RUN_IF_TRUE"),
  CALL: Symbol("CALL"),
  AND: Symbol("AND"),
  OR: Symbol("OR"),
  NOT: Symbol("NOT"),
  ACCESS_VARIABLE: Symbol("ACCESS_VARIABLE"),
  FALSE: Symbol("FALSE"),
  RETURN: Symbol("RETURN")
});

module.exports = Bytecode;

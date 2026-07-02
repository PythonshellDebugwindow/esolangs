function getVariableIndex(value) {
  if(/[a-z]/.test(value)) {
    return value.charCodeAt(0) - 97;
  } else if(/[A-Z]/.test(value)) {
    return value.charCodeAt(0) - 65 + 26;
  } else {
    throw new RangeError(`Internal error: invalid variable name \`${value}'`);
  }
}

module.exports = getVariableIndex;

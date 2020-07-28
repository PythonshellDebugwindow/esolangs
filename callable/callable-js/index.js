const fs = require("fs");
const interpretCallable = require("./callable.js");

void interpretCallable(fs.readFileSync("program.call"));

function stripInvalidAndAddHeader(code)
{
  let res = code.replace(/\s/g, " ")
                .replace(/[^NYAnya ]/g, "");
  res = "let p=0,m=[0],t=0;" + res + " "; 
  return res;
}

function replaceCommandsFromBrainf(code)
{
  return code.replace(/NYa /g, "while(m[p]){")
             .replace(/nYA /g, "}")
             .replace(/Nya /g, "++p;if(p>=m.length)m.push(0);")
             .replace(/nyA /g, "--p;")
             .replace(/NYA /g, "process.stdout.write(String.fromCharCode(m[p]));")
             .replace(/NyA /g, "++m[p];")
             .replace(/nYa /g, "--m[p];")
             .replace(/nya /g, "m[p]=(prompt('')+'\0').charCodeAt(0);");
}

function replaceNewCommands(code)
{
  return code.replace(/nyan /g, "t=m[p];")
             .replace(/NYAN /g, "m[p]=t;")
             .replace(/NyaN /g, "++t;")
             .replace(/nYAn /g, "--t;")
             .replace(/NYAn /g, "t+=m[p];")
             .replace(/nYAN /g, "t-=m[p];")
             .replace(/NyAN /g, "t=0;");
}

function compile(code)
{
  let res = stripInvalidAndAddHeader(code);
  res = replaceCommandsFromBrainf(res);
  res = replaceNewCommands(res);
  return res;
}

module.exports = compile;

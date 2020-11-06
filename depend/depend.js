module.exports = function depend(code)
{
  code = code.split("\n");
  var events = {};
  var m, tmp;
  for(var line of code)
  {
    if(m = line.match(/^([A-Za-z0-9_]+)->((?:[A-Za-z0-9_]+,)*[A-Za-z0-9_]+|)$/))
    {
      tmp = m[2].split(",").filter(d => !!d);
      if(m[1] in events)
        events[m[1]].push(...tmp);
      else
        events[m[1]] = tmp;
    }
    else if(line !== "" && line.substring(0, 2) !== "->")
      throw new SyntaxError("Invalid syntax");
  }
  while(Object.keys(events).length !== 0)
  {
    for(var event in events)
    {
      if(events[event].length === 0)
        delete events[event];
      else
        for(var dependency of events[event])
          if(!(dependency in events))
            events[event].splice(event.indexOf(dependency), 1);
    }
  }
}

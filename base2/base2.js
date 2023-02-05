if(!Math.log2)
{
	Math.log2 = function(x)
	{
		return Math.log(x) * Math.LOG2E;
	};
}

function base2(code)
{
	var cellA = Math.random() >= 0.5;
	var cellB = Math.random() >= 0.5;
	var codeHasError = false;
	var codeError = null;
	var output = "";
	code = code.split("\n");
	
	function cellSequence(str)
	{
		var result = 0;
		var curNumber = 0;
		var curPower = 1;
		for(var i = str.length - 1; i >= 0; --i)
		{
			if(str.charAt(i) == "A")
			    curNumber = cellA ? 1 : 0;
			else if(str.charAt(i) == "B")
			    curNumber = cellB ? 1 : 0;
			else
			    return -1;
			
			result += curNumber * curPower;
			curPower *= 2;
		}
		return result;
	}
	
	//There must be 2^n lines in each program
	if(Math.log2(code.length) % 1 !== 0)
	{
	    codeHasError = true;
	    codeError = "The number of lines in the program is not a (non-zero) power of two.";
	}
	else
	{
		outerLoop:
		for(var index = 0, i = null; index < code.length; ++index)
		{
		    i = code[index];

			if(codeHasError)
			    break;

			if(i === "")
				break;

			i = i.split(" ");
			switch(i[0])
			{
				case "set":
					if(i.length === 1)
					{
						codeHasError = true;
				    	codeError = "Line " + (index + 1) + ": Invalid syntax.";
						break outerLoop;
					}
					if(i[1] === "A")
						cellA = true;
					else if(i[1] === "B")
						cellB = true;
					break;
				
				case "offset":
					if(i.length === 1)
					{
						codeHasError = true;
				    	codeError = "Line " + (index + 1) + ": Invalid syntax.";
						break outerLoop;
					}
					if(i[1] === "A")
						cellA = !cellA;
					else if(i[1] === "B")
						cellB = !cellB;
					break;
				
				case "swap":
					let temp = cellA;
					cellA = cellB;
					cellB = temp;
					break;
				
				case "yell":
					if(i.length === 1)
					{
						codeHasError = true;
				    	codeError = "Line " + (index + 1) + ": Invalid syntax.";
						break outerLoop;
					}
					if(i[1] == "A")
						output += cellA ? "true\n" : "ntrue\n";
					else if(i[1] == "B")
						output += cellB ? "true\n" : "ntrue\n";
					break;
				
				case "scream":
					if(i.length === 1)
					{
						codeHasError = true;
				    codeError = "Line " + (index + 1) + ": Invalid syntax.";
						break outerLoop;
					}
					var cellSeq = cellSequence(i[1]);
					//This command ignores invalid cell sequences
					if(cellSeq !== -1)
					    output += String.fromCharCode(cellSeq);
					break;
				
				case "doorbell":
				    var cellSeq;

					if(i.length === 1)
					    codeHasError = true;
					else
					{
					    cellSeq = cellSequence(i[1]);
					    if(cellSeq === -1)
						codeHasError = true;
					}
					if(codeHasError)
					{
				    	codeError = "Line " + (index + 1) + ": Invalid syntax.";
						break outerLoop;
					}

					for(var j = 0; j < cellSeq; ++j)
						output += "Ding-dong\n";

					break;
				
				default:
					if(i[0] && i[0] !== "true" && i[0] !== "ntrue" && cellSequence(i[0]) === -1)
					{
						codeHasError = true;
				    	codeError = "Line " + (index + 1) + ": Invalid syntax.";
						break outerLoop;
					}
			}
			for(var j = 1; j < i.length; ++j)
			{
				if(i[j] != "true" && i[j] != "ntrue" && cellSequence(i[j]) == -1)
				{
					codeHasError = true;
			    	codeError = "Line " + (index + 1) + ": Invalid syntax.";
					break outerLoop;
				}
			}
		}
	}
	
	if(codeHasError)
		return [false, codeError];
	
	return [true, output];
}

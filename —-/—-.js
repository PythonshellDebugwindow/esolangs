function interpret(code) {
    var cells = [0, 0, 0, 0];
    var cell = 0;
    for(var i = 0; i < code.length; i++) {
        if(code[i] == "—") {
            if(code[i + 1] == "-") {
                if(cells[cell]) {
                    i = cells[cell] - 1;
                } else {
                    process.stdout.write(cells[cell + 1]);
                    cell--;
                    if(cell < 0) {
                        cell = 3;
                    }
                    i++;
                }
            } else {
                cells[cell] += 3;
                cells[cell] %= 256;
                cell++;
                if(cell > 3) {
                    cell = 0;
                }
            }
        } else if(code[i] == "-") {
            cell--;
            if(cell < 0) {
                cell = 3;
            }
        }
        if(cells[cell] < 0) {
            cells[cell] = 255;
        } else if(cells[cell] > 255) {
            cells[cell] -= 256;
        }
    }
}

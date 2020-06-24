class interpret:
    def __init__(self, code):
        self.dt = [0]
        self.dp = 0
        self.cp = None
        self.jo = 0
        self.i = 0

        self.run(code)

    def uparrow(self):
        if self.cp == None:
            self.dp += 1
            if self.dp >= len(self.dt):
                self.dt.append(0)
        elif self.cp == 0:
            self.dt[self.dp] += 1
        elif self.cp == 1:
            self.jo += 1
        elif self.cp == 2:
            self.cp += 1
        else:
            self.cp = 2

    def downarrow(self):
        if self.cp == None:
            self.dp -= 1
            if self.dp < 0:
                raise ValueError("Data pointer < 0")
        elif self.cp == 0:
            self.dt[self.dp] -= 1
        elif self.cp == 1:
            self.jo -= 1
        elif self.cp == 2:
            self.cp -= 1
        else:
            inp = input("> ")
            if inp.lstrip("-").isdigit():
                self.dt[self.dp] = int(inp)
            else:
                raise ValueError("Invalid input (not integer)")

    def zero(self):
        if self.cp == None:
            self.dp = 0
        elif self.cp == 0:
            self.dt[self.dp] = 0
        elif self.cp == 1:
            self.jo = 0
        elif self.cp == 2:
            self.cp = 0
        else:
            self.i -= self.jo
            self.i -= 1 #To cancel out the self.i+=1 in the self.run() loop

    def one(self):
        if self.cp == None:
            self.dp = 1
            if self.dp >= len(self.dt):
                self.dt.append(0)
        elif self.cp == 0:
            self.dt[self.dp] = 1
        elif self.cp == 1:
            self.jo = 1
        elif self.cp == 2:
            self.cp = 1
        else:
            self.i += self.jo
            self.i -= 1 #To cancel out the self.i+=1 in the self.run() loop

    def botharrow(self):
        if self.cp == None:
            self.cp = 0
        elif self.cp == 0:
            print(self.dp)
            self.cp = 2
        elif self.cp == 1:
            print(self.dt[self.dp])
        elif self.cp == 2:
            print(self.jo)
            self.jo *= 2
        else:
            print(self.cp)

    def botharrowline(self):
        if self.cp == None:
            self.cp = 3
        elif self.cp == 0:
            if self.dt[self.dp] != 0:
                self.i += 1
        elif self.cp == 1:
            self.cp = None
        elif self.cp == 2:
            if self.dp != 0:
                self.i += 1
        else:
            self.cp = None
    
    def run(self, code):
        l = len(code)
        while 0 <= self.i < l:
            cmd = code[self.i]
            if cmd == "↑":
                self.uparrow()
            elif cmd == "↓":
                self.downarrow()
            elif cmd == "0":
                self.zero()
            elif cmd == "1":
                self.one()
            elif cmd == "↕":
                self.botharrow()
            elif cmd == "↨":
                self.botharrowline()
            self.i += 1

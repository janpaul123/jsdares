/* Jison generated parser */
var jsmmparser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"programStatementList":4,"EOF":5,"NEWLINE":6,"commonStatement":7,"functionDeclaration":8,"statementList":9,"simpleStatement":10,";":11,"blockStatement":12,"returnStatement":13,"assignmentStatement":14,"varStatement":15,"callStatement":16,"identExpression":17,"++":18,"=":19,"expression":20,"+=":21,"VAR":22,"varList":23,"varListItem":24,",":25,"NAME":26,"RETURN":27,"andExpression":28,"||":29,"relationalExpression":30,"&&":31,"addExpression":32,"==":33,"multExpression":34,"+":35,"unaryExpression":36,"*":37,"primaryExpression":38,"!":39,"NUMBER":40,"STRING":41,"TRUE":42,"FALSE":43,"(":44,")":45,".":46,"[":47,"]":48,"callArguments":49,"ifBlock":50,"whileBlock":51,"forBlock":52,"IF":53,"{":54,"}":55,"elseBlock":56,"ELSE":57,"WHILE":58,"FOR":59,"FUNCTION":60,"functionArguments":61,"reserved":62,"RESERVED":63,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"NEWLINE",11:";",18:"++",19:"=",21:"+=",22:"VAR",25:",",26:"NAME",27:"RETURN",29:"||",31:"&&",33:"==",35:"+",37:"*",39:"!",40:"NUMBER",41:"STRING",42:"TRUE",43:"FALSE",44:"(",45:")",46:".",47:"[",48:"]",53:"IF",54:"{",55:"}",57:"ELSE",58:"WHILE",59:"FOR",60:"FUNCTION",63:"RESERVED"},
productions_: [0,[3,2],[3,3],[4,0],[4,3],[4,3],[9,0],[9,3],[7,2],[7,1],[7,1],[10,1],[10,1],[10,1],[10,2],[14,3],[14,3],[15,2],[23,1],[23,3],[24,1],[24,3],[13,2],[13,3],[20,1],[20,3],[28,1],[28,3],[30,1],[30,3],[32,1],[32,3],[34,1],[34,3],[36,1],[36,2],[36,2],[38,1],[38,1],[38,1],[38,1],[38,1],[38,1],[38,3],[17,1],[17,3],[17,4],[16,3],[16,4],[49,1],[49,3],[12,1],[12,1],[12,1],[50,9],[56,0],[56,2],[56,5],[51,8],[52,12],[8,8],[8,9],[61,1],[61,3],[62,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: this.$ = new yy.Program(this._$, $$[$0-1]); return this.$; 
break;
case 2: this.$ = new yy.Program(this._$, $$[$0-1]); return this.$; 
break;
case 3: this.$ = new yy.StatementList(this._$); 
break;
case 4: this.$ = $$[$0-2]; this.$.addStatement($$[$0-1]); 
break;
case 5: this.$ = $$[$0-2]; this.$.addStatement($$[$0-1]); 
break;
case 6: this.$ = new yy.StatementList(this._$); 
break;
case 7: this.$ = $$[$0-2]; this.$.addStatement($$[$0-1]); 
break;
case 8: this.$ = new yy.CommonSimpleStatement(this._$, $$[$0-1]); 
break;
case 14: this.$ = new yy.PostfixStatement(this._$, $$[$0-1], $$[$0]); 
break;
case 15: this.$ = new yy.AssignmentStatement(this._$, $$[$0-2], "=", $$[$0]); 
break;
case 16: this.$ = new yy.AssignmentStatement(this._$, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 17: this.$ = $$[$0]; 
break;
case 18: this.$ = new yy.VarStatement(this._$); this.$.addVarItem($$[$0]); 
break;
case 19: this.$ = $$[$0-2]; this.$.addVarItem($$[$0]); 
break;
case 20: this.$ = new yy.VarItem(this._$, $$[$0], null); 
break;
case 21:
			this.$ = new yy.VarItem(this._$, $$[$0-2], new yy.AssignmentStatement(this._$, new yy.NameIdentifier(_$[$0-2], $$[$0-2]), "=", $$[$0]));
		
break;
case 22: this.$ = new yy.ReturnStatement(this._$, null); 
break;
case 23: this.$ = new yy.ReturnStatement(this._$, $$[$0-1]); 
break;
case 25: this.$ = new yy.BinaryExpression(this._$, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 27: this.$ = new yy.BinaryExpression(this._$, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 29: this.$ = new yy.BinaryExpression(this._$, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 31: this.$ = new yy.BinaryExpression(this._$, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 33: this.$ = new yy.BinaryExpression(this._$, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 35: this.$ = new yy.UnaryExpression(this._$, $$[$0-1], $$[$0]); 
break;
case 36: this.$ = new yy.UnaryExpression(this._$, $$[$0-1], $$[$0]); 
break;
case 38: this.$ = new yy.NumberLiteral(this._$, $$[$0]); 
break;
case 39: this.$ = new yy.StringLiteral(this._$, $$[$0]); 
break;
case 40: this.$ = new yy.BooleanLiteral(this._$, true); 
break;
case 41: this.$ = new yy.BooleanLiteral(this._$, false); 
break;
case 43: this.$ = $$[$0-1]; 
break;
case 44: this.$ = new yy.NameIdentifier(this._$, $$[$0]); 
break;
case 45: this.$ = new yy.ObjectIdentifier(this._$, $$[$0-2], $$[$0]); 
break;
case 46: this.$ = new yy.ArrayIdentifier(this._$, $$[$0-3], $$[$0-1]); 
break;
case 47: this.$ = new yy.FunctionCall(this._$, $$[$0-2], []); 
break;
case 48: this.$ = new yy.FunctionCall(this._$, $$[$0-3], $$[$0-1]); 
break;
case 49: this.$ = [$$[$0]]; 
break;
case 50: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 54: this.$ = new yy.IfBlock(this._$, $$[$0-6], $$[$0-2], $$[$0]); 
break;
case 55: this.$ = null; 
break;
case 56: this.$ = new yy.ElseIfBlock(this._$, $$[$0]); 
break;
case 57: this.$ = new yy.ElseBlock(this._$, $$[$0-1]); 
break;
case 58: this.$ = new yy.WhileBlock(this._$, $$[$0-5], $$[$0-1]); 
break;
case 59: this.$ = new yy.ForBlock(this._$, $$[$0-9], $$[$0-7], $$[$0-5], $$[$0-1]); 
break;
case 60: this.$ = new yy.FunctionDeclaration(this._$, $$[$0-6], [], $$[$0-1]); 
break;
case 61: this.$ = new yy.FunctionDeclaration(this._$, $$[$0-7], $$[$0-5], $$[$0-1]); 
break;
case 62: this.$ = [$$[$0]]; 
break;
case 63: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
}
},
table: [{3:1,4:2,5:[2,3],6:[1,3],22:[2,3],26:[2,3],27:[2,3],53:[2,3],58:[2,3],59:[2,3],60:[2,3]},{1:[3]},{5:[1,4],7:5,8:6,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],58:[1,22],59:[1,23],60:[1,10]},{4:24,5:[2,3],22:[2,3],26:[2,3],27:[2,3],53:[2,3],58:[2,3],59:[2,3],60:[2,3]},{1:[2,1]},{6:[1,25]},{6:[1,26]},{11:[1,27]},{6:[2,9]},{6:[2,10]},{26:[1,28]},{11:[2,11],45:[2,11]},{11:[2,12],45:[2,12]},{11:[2,13],45:[2,13]},{18:[1,29],19:[1,30],21:[1,31],44:[1,32],46:[1,33],47:[1,34]},{6:[2,51]},{6:[2,52]},{6:[2,53]},{11:[1,35],16:50,17:45,20:36,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{23:52,24:53,26:[1,54]},{11:[2,44],18:[2,44],19:[2,44],21:[2,44],25:[2,44],29:[2,44],31:[2,44],33:[2,44],35:[2,44],37:[2,44],44:[2,44],45:[2,44],46:[2,44],47:[2,44],48:[2,44]},{44:[1,55]},{44:[1,56]},{44:[1,57]},{5:[1,58],7:5,8:6,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],58:[1,22],59:[1,23],60:[1,10]},{5:[2,4],22:[2,4],26:[2,4],27:[2,4],53:[2,4],58:[2,4],59:[2,4],60:[2,4]},{5:[2,5],22:[2,5],26:[2,5],27:[2,5],53:[2,5],58:[2,5],59:[2,5],60:[2,5]},{6:[2,8]},{44:[1,59]},{11:[2,14],45:[2,14]},{16:50,17:45,20:60,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,20:61,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,20:64,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51],45:[1,62],49:63},{26:[1,65]},{16:50,17:45,20:66,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{6:[2,22]},{11:[1,67],29:[1,68]},{11:[2,24],25:[2,24],29:[2,24],31:[1,69],45:[2,24],48:[2,24]},{11:[2,26],25:[2,26],29:[2,26],31:[2,26],33:[1,70],45:[2,26],48:[2,26]},{11:[2,28],25:[2,28],29:[2,28],31:[2,28],33:[2,28],35:[1,71],45:[2,28],48:[2,28]},{11:[2,30],25:[2,30],29:[2,30],31:[2,30],33:[2,30],35:[2,30],37:[1,72],45:[2,30],48:[2,30]},{11:[2,32],25:[2,32],29:[2,32],31:[2,32],33:[2,32],35:[2,32],37:[2,32],45:[2,32],48:[2,32]},{11:[2,34],25:[2,34],29:[2,34],31:[2,34],33:[2,34],35:[2,34],37:[2,34],45:[2,34],48:[2,34]},{16:50,17:45,26:[1,20],35:[1,43],36:73,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,26:[1,20],35:[1,43],36:74,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{11:[2,37],25:[2,37],29:[2,37],31:[2,37],33:[2,37],35:[2,37],37:[2,37],44:[1,32],45:[2,37],46:[1,33],47:[1,34],48:[2,37]},{11:[2,38],25:[2,38],29:[2,38],31:[2,38],33:[2,38],35:[2,38],37:[2,38],45:[2,38],48:[2,38]},{11:[2,39],25:[2,39],29:[2,39],31:[2,39],33:[2,39],35:[2,39],37:[2,39],45:[2,39],48:[2,39]},{11:[2,40],25:[2,40],29:[2,40],31:[2,40],33:[2,40],35:[2,40],37:[2,40],45:[2,40],48:[2,40]},{11:[2,41],25:[2,41],29:[2,41],31:[2,41],33:[2,41],35:[2,41],37:[2,41],45:[2,41],48:[2,41]},{11:[2,42],25:[2,42],29:[2,42],31:[2,42],33:[2,42],35:[2,42],37:[2,42],45:[2,42],48:[2,42]},{16:50,17:45,20:75,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{11:[2,17],25:[1,76],45:[2,17]},{11:[2,18],25:[2,18],45:[2,18]},{11:[2,20],19:[1,77],25:[2,20],45:[2,20]},{16:50,17:45,20:78,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,20:79,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{10:80,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20]},{1:[2,2]},{26:[1,83],45:[1,81],61:82},{11:[2,15],29:[1,68],45:[2,15]},{11:[2,16],29:[1,68],45:[2,16]},{11:[2,47],25:[2,47],29:[2,47],31:[2,47],33:[2,47],35:[2,47],37:[2,47],45:[2,47],48:[2,47]},{25:[1,85],45:[1,84]},{25:[2,49],29:[1,68],45:[2,49]},{11:[2,45],18:[2,45],19:[2,45],21:[2,45],25:[2,45],29:[2,45],31:[2,45],33:[2,45],35:[2,45],37:[2,45],44:[2,45],45:[2,45],46:[2,45],47:[2,45],48:[2,45]},{29:[1,68],48:[1,86]},{6:[2,23]},{16:50,17:45,26:[1,20],28:87,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,26:[1,20],30:88,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,26:[1,20],32:89,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,26:[1,20],34:90,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{16:50,17:45,26:[1,20],35:[1,43],36:91,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{11:[2,35],25:[2,35],29:[2,35],31:[2,35],33:[2,35],35:[2,35],37:[2,35],45:[2,35],48:[2,35]},{11:[2,36],25:[2,36],29:[2,36],31:[2,36],33:[2,36],35:[2,36],37:[2,36],45:[2,36],48:[2,36]},{29:[1,68],45:[1,92]},{24:93,26:[1,54]},{16:50,17:45,20:94,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{29:[1,68],45:[1,95]},{29:[1,68],45:[1,96]},{11:[1,97]},{54:[1,98]},{25:[1,100],45:[1,99]},{25:[2,62],45:[2,62]},{11:[2,48],25:[2,48],29:[2,48],31:[2,48],33:[2,48],35:[2,48],37:[2,48],45:[2,48],48:[2,48]},{16:50,17:45,20:101,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{11:[2,46],18:[2,46],19:[2,46],21:[2,46],25:[2,46],29:[2,46],31:[2,46],33:[2,46],35:[2,46],37:[2,46],44:[2,46],45:[2,46],46:[2,46],47:[2,46],48:[2,46]},{11:[2,25],25:[2,25],29:[2,25],31:[1,69],45:[2,25],48:[2,25]},{11:[2,27],25:[2,27],29:[2,27],31:[2,27],33:[1,70],45:[2,27],48:[2,27]},{11:[2,29],25:[2,29],29:[2,29],31:[2,29],33:[2,29],35:[1,71],45:[2,29],48:[2,29]},{11:[2,31],25:[2,31],29:[2,31],31:[2,31],33:[2,31],35:[2,31],37:[1,72],45:[2,31],48:[2,31]},{11:[2,33],25:[2,33],29:[2,33],31:[2,33],33:[2,33],35:[2,33],37:[2,33],45:[2,33],48:[2,33]},{11:[2,43],25:[2,43],29:[2,43],31:[2,43],33:[2,43],35:[2,43],37:[2,43],45:[2,43],48:[2,43]},{11:[2,19],25:[2,19],45:[2,19]},{11:[2,21],25:[2,21],29:[1,68],45:[2,21]},{54:[1,102]},{54:[1,103]},{16:50,17:45,20:104,26:[1,20],28:37,30:38,32:39,34:40,35:[1,43],36:41,38:42,39:[1,44],40:[1,46],41:[1,47],42:[1,48],43:[1,49],44:[1,51]},{6:[1,105]},{54:[1,106]},{26:[1,107]},{25:[2,50],29:[1,68],45:[2,50]},{6:[1,108]},{6:[1,109]},{11:[1,110],29:[1,68]},{9:111,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{6:[1,112]},{25:[2,63],45:[2,63]},{9:113,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{9:114,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{10:115,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20]},{7:117,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,116],58:[1,22],59:[1,23]},{9:118,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{7:117,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,119],58:[1,22],59:[1,23]},{7:117,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,120],58:[1,22],59:[1,23]},{45:[1,121]},{6:[2,60]},{6:[1,122]},{7:117,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,123],58:[1,22],59:[1,23]},{6:[2,55],56:124,57:[1,125]},{6:[2,58]},{54:[1,126]},{22:[2,7],26:[2,7],27:[2,7],53:[2,7],55:[2,7],58:[2,7],59:[2,7]},{6:[2,61]},{6:[2,54]},{50:127,53:[1,21],54:[1,128]},{6:[1,129]},{6:[2,56]},{6:[1,130]},{9:131,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{9:132,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{7:117,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,133],58:[1,22],59:[1,23]},{7:117,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,134],58:[1,22],59:[1,23]},{6:[2,59]},{6:[2,57]}],
defaultActions: {4:[2,1],8:[2,9],9:[2,10],15:[2,51],16:[2,52],17:[2,53],27:[2,8],35:[2,22],58:[2,2],67:[2,23],116:[2,60],120:[2,58],123:[2,61],124:[2,54],127:[2,56],133:[2,59],134:[2,57]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/\n.*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
            this.yytext += match[0];
            this.match += match[0];
            this.yyleng = this.yytext.length;
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip comment */
break;
case 1:/* skip whitespace */
break;
case 2:return "++";
break;
case 3:return "+=";
break;
case 4:return "==";
break;
case 5:return "&&";
break;
case 6:return "||";
break;
case 7:return "=";
break;
case 8:return "+";
break;
case 9:return "*";
break;
case 10:return ";";
break;
case 11:return "!";
break;
case 12:return "(";
break;
case 13:return ")";
break;
case 14:return "{";
break;
case 15:return "}";
break;
case 16:return "[";
break;
case 17:return "]";
break;
case 18:return ".";
break;
case 19:return ",";
break;
case 20:return "RESERVED";
break;
case 21:return "TRUE";
break;
case 22:return "FALSE";
break;
case 23:return "IF";
break;
case 24:return "ELSE";
break;
case 25:return "WHILE";
break;
case 26:return "FOR";
break;
case 27:return "VAR";
break;
case 28:return "FUNCTION";
break;
case 29:return "RETURN";
break;
case 30:return "NAME";
break;
case 31:return "NEWLINE";
break;
case 32:return "NUMBER";
break;
case 33:return "STRING";
break;
case 34:return "EOF";
break;
}
};
lexer.rules = [/^((?:[/][/].*[\n])|(?:[/][*]([^*]*[*][^/])*[^*]*[*][/]))((?:(?:[\n](?:[ \f\r\t\v\u00A0\u2028\u2029]+)?)+)?)/,/^(?:[ \f\r\t\v\u00A0\u2028\u2029]+)/,/^(\+\+|--)/,/^(\+=|-=|\*=|\/=|%=)/,/^(==|!=|>=|<=|>|<)/,/^&&/,/^\|\|/,/^=/,/^(\+|-)/,/^(\*|\/|%)/,/^;/,/^!/,/^\(/,/^\)/,/^\{/,/^\}/,/^\[/,/^\]/,/^\./,/^,/,/^((?:null|break|case|catch|default|finally|instanceof|new|continue|void|delete|this|do|in|switch|throw|try|typeof|with|abstract|boolean|byte|char|class|const|debugger|double|enum|export|extends|final|float|goto|implements|import|int|interface|long|native|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile)|{reservedjsmm})/,/^true\b/,/^false\b/,/^if\b/,/^(?:(?:[\n](?:[ \f\r\t\v\u00A0\u2028\u2029]+)?)+)?else\b/,/^while\b/,/^for\b/,/^var\b/,/^function\b/,/^return\b/,/^[a-zA-Z_](?:[a-zA-Z_]|[0-9])*/,/^(?:(?:[\n](?:[ \f\r\t\v\u00A0\u2028\u2029]+)?)+)/,/^(?:(?:(?:[1-9][0-9]*)|0)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/,/^(?:["]([^\"](?:[\\][\\])?(?:[\\]["])?)*["])/,/^$/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = jsmmparser;
exports.parse = function () { return jsmmparser.parse.apply(jsmmparser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
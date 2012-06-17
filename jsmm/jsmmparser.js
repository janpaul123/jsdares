/* Jison generated parser */
var jsmmparser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"programStatementList":4,"EOF":5,"NEWLINE":6,"commonStatement":7,"functionDeclaration":8,"statementList":9,"simpleStatement":10,";":11,"blockStatement":12,"returnStatement":13,"assignmentStatement":14,"varStatement":15,"callExpression":16,"identExpression":17,"+":18,"=":19,"expression":20,"+=":21,"VAR":22,"varList":23,"varListItem":24,",":25,"NAME":26,"RETURN":27,"andExpression":28,"||":29,"relationalExpression":30,"&&":31,"addExpression":32,"==":33,"multExpression":34,"unaryExpression":35,"*":36,"primaryExpression":37,"!":38,"literal":39,"(":40,")":41,"NUMBER":42,"STRING":43,"TRUE":44,"FALSE":45,".":46,"[":47,"]":48,"callArguments":49,"ifBlock":50,"whileBlock":51,"forBlock":52,"IF":53,"{":54,"}":55,"elseBlock":56,"ELSE":57,"WHILE":58,"FOR":59,"FUNCTION":60,"functionArguments":61,"reserved":62,"RESERVED":63,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"NEWLINE",11:";",18:"+",19:"=",21:"+=",22:"VAR",25:",",26:"NAME",27:"RETURN",29:"||",31:"&&",33:"==",36:"*",38:"!",40:"(",41:")",42:"NUMBER",43:"STRING",44:"TRUE",45:"FALSE",46:".",47:"[",48:"]",53:"IF",54:"{",55:"}",57:"ELSE",58:"WHILE",59:"FOR",60:"FUNCTION",63:"RESERVED"},
productions_: [0,[3,2],[3,3],[4,0],[4,3],[4,3],[9,0],[9,3],[7,2],[7,1],[7,1],[10,1],[10,1],[10,1],[10,3],[14,3],[14,3],[15,2],[23,1],[23,3],[24,1],[24,3],[13,2],[13,3],[20,1],[20,3],[28,1],[28,3],[30,1],[30,3],[32,1],[32,3],[34,1],[34,3],[35,1],[35,2],[35,2],[37,1],[37,1],[37,1],[37,3],[39,1],[39,1],[39,1],[39,1],[17,1],[17,3],[17,4],[16,3],[16,4],[49,1],[49,3],[12,1],[12,1],[12,1],[50,9],[56,0],[56,2],[56,5],[51,8],[52,12],[8,8],[8,9],[61,1],[61,3],[62,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: this.$ = new yy.nodes.Program(this._$, null, $$[$0-1]); return this.$; 
break;
case 2: this.$ = new yy.nodes.Program(this._$, null, $$[$0-1]); return this.$; 
break;
case 3: this.$ = new yy.nodes.StatementList(this._$, null); 
break;
case 4: this.$ = $$[$0-2]; this.$.addStatement($$[$0-1]); 
break;
case 5: this.$ = $$[$0-2]; this.$.addStatement($$[$0-1]); 
break;
case 6: this.$ = new yy.nodes.StatementList(this._$, null); 
break;
case 7: this.$ = $$[$0-2]; this.$.addStatement($$[$0-1]); 
break;
case 8: this.$ = new yy.nodes.CommonSimpleStatement(this._$, undefined, $$[$0-1]); 
break;
case 14: this.$ = new yy.nodes.PostfixStatement(this._$, undefined, $$[$0-2], $$[$0-1]+$$[$0-1]); 
break;
case 15: this.$ = new yy.nodes.AssignmentStatement(this._$, undefined, $$[$0-2], "=", $$[$0]); 
break;
case 16: this.$ = new yy.nodes.AssignmentStatement(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 17: this.$ = $$[$0]; 
break;
case 18: this.$ = new yy.nodes.VarStatement(this._$, undefined); this.$.addVarItem($$[$0]); 
break;
case 19: this.$ = $$[$0-2]; this.$.addVarItem($$[$0]); 
break;
case 20: this.$ = new yy.nodes.VarItem(this._$, undefined, $$[$0], null); 
break;
case 21:
			this.$ = new yy.nodes.VarItem(this._$, undefined, $$[$0-2], new yy.nodes.AssignmentStatement(this._$, undefined, new yy.nodes.NameIdentifier(_$[$0-2], undefined, $$[$0-2]), "=", $$[$0]));
		
break;
case 22: this.$ = new yy.nodes.ReturnStatement(this._$, undefined, null); 
break;
case 23: this.$ = new yy.nodes.ReturnStatement(this._$, undefined, $$[$0-1]); 
break;
case 25: this.$ = new yy.nodes.BinaryExpression(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 27: this.$ = new yy.nodes.BinaryExpression(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 29: this.$ = new yy.nodes.BinaryExpression(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 31: this.$ = new yy.nodes.BinaryExpression(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 33: this.$ = new yy.nodes.BinaryExpression(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
break;
case 35: this.$ = new yy.nodes.UnaryExpression(this._$, undefined, $$[$0-1], $$[$0]); 
break;
case 36: this.$ = new yy.nodes.UnaryExpression(this._$, undefined, $$[$0-1], $$[$0]); 
break;
case 40: this.$ = new yy.nodes.ParenExpression(this._$, undefined, $$[$0-1]); 
break;
case 41: this.$ = new yy.nodes.NumberLiteral(this._$, undefined, $$[$0]); 
break;
case 42: this.$ = new yy.nodes.StringLiteral(this._$, undefined, $$[$0]); 
break;
case 43: this.$ = new yy.nodes.BooleanLiteral(this._$, undefined, true); 
break;
case 44: this.$ = new yy.nodes.BooleanLiteral(this._$, undefined, false); 
break;
case 45: this.$ = new yy.nodes.NameIdentifier(this._$, undefined, $$[$0]); 
break;
case 46: this.$ = new yy.nodes.ObjectIdentifier(this._$, undefined, $$[$0-2], $$[$0]); 
break;
case 47: this.$ = new yy.nodes.ArrayIdentifier(this._$, undefined, $$[$0-3], $$[$0-1]); 
break;
case 48: this.$ = new yy.nodes.FunctionCall(this._$, undefined, $$[$0-2], []); 
break;
case 49: this.$ = new yy.nodes.FunctionCall(this._$, undefined, $$[$0-3], $$[$0-1]); 
break;
case 50: this.$ = [$$[$0]]; 
break;
case 51: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 55: this.$ = new yy.nodes.IfBlock(this._$, _$[$0-5].last_column, $$[$0-6], $$[$0-2], $$[$0]); 
break;
case 56: this.$ = null; 
break;
case 57: this.$ = new yy.nodes.ElseIfBlock(this._$, _$[$0-1].last_column, $$[$0]); 
break;
case 58: this.$ = new yy.nodes.ElseBlock(this._$, _$[$0-4].last_column, $$[$0-1]); 
break;
case 59: this.$ = new yy.nodes.WhileBlock(this._$, _$[$0-4].last_column, $$[$0-5], $$[$0-1]); 
break;
case 60: this.$ = new yy.nodes.ForBlock(this._$, _$[$0-4].last_column, $$[$0-9], $$[$0-7], $$[$0-5], $$[$0-1]); 
break;
case 61: this.$ = new yy.nodes.FunctionDeclaration(this._$, _$[$0-4].last_column, $$[$0-6], [], $$[$0-1]); 
break;
case 62: this.$ = new yy.nodes.FunctionDeclaration(this._$, _$[$0-4].last_column, $$[$0-7], $$[$0-5], $$[$0-1]); 
break;
case 63: this.$ = [$$[$0]]; 
break;
case 64: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
}
},
table: [{3:1,4:2,5:[2,3],6:[1,3],22:[2,3],26:[2,3],27:[2,3],53:[2,3],58:[2,3],59:[2,3],60:[2,3]},{1:[3]},{5:[1,4],7:5,8:6,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],58:[1,22],59:[1,23],60:[1,10]},{4:24,5:[2,3],22:[2,3],26:[2,3],27:[2,3],53:[2,3],58:[2,3],59:[2,3],60:[2,3]},{1:[2,1]},{6:[1,25]},{6:[1,26]},{11:[1,27]},{6:[2,9]},{6:[2,10]},{26:[1,28]},{11:[2,11],41:[2,11]},{11:[2,12],41:[2,12]},{11:[2,13],41:[2,13]},{18:[1,29],19:[1,30],21:[1,31],40:[1,32],46:[1,33],47:[1,34]},{6:[2,52]},{6:[2,53]},{6:[2,54]},{11:[1,35],16:47,17:45,18:[1,43],20:36,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{23:53,24:54,26:[1,55]},{11:[2,45],18:[2,45],19:[2,45],21:[2,45],25:[2,45],29:[2,45],31:[2,45],33:[2,45],36:[2,45],40:[2,45],41:[2,45],46:[2,45],47:[2,45],48:[2,45]},{40:[1,56]},{40:[1,57]},{40:[1,58]},{5:[1,59],7:5,8:6,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],58:[1,22],59:[1,23],60:[1,10]},{5:[2,4],22:[2,4],26:[2,4],27:[2,4],53:[2,4],58:[2,4],59:[2,4],60:[2,4]},{5:[2,5],22:[2,5],26:[2,5],27:[2,5],53:[2,5],58:[2,5],59:[2,5],60:[2,5]},{6:[2,8]},{40:[1,60]},{18:[1,61]},{16:47,17:45,18:[1,43],20:62,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],20:63,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],20:66,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],41:[1,64],42:[1,49],43:[1,50],44:[1,51],45:[1,52],49:65},{26:[1,67]},{16:47,17:45,18:[1,43],20:68,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{6:[2,22]},{11:[1,69],29:[1,70]},{11:[2,24],25:[2,24],29:[2,24],31:[1,71],41:[2,24],48:[2,24]},{11:[2,26],25:[2,26],29:[2,26],31:[2,26],33:[1,72],41:[2,26],48:[2,26]},{11:[2,28],18:[1,73],25:[2,28],29:[2,28],31:[2,28],33:[2,28],41:[2,28],48:[2,28]},{11:[2,30],18:[2,30],25:[2,30],29:[2,30],31:[2,30],33:[2,30],36:[1,74],41:[2,30],48:[2,30]},{11:[2,32],18:[2,32],25:[2,32],29:[2,32],31:[2,32],33:[2,32],36:[2,32],41:[2,32],48:[2,32]},{11:[2,34],18:[2,34],25:[2,34],29:[2,34],31:[2,34],33:[2,34],36:[2,34],41:[2,34],48:[2,34]},{16:47,17:45,18:[1,43],26:[1,20],35:75,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],26:[1,20],35:76,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{11:[2,37],18:[2,37],25:[2,37],29:[2,37],31:[2,37],33:[2,37],36:[2,37],40:[1,32],41:[2,37],46:[1,33],47:[1,34],48:[2,37]},{11:[2,38],18:[2,38],25:[2,38],29:[2,38],31:[2,38],33:[2,38],36:[2,38],41:[2,38],48:[2,38]},{11:[2,39],18:[2,39],25:[2,39],29:[2,39],31:[2,39],33:[2,39],36:[2,39],41:[2,39],48:[2,39]},{16:47,17:45,18:[1,43],20:77,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{11:[2,41],18:[2,41],25:[2,41],29:[2,41],31:[2,41],33:[2,41],36:[2,41],41:[2,41],48:[2,41]},{11:[2,42],18:[2,42],25:[2,42],29:[2,42],31:[2,42],33:[2,42],36:[2,42],41:[2,42],48:[2,42]},{11:[2,43],18:[2,43],25:[2,43],29:[2,43],31:[2,43],33:[2,43],36:[2,43],41:[2,43],48:[2,43]},{11:[2,44],18:[2,44],25:[2,44],29:[2,44],31:[2,44],33:[2,44],36:[2,44],41:[2,44],48:[2,44]},{11:[2,17],25:[1,78],41:[2,17]},{11:[2,18],25:[2,18],41:[2,18]},{11:[2,20],19:[1,79],25:[2,20],41:[2,20]},{16:47,17:45,18:[1,43],20:80,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],20:81,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{10:82,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20]},{1:[2,2]},{26:[1,85],41:[1,83],61:84},{11:[2,14],41:[2,14]},{11:[2,15],29:[1,70],41:[2,15]},{11:[2,16],29:[1,70],41:[2,16]},{11:[2,48],18:[2,48],25:[2,48],29:[2,48],31:[2,48],33:[2,48],36:[2,48],41:[2,48],48:[2,48]},{25:[1,87],41:[1,86]},{25:[2,50],29:[1,70],41:[2,50]},{11:[2,46],18:[2,46],19:[2,46],21:[2,46],25:[2,46],29:[2,46],31:[2,46],33:[2,46],36:[2,46],40:[2,46],41:[2,46],46:[2,46],47:[2,46],48:[2,46]},{29:[1,70],48:[1,88]},{6:[2,23]},{16:47,17:45,18:[1,43],26:[1,20],28:89,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],26:[1,20],30:90,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],26:[1,20],32:91,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],26:[1,20],34:92,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{16:47,17:45,18:[1,43],26:[1,20],35:93,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{11:[2,35],18:[2,35],25:[2,35],29:[2,35],31:[2,35],33:[2,35],36:[2,35],41:[2,35],48:[2,35]},{11:[2,36],18:[2,36],25:[2,36],29:[2,36],31:[2,36],33:[2,36],36:[2,36],41:[2,36],48:[2,36]},{29:[1,70],41:[1,94]},{24:95,26:[1,55]},{16:47,17:45,18:[1,43],20:96,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{29:[1,70],41:[1,97]},{29:[1,70],41:[1,98]},{11:[1,99]},{54:[1,100]},{25:[1,102],41:[1,101]},{25:[2,63],41:[2,63]},{11:[2,49],18:[2,49],25:[2,49],29:[2,49],31:[2,49],33:[2,49],36:[2,49],41:[2,49],48:[2,49]},{16:47,17:45,18:[1,43],20:103,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{11:[2,47],18:[2,47],19:[2,47],21:[2,47],25:[2,47],29:[2,47],31:[2,47],33:[2,47],36:[2,47],40:[2,47],41:[2,47],46:[2,47],47:[2,47],48:[2,47]},{11:[2,25],25:[2,25],29:[2,25],31:[1,71],41:[2,25],48:[2,25]},{11:[2,27],25:[2,27],29:[2,27],31:[2,27],33:[1,72],41:[2,27],48:[2,27]},{11:[2,29],18:[1,73],25:[2,29],29:[2,29],31:[2,29],33:[2,29],41:[2,29],48:[2,29]},{11:[2,31],18:[2,31],25:[2,31],29:[2,31],31:[2,31],33:[2,31],36:[1,74],41:[2,31],48:[2,31]},{11:[2,33],18:[2,33],25:[2,33],29:[2,33],31:[2,33],33:[2,33],36:[2,33],41:[2,33],48:[2,33]},{11:[2,40],18:[2,40],25:[2,40],29:[2,40],31:[2,40],33:[2,40],36:[2,40],41:[2,40],48:[2,40]},{11:[2,19],25:[2,19],41:[2,19]},{11:[2,21],25:[2,21],29:[1,70],41:[2,21]},{54:[1,104]},{54:[1,105]},{16:47,17:45,18:[1,43],20:106,26:[1,20],28:37,30:38,32:39,34:40,35:41,37:42,38:[1,44],39:46,40:[1,48],42:[1,49],43:[1,50],44:[1,51],45:[1,52]},{6:[1,107]},{54:[1,108]},{26:[1,109]},{25:[2,51],29:[1,70],41:[2,51]},{6:[1,110]},{6:[1,111]},{11:[1,112],29:[1,70]},{9:113,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{6:[1,114]},{25:[2,64],41:[2,64]},{9:115,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{9:116,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{10:117,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20]},{7:119,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,118],58:[1,22],59:[1,23]},{9:120,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{7:119,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,121],58:[1,22],59:[1,23]},{7:119,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,122],58:[1,22],59:[1,23]},{41:[1,123]},{6:[2,61]},{6:[1,124]},{7:119,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,125],58:[1,22],59:[1,23]},{6:[2,56],56:126,57:[1,127]},{6:[2,59]},{54:[1,128]},{22:[2,7],26:[2,7],27:[2,7],53:[2,7],55:[2,7],58:[2,7],59:[2,7]},{6:[2,62]},{6:[2,55]},{50:129,53:[1,21],54:[1,130]},{6:[1,131]},{6:[2,57]},{6:[1,132]},{9:133,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{9:134,22:[2,6],26:[2,6],27:[2,6],53:[2,6],55:[2,6],58:[2,6],59:[2,6]},{7:119,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,135],58:[1,22],59:[1,23]},{7:119,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,20],27:[1,18],50:15,51:16,52:17,53:[1,21],55:[1,136],58:[1,22],59:[1,23]},{6:[2,60]},{6:[2,58]}],
defaultActions: {4:[2,1],8:[2,9],9:[2,10],15:[2,52],16:[2,53],17:[2,54],27:[2,8],35:[2,22],59:[2,2],69:[2,23],118:[2,61],122:[2,59],125:[2,62],126:[2,55],129:[2,57],135:[2,60],136:[2,58]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
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
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
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
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
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
case 0:/* skip and comments */
break;
case 1:return "RESERVED";
break;
case 2:return "TRUE";
break;
case 3:return "FALSE";
break;
case 4:return "IF";
break;
case 5:return "ELSE";
break;
case 6:return "WHILE";
break;
case 7:return "FOR";
break;
case 8:return "VAR";
break;
case 9:return "FUNCTION";
break;
case 10:return "RETURN";
break;
case 11:return "NAME";
break;
case 12:return "NEWLINE";
break;
case 13:return "NUMBER";
break;
case 14:return "STRING";
break;
case 15:return "EOF";
break;
case 16:return "+=";
break;
case 17:return "==";
break;
case 18:return "&&";
break;
case 19:return "||";
break;
case 20:return "=";
break;
case 21:return "+";
break;
case 22:return "*";
break;
case 23:return ";";
break;
case 24:return "!";
break;
case 25:return "(";
break;
case 26:return ")";
break;
case 27:return "{";
break;
case 28:return "}";
break;
case 29:return "[";
break;
case 30:return "]";
break;
case 31:return ".";
break;
case 32:return ",";
break;
}
};
lexer.rules = [/^(?:(?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))))/,/^(?:((?:null|break|case|catch|default|finally|instanceof|new|continue|void|delete|this|do|in|switch|throw|try|typeof|with|abstract|boolean|byte|char|class|const|debugger|double|enum|export|extends|final|float|goto|implements|import|int|interface|long|native|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile|arguments|NaN|Array|Object|RegExp|toString|(?:jsmm([0-9a-zA-Z_])*)))(?!([0-9a-zA-Z_])))/,/^(?:true\b)/,/^(?:false\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:var\b)/,/^(?:function\b)/,/^(?:return\b)/,/^(?:([a-zA-Z_])([0-9a-zA-Z_])*)/,/^(?:((?:((?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))|((?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/]))))*(?:[\n]((?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))|((?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/]))))*)+)))/,/^(?:((?:(?:(?:[1-9]([0-9])*)|0)((?:\.([0-9])+))?((?:[eE][+-]?([0-9])+))?)))/,/^(?:((?:["][^\\"\n]*(?:[\\][nt"\\][^\\"]*)*["])))/,/^(?:$)/,/^(?:(\+=|-=|\*=|\/=|%=))/,/^(?:(==|!=|>=|<=|>|<))/,/^(?:&&)/,/^(?:\|\|)/,/^(?:=)/,/^(?:(\+|-))/,/^(?:(\*|\/|%))/,/^(?:;)/,/^(?:!)/,/^(?:\()/,/^(?:\))/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:,)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = jsmmparser;
exports.Parser = jsmmparser.Parser;
exports.parse = function () { return jsmmparser.parse.apply(jsmmparser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    var source, cwd;
    if (typeof process !== 'undefined') {
        source = require('fs').readFileSync(require('path').resolve(args[1]), "utf8");
    } else {
        source = require("file").path(require("file").cwd()).join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
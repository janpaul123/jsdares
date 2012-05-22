/* Jison generated parser */
var jsmmparser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"programStatementList":4,"EOF":5,"NEWLINE":6,"commonStatement":7,"functionDeclaration":8,"statementList":9,"simpleStatement":10,";":11,"blockStatement":12,"returnStatement":13,"assignmentStatement":14,"varStatement":15,"callStatement":16,"identExpression":17,"+":18,"=":19,"expression":20,"+=":21,"VAR":22,"varList":23,"varListItem":24,",":25,"NAME":26,"RETURN":27,"andExpression":28,"||":29,"relationalExpression":30,"&&":31,"addExpression":32,"==":33,"multExpression":34,"unaryExpression":35,"*":36,"primaryExpression":37,"!":38,"literal":39,"callExpression":40,"(":41,")":42,"NUMBER":43,"STRING":44,"TRUE":45,"FALSE":46,".":47,"[":48,"]":49,"callArguments":50,"ifBlock":51,"whileBlock":52,"forBlock":53,"IF":54,"{":55,"}":56,"elseBlock":57,"ELSE":58,"WHILE":59,"FOR":60,"FUNCTION":61,"functionArguments":62,"reserved":63,"RESERVED":64,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"NEWLINE",11:";",18:"+",19:"=",21:"+=",22:"VAR",25:",",26:"NAME",27:"RETURN",29:"||",31:"&&",33:"==",36:"*",38:"!",41:"(",42:")",43:"NUMBER",44:"STRING",45:"TRUE",46:"FALSE",47:".",48:"[",49:"]",54:"IF",55:"{",56:"}",58:"ELSE",59:"WHILE",60:"FOR",61:"FUNCTION",64:"RESERVED"},
productions_: [0,[3,2],[3,3],[4,0],[4,3],[4,3],[9,0],[9,3],[7,2],[7,1],[7,1],[10,1],[10,1],[10,1],[10,3],[14,3],[14,3],[15,2],[23,1],[23,3],[24,1],[24,3],[13,2],[13,3],[20,1],[20,3],[28,1],[28,3],[30,1],[30,3],[32,1],[32,3],[34,1],[34,3],[35,1],[35,2],[35,2],[37,1],[37,1],[37,1],[37,3],[39,1],[39,1],[39,1],[39,1],[17,1],[17,3],[17,4],[40,3],[40,4],[50,1],[50,3],[16,1],[12,1],[12,1],[12,1],[51,9],[57,0],[57,2],[57,5],[52,8],[53,12],[8,8],[8,9],[62,1],[62,3],[63,1]],
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
case 25: console.log(this.$); this.$ = new yy.nodes.BinaryExpression(this._$, undefined, $$[$0-2], $$[$0-1], $$[$0]); 
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
case 52: this.$ = new yy.nodes.CallStatement(this._$, undefined, $$[$0]); 
break;
case 56: this.$ = new yy.nodes.IfBlock(this._$, _$[$0-5].last_column, $$[$0-6], $$[$0-2], $$[$0]); 
break;
case 57: this.$ = null; 
break;
case 58: this.$ = new yy.nodes.ElseIfBlock(this._$, _$[$0-1].last_column, $$[$0]); 
break;
case 59: this.$ = new yy.nodes.ElseBlock(this._$, _$[$0-4].last_column, $$[$0-1]); 
break;
case 60: this.$ = new yy.nodes.WhileBlock(this._$, _$[$0-4].last_column, $$[$0-5], $$[$0-1]); 
break;
case 61: this.$ = new yy.nodes.ForBlock(this._$, _$[$0-4].last_column, $$[$0-9], $$[$0-7], $$[$0-5], $$[$0-1]); 
break;
case 62: this.$ = new yy.nodes.FunctionDeclaration(this._$, _$[$0-4].last_column, $$[$0-6], [], $$[$0-1]); 
break;
case 63: this.$ = new yy.nodes.FunctionDeclaration(this._$, _$[$0-4].last_column, $$[$0-7], $$[$0-5], $$[$0-1]); 
break;
case 64: this.$ = [$$[$0]]; 
break;
case 65: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
}
},
table: [{3:1,4:2,5:[2,3],6:[1,3],22:[2,3],26:[2,3],27:[2,3],54:[2,3],59:[2,3],60:[2,3],61:[2,3]},{1:[3]},{5:[1,4],7:5,8:6,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],59:[1,23],60:[1,24],61:[1,10]},{4:25,5:[2,3],22:[2,3],26:[2,3],27:[2,3],54:[2,3],59:[2,3],60:[2,3],61:[2,3]},{1:[2,1]},{6:[1,26]},{6:[1,27]},{11:[1,28]},{6:[2,9]},{6:[2,10]},{26:[1,29]},{11:[2,11],42:[2,11]},{11:[2,12],42:[2,12]},{11:[2,13],42:[2,13]},{18:[1,30],19:[1,31],21:[1,32],41:[1,35],47:[1,33],48:[1,34]},{6:[2,53]},{6:[2,54]},{6:[2,55]},{11:[1,36],17:46,18:[1,44],20:37,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{23:54,24:55,26:[1,56]},{11:[2,52],42:[2,52]},{11:[2,45],18:[2,45],19:[2,45],21:[2,45],25:[2,45],29:[2,45],31:[2,45],33:[2,45],36:[2,45],41:[2,45],42:[2,45],47:[2,45],48:[2,45],49:[2,45]},{41:[1,57]},{41:[1,58]},{41:[1,59]},{5:[1,60],7:5,8:6,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],59:[1,23],60:[1,24],61:[1,10]},{5:[2,4],22:[2,4],26:[2,4],27:[2,4],54:[2,4],59:[2,4],60:[2,4],61:[2,4]},{5:[2,5],22:[2,5],26:[2,5],27:[2,5],54:[2,5],59:[2,5],60:[2,5],61:[2,5]},{6:[2,8]},{41:[1,61]},{18:[1,62]},{17:46,18:[1,44],20:63,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],20:64,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{26:[1,65]},{17:46,18:[1,44],20:66,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],20:69,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],42:[1,67],43:[1,50],44:[1,51],45:[1,52],46:[1,53],50:68},{6:[2,22]},{11:[1,70],29:[1,71]},{11:[2,24],25:[2,24],29:[2,24],31:[1,72],42:[2,24],49:[2,24]},{11:[2,26],25:[2,26],29:[2,26],31:[2,26],33:[1,73],42:[2,26],49:[2,26]},{11:[2,28],18:[1,74],25:[2,28],29:[2,28],31:[2,28],33:[2,28],42:[2,28],49:[2,28]},{11:[2,30],18:[2,30],25:[2,30],29:[2,30],31:[2,30],33:[2,30],36:[1,75],42:[2,30],49:[2,30]},{11:[2,32],18:[2,32],25:[2,32],29:[2,32],31:[2,32],33:[2,32],36:[2,32],42:[2,32],49:[2,32]},{11:[2,34],18:[2,34],25:[2,34],29:[2,34],31:[2,34],33:[2,34],36:[2,34],42:[2,34],49:[2,34]},{17:46,18:[1,44],26:[1,21],35:76,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],26:[1,21],35:77,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{11:[2,37],18:[2,37],25:[2,37],29:[2,37],31:[2,37],33:[2,37],36:[2,37],41:[1,35],42:[2,37],47:[1,33],48:[1,34],49:[2,37]},{11:[2,38],18:[2,38],25:[2,38],29:[2,38],31:[2,38],33:[2,38],36:[2,38],42:[2,38],49:[2,38]},{11:[2,39],18:[2,39],25:[2,39],29:[2,39],31:[2,39],33:[2,39],36:[2,39],42:[2,39],49:[2,39]},{17:46,18:[1,44],20:78,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{11:[2,41],18:[2,41],25:[2,41],29:[2,41],31:[2,41],33:[2,41],36:[2,41],42:[2,41],49:[2,41]},{11:[2,42],18:[2,42],25:[2,42],29:[2,42],31:[2,42],33:[2,42],36:[2,42],42:[2,42],49:[2,42]},{11:[2,43],18:[2,43],25:[2,43],29:[2,43],31:[2,43],33:[2,43],36:[2,43],42:[2,43],49:[2,43]},{11:[2,44],18:[2,44],25:[2,44],29:[2,44],31:[2,44],33:[2,44],36:[2,44],42:[2,44],49:[2,44]},{11:[2,17],25:[1,79],42:[2,17]},{11:[2,18],25:[2,18],42:[2,18]},{11:[2,20],19:[1,80],25:[2,20],42:[2,20]},{17:46,18:[1,44],20:81,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],20:82,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{10:83,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],40:20},{1:[2,2]},{26:[1,86],42:[1,84],62:85},{11:[2,14],42:[2,14]},{11:[2,15],29:[1,71],42:[2,15]},{11:[2,16],29:[1,71],42:[2,16]},{11:[2,46],18:[2,46],19:[2,46],21:[2,46],25:[2,46],29:[2,46],31:[2,46],33:[2,46],36:[2,46],41:[2,46],42:[2,46],47:[2,46],48:[2,46],49:[2,46]},{29:[1,71],49:[1,87]},{11:[2,48],18:[2,48],25:[2,48],29:[2,48],31:[2,48],33:[2,48],36:[2,48],42:[2,48],49:[2,48]},{25:[1,89],42:[1,88]},{25:[2,50],29:[1,71],42:[2,50]},{6:[2,23]},{17:46,18:[1,44],26:[1,21],28:90,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],26:[1,21],30:91,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],26:[1,21],32:92,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],26:[1,21],34:93,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{17:46,18:[1,44],26:[1,21],35:94,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{11:[2,35],18:[2,35],25:[2,35],29:[2,35],31:[2,35],33:[2,35],36:[2,35],42:[2,35],49:[2,35]},{11:[2,36],18:[2,36],25:[2,36],29:[2,36],31:[2,36],33:[2,36],36:[2,36],42:[2,36],49:[2,36]},{29:[1,71],42:[1,95]},{24:96,26:[1,56]},{17:46,18:[1,44],20:97,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{29:[1,71],42:[1,98]},{29:[1,71],42:[1,99]},{11:[1,100]},{55:[1,101]},{25:[1,103],42:[1,102]},{25:[2,64],42:[2,64]},{11:[2,47],18:[2,47],19:[2,47],21:[2,47],25:[2,47],29:[2,47],31:[2,47],33:[2,47],36:[2,47],41:[2,47],42:[2,47],47:[2,47],48:[2,47],49:[2,47]},{11:[2,49],18:[2,49],25:[2,49],29:[2,49],31:[2,49],33:[2,49],36:[2,49],42:[2,49],49:[2,49]},{17:46,18:[1,44],20:104,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{11:[2,25],25:[2,25],29:[2,25],31:[1,72],42:[2,25],49:[2,25]},{11:[2,27],25:[2,27],29:[2,27],31:[2,27],33:[1,73],42:[2,27],49:[2,27]},{11:[2,29],18:[1,74],25:[2,29],29:[2,29],31:[2,29],33:[2,29],42:[2,29],49:[2,29]},{11:[2,31],18:[2,31],25:[2,31],29:[2,31],31:[2,31],33:[2,31],36:[1,75],42:[2,31],49:[2,31]},{11:[2,33],18:[2,33],25:[2,33],29:[2,33],31:[2,33],33:[2,33],36:[2,33],42:[2,33],49:[2,33]},{11:[2,40],18:[2,40],25:[2,40],29:[2,40],31:[2,40],33:[2,40],36:[2,40],42:[2,40],49:[2,40]},{11:[2,19],25:[2,19],42:[2,19]},{11:[2,21],25:[2,21],29:[1,71],42:[2,21]},{55:[1,105]},{55:[1,106]},{17:46,18:[1,44],20:107,26:[1,21],28:38,30:39,32:40,34:41,35:42,37:43,38:[1,45],39:47,40:48,41:[1,49],43:[1,50],44:[1,51],45:[1,52],46:[1,53]},{6:[1,108]},{55:[1,109]},{26:[1,110]},{25:[2,51],29:[1,71],42:[2,51]},{6:[1,111]},{6:[1,112]},{11:[1,113],29:[1,71]},{9:114,22:[2,6],26:[2,6],27:[2,6],54:[2,6],56:[2,6],59:[2,6],60:[2,6]},{6:[1,115]},{25:[2,65],42:[2,65]},{9:116,22:[2,6],26:[2,6],27:[2,6],54:[2,6],56:[2,6],59:[2,6],60:[2,6]},{9:117,22:[2,6],26:[2,6],27:[2,6],54:[2,6],56:[2,6],59:[2,6],60:[2,6]},{10:118,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],40:20},{7:120,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],56:[1,119],59:[1,23],60:[1,24]},{9:121,22:[2,6],26:[2,6],27:[2,6],54:[2,6],56:[2,6],59:[2,6],60:[2,6]},{7:120,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],56:[1,122],59:[1,23],60:[1,24]},{7:120,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],56:[1,123],59:[1,23],60:[1,24]},{42:[1,124]},{6:[2,62]},{6:[1,125]},{7:120,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],56:[1,126],59:[1,23],60:[1,24]},{6:[2,57],57:127,58:[1,128]},{6:[2,60]},{55:[1,129]},{22:[2,7],26:[2,7],27:[2,7],54:[2,7],56:[2,7],59:[2,7],60:[2,7]},{6:[2,63]},{6:[2,56]},{51:130,54:[1,22],55:[1,131]},{6:[1,132]},{6:[2,58]},{6:[1,133]},{9:134,22:[2,6],26:[2,6],27:[2,6],54:[2,6],56:[2,6],59:[2,6],60:[2,6]},{9:135,22:[2,6],26:[2,6],27:[2,6],54:[2,6],56:[2,6],59:[2,6],60:[2,6]},{7:120,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],56:[1,136],59:[1,23],60:[1,24]},{7:120,10:7,12:8,13:9,14:11,15:12,16:13,17:14,22:[1,19],26:[1,21],27:[1,18],40:20,51:15,52:16,53:17,54:[1,22],56:[1,137],59:[1,23],60:[1,24]},{6:[2,61]},{6:[2,59]}],
defaultActions: {4:[2,1],8:[2,9],9:[2,10],15:[2,53],16:[2,54],17:[2,55],28:[2,8],36:[2,22],60:[2,2],70:[2,23],119:[2,62],123:[2,60],126:[2,63],127:[2,56],130:[2,58],136:[2,61],137:[2,59]},
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
less:function (n) {
        this._input = this.match.slice(n) + this._input;
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
lexer.rules = [/^(?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/]))))/,/^((?:null|break|case|catch|default|finally|instanceof|new|continue|void|delete|this|do|in|switch|throw|try|typeof|with|abstract|boolean|byte|char|class|const|debugger|double|enum|export|extends|final|float|goto|implements|import|int|interface|long|native|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile|arguments|NaN|Array|Object|RegExp|toString|jsmm|jsmmparser|jsmmExecutionCounter|jsmmCallStackDepth|jsmmtemp|jsmmscope|jsmmscopeInner|jsmmscopeOuter|jsmmtree))(?!([0-9a-zA-Z_]))/,/^true\b/,/^false\b/,/^if\b/,/^((?:((?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))|((?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/]))))*(?:[\n]((?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))|((?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/]))))*)+))?else\b/,/^while\b/,/^for\b/,/^var\b/,/^function\b/,/^return\b/,/^([a-zA-Z_])([0-9a-zA-Z_])*/,/^((?:((?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))|((?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/]))))*(?:[\n]((?:((?:[ \f\r\t\v\u00A0\u2028\u2029]+))|((?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/])))|((?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/]))))*)+))/,/^((?:(?:(?:[1-9]([0-9])*)|0)((?:\.([0-9])+))?((?:[eE][+-]?([0-9])+))?))/,/^((?:["][^\\"\n]*(?:[\\][nt"\\][^\\"]*)*["]))/,/^$/,/^(\+=|-=|\*=|\/=|%=)/,/^(==|!=|>=|<=|>|<)/,/^&&/,/^\|\|/,/^=/,/^(\+|-)/,/^(\*|\/|%)/,/^;/,/^!/,/^\(/,/^\)/,/^\{/,/^\}/,/^\[/,/^\]/,/^\./,/^,/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"inclusive":true}};
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
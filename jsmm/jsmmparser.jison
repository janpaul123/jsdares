/* js--: simplified educational javascript dialect */
/* string			(?:["]([^\"](?:[\\][\\])?(?:[\\]["])?)*["]) */
/* lexical grammar */
%lex

digit			[0-9]
alpha			[a-zA-Z_]
alphanum		[0-9a-zA-Z_]
exponent		(?:[eE][+-]?{digit}+)
whitespace		(?:[ \f\r\t\v\u00A0\u2028\u2029]+)
linecomment		(?:[/][/][^\n]*)
multicomment	(?:[/][*]([^*]*[*][^/])*[^*]*[*][/])
skip			(?:{whitespace}|{linecomment}|{multicomment})
newlines		(?:(?:[\n]{skip}?)+)
fraction		(?:"."{digit}+)
number			(?:(?:(?:[1-9]{digit}*)|"0"){fraction}?{exponent}?)
string			(?:["][^\\"\n]*(?:[\\][nt"\\][^\\"]*)*["])
reserved		(?:"null"|"break"|"case"|"catch"|"default"|"finally"|"instanceof"|"new"|"continue"|"void"|"delete"|"this"|"do"|"in"|"switch"|"throw"|"try"|"typeof"|"with"|"abstract"|"boolean"|"byte"|"char"|"class"|"const"|"debugger"|"double"|"enum"|"export"|"extends"|"final"|"float"|"goto"|"implements"|"import"|"int"|"interface"|"long"|"native"|"package"|"private"|"protected"|"public"|"short"|"static"|"super"|"synchronized"|"throws"|"transient"|"volatile"
|"arguments"|"NaN"|"Array"|"Object"|"RegExp"|"toString"
|"jsmm"|"jsmmparser"|"jsmmExecutionCounter"|"jsmmtemp"|"jsmmscope"|"jsmmscopeInner"|"jsmmscopeOuter"|"jsmmtree")

%%

{skip}										/* skip and comments */
("+="|"-="|"*="|"/="|"%=")					return "+=";
("=="|"!="|">="|"<="|">"|"<")				return "==";
"&&"										return "&&";
"||"										return "||";
"="											return "=";
("+"|"-")									return "+";
("*"|"/"|"%")								return "*";
";"											return ";";
"!"											return "!";
"("											return "(";
")"											return ")";
"{"											return "{";
"}"											return "}";
"["											return "[";
"]"											return "]";
"."											return ".";
","											return ",";
{reserved}(?!{alphanum})					return "RESERVED";
"true"										return "TRUE";
"false"										return "FALSE";
"if"										return "IF";
{newlines}?"else"							return "ELSE";
"while"										return "WHILE";
"for"										return "FOR";
"var"										return "VAR";
"function"									return "FUNCTION";
"return"									return "RETURN";
{alpha}{alphanum}*							return "NAME";
{newlines}									return "NEWLINE";
{number}									return "NUMBER";
{string}									return "STRING";
<<EOF>>										return "EOF";

/lex

%start program

%% /* language grammar */

program
	: programStatementList EOF					{ $$ = new yy.Program(@$, null, $1); return $$; }
	| NEWLINE programStatementList EOF			{ $$ = new yy.Program(@$, null, $2); return $$; }
;

programStatementList
	: /* empty */								{ $$ = new yy.StatementList(@$, null); }
	| programStatementList commonStatement NEWLINE
		{ $$ = $1; $$.addStatement($2); }
	| programStatementList functionDeclaration NEWLINE
		{ $$ = $1; $$.addStatement($2); }
;

statementList
	: /* empty */								{ $$ = new yy.StatementList(@$, null); }
	| statementList commonStatement NEWLINE		{ $$ = $1; $$.addStatement($2); }
;

commonStatement
	: simpleStatement ";"						{ $$ = new yy.CommonSimpleStatement(@$, undefined, $1); }
	| blockStatement
	| returnStatement
;

simpleStatement
	: assignmentStatement
	| varStatement
	| callStatement
	| identExpression "+" "+"					{ $$ = new yy.PostfixStatement(@$, undefined, $1, $2+$2); }
;

assignmentStatement
	: identExpression "=" expression			{ $$ = new yy.AssignmentStatement(@$, undefined, $1, "=", $3); }
	| identExpression "+=" expression			{ $$ = new yy.AssignmentStatement(@$, undefined, $1, $2, $3); }
;

varStatement
	: VAR varList								{ $$ = $2; }
;

varList
	: varListItem								{ $$ = new yy.VarStatement(@$, undefined); $$.addVarItem($1); }
	| varList "," varListItem					{ $$ = $1; $$.addVarItem($3); }
;

varListItem
	: NAME										{ $$ = new yy.VarItem(@$, undefined, $1, null); }
	| NAME "=" expression 
		{
			$$ = new yy.VarItem(@$, undefined, $1, new yy.AssignmentStatement(@$, undefined, new yy.NameIdentifier(@1, undefined, $1), "=", $3));
		}
;

returnStatement
	: RETURN ";"								{ $$ = new yy.ReturnStatement(@$, undefined, null); }
	| RETURN expression ";"						{ $$ = new yy.ReturnStatement(@$, undefined, $2); }
;

expression
	: andExpression
	| expression "||" andExpression				{ $$ = new yy.BinaryExpression(@$, undefined, $1, $2, $3); }
;

andExpression
	: relationalExpression
	| andExpression "&&" relationalExpression	{ $$ = new yy.BinaryExpression(@$, undefined, $1, $2, $3); }
;

relationalExpression
	: addExpression
	| relationalExpression "==" addExpression	{ $$ = new yy.BinaryExpression(@$, undefined, $1, $2, $3); }
;

addExpression
	: multExpression
	| addExpression "+" multExpression			{ $$ = new yy.BinaryExpression(@$, undefined, $1, $2, $3); }
;

multExpression
	: unaryExpression
	| multExpression "*" unaryExpression		{ $$ = new yy.BinaryExpression(@$, undefined, $1, $2, $3); }
;

unaryExpression
	: primaryExpression
	| "+" unaryExpression						{ $$ = new yy.UnaryExpression(@$, undefined, $1, $2); }
	| "!" unaryExpression						{ $$ = new yy.UnaryExpression(@$, undefined, $1, $2); }
;

primaryExpression
	: identExpression
	| NUMBER									{ $$ = new yy.NumberLiteral(@$, undefined, $1); }
	| STRING									{ $$ = new yy.StringLiteral(@$, undefined, $1); }
	| TRUE										{ $$ = new yy.BooleanLiteral(@$, undefined, true); }
	| FALSE										{ $$ = new yy.BooleanLiteral(@$, undefined, false); }
	| callExpression
	| "(" expression ")"						{ $$ = $2; }
;

identExpression
	: NAME										{ $$ = new yy.NameIdentifier(@$, undefined, $1); }
	| identExpression "." NAME					{ $$ = new yy.ObjectIdentifier(@$, undefined, $1, $3); }
	| identExpression "[" expression "]"		{ $$ = new yy.ArrayIdentifier(@$, undefined, $1, $3); }
;

callExpression
	: identExpression "(" ")"					{ $$ = new yy.FunctionCall(@$, undefined, $1, []); }
	| identExpression "(" callArguments ")"		{ $$ = new yy.FunctionCall(@$, undefined, $1, $3); }
;

callArguments
	: expression								{ $$ = [$1]; }
	| callArguments "," expression				{ $$ = $1; $$.push($3); }
;

callStatement
	: callExpression							{ $$ = new yy.CallStatement(@$, undefined, $1); }
;

blockStatement
	: ifBlock
	| whileBlock
	| forBlock
;

ifBlock
	: IF "(" expression ")" "{" NEWLINE statementList "}" elseBlock
		{ $$ = new yy.IfBlock(@$, @4.last_column, $expression, $statementList, $elseBlock); }
;

elseBlock
	: /* empty */								{ $$ = null; }
	| ELSE ifBlock								{ $$ = new yy.ElseIfBlock(@$, @1.last_column, $2); }
	| ELSE "{" NEWLINE statementList "}"		{ $$ = new yy.ElseBlock(@$, @1.last_column, $statementList); }
;

whileBlock
	: WHILE "(" expression ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.WhileBlock(@$, @4.last_column, $expression, $statementList); }
;

forBlock
	: FOR "(" simpleStatement ";" expression ";" simpleStatement ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.ForBlock(@$, @8.last_column, $simpleStatement1, $expression, $simpleStatement2, $statementList); }
;

functionDeclaration
	: FUNCTION NAME "(" ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.FunctionDeclaration(@$, @4.last_column, $2, [], $statementList); }
	| FUNCTION NAME "(" functionArguments ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.FunctionDeclaration(@$, @5.last_column, $2, $functionArguments, $statementList); }
;

functionArguments
	: NAME										{ $$ = [$1]; }
	| functionArguments "," NAME				{ $$ = $1; $$.push($3); }
;

reserved: RESERVED;
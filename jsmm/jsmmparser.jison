/* js--: simplified educational javascript dialect */
/* string			(?:["]([^\"](?:[\\][\\])?(?:[\\]["])?)*["]) */
/* lexical grammar */
%lex

digit			[0-9]
alpha			[a-zA-Z_]
alphanum		[0-9a-zA-Z_]
notalphanum     [^0-9a-zA-Z_]
exponent		(?:[eE][+-]?{digit}+)
whitespace		(?:[ \f\r\t\v\u00A0\u2028\u2029]+)
linecomment		(?:[/][/][^\n]*)
multicomment	(?:[/][*]([^*]*[*][^/])*[^*]*[*][/])
skip			(?:{whitespace}|{linecomment}|{multicomment})
newlines		(?:(?:[\n]{skip}?)+)
fraction		(?:"."{digit}+)
number			(?:(?:(?:[1-9]{digit}*)|"0"){fraction}?{exponent}?)
string			(?:["][^\\"]*(?:[\\].[^\\"]*)*["])
reservedjs		(?:"null"|"break"|"case"|"catch"|"default"|"finally"|"instanceof"|"new"|"continue"|"void"|"delete"|"this"|"do"|"in"|"switch"|"throw"|"try"|"typeof"|"with"|"abstract"|"boolean"|"byte"|"char"|"class"|"const"|"debugger"|"double"|"enum"|"export"|"extends"|"final"|"float"|"goto"|"implements"|"import"|"int"|"interface"|"long"|"native"|"package"|"private"|"protected"|"public"|"short"|"static"|"super"|"synchronized"|"throws"|"transient"|"volatile")
reserved		(?:"jsmmscope"|"jsmmscopeInner"|"jsmmscopeOuter"|"jsmm"|"jsmmparser")

%%

{skip}										/* skip and comments */
("++"|"--")									return "++";
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
({reservedjs}|{reservedjsmm}){notalphanum}	return "RESERVED";
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
	: programStatementList EOF					{ $$ = new yy.Program(@$, $1); return $$; }
	| NEWLINE programStatementList EOF			{ $$ = new yy.Program(@$, $2); return $$; }
;

programStatementList
	: /* empty */								{ $$ = new yy.StatementList(@$); }
	| programStatementList commonStatement NEWLINE
		{ $$ = $1; $$.addStatement($2); }
	| programStatementList functionDeclaration NEWLINE
		{ $$ = $1; $$.addStatement($2); }
;

statementList
	: /* empty */								{ $$ = new yy.StatementList(@$); }
	| statementList commonStatement NEWLINE		{ $$ = $1; $$.addStatement($2); }
;

commonStatement
	: simpleStatement ";"						{ $$ = new yy.CommonSimpleStatement(@$, $1); }
	| blockStatement
	| returnStatement
;

simpleStatement
	: assignmentStatement
	| varStatement
	| callStatement
	| identExpression "++"						{ $$ = new yy.PostfixStatement(@$, $1, $2); }
;

assignmentStatement
	: identExpression "=" expression			{ $$ = new yy.AssignmentStatement(@$, $1, "=", $3); }
	| identExpression "+=" expression			{ $$ = new yy.AssignmentStatement(@$, $1, $2, $3); }
;

varStatement
	: VAR varList								{ $$ = $2; }
;

varList
	: varListItem								{ $$ = new yy.VarStatement(@$); $$.addVarItem($1); }
	| varList "," varListItem					{ $$ = $1; $$.addVarItem($3); }
;

varListItem
	: NAME										{ $$ = new yy.VarItem(@$, $1, null); }
	| NAME "=" expression 
		{
			$$ = new yy.VarItem(@$, $1, new yy.AssignmentStatement(@$, new yy.NameIdentifier(@1, $1), "=", $3));
		}
;

returnStatement
	: RETURN ";"								{ $$ = new yy.ReturnStatement(@$, null); }
	| RETURN expression ";"						{ $$ = new yy.ReturnStatement(@$, $2); }
;

expression
	: andExpression
	| expression "||" andExpression				{ $$ = new yy.BinaryExpression(@$, $1, $2, $3); }
;

andExpression
	: relationalExpression
	| andExpression "&&" relationalExpression	{ $$ = new yy.BinaryExpression(@$, $1, $2, $3); }
;

relationalExpression
	: addExpression
	| relationalExpression "==" addExpression	{ $$ = new yy.BinaryExpression(@$, $1, $2, $3); }
;

addExpression
	: multExpression
	| addExpression "+" multExpression			{ $$ = new yy.BinaryExpression(@$, $1, $2, $3); }
;

multExpression
	: unaryExpression
	| multExpression "*" unaryExpression		{ $$ = new yy.BinaryExpression(@$, $1, $2, $3); }
;

unaryExpression
	: primaryExpression
	| "+" unaryExpression						{ $$ = new yy.UnaryExpression(@$, $1, $2); }
	| "!" unaryExpression						{ $$ = new yy.UnaryExpression(@$, $1, $2); }
;

primaryExpression
	: identExpression
	| NUMBER									{ $$ = new yy.NumberLiteral(@$, $1); }
	| STRING									{ $$ = new yy.StringLiteral(@$, $1); }
	| TRUE										{ $$ = new yy.BooleanLiteral(@$, true); }
	| FALSE										{ $$ = new yy.BooleanLiteral(@$, false); }
	| callExpression
	| "(" expression ")"						{ $$ = $2; }
;

identExpression
	: NAME										{ $$ = new yy.NameIdentifier(@$, $1); }
	| identExpression "." NAME					{ $$ = new yy.ObjectIdentifier(@$, $1, $3); }
	| identExpression "[" expression "]"		{ $$ = new yy.ArrayIdentifier(@$, $1, $3); }
;

callExpression
	: identExpression "(" ")"					{ $$ = new yy.FunctionCall(@$, $1, []); }
	| identExpression "(" callArguments ")"		{ $$ = new yy.FunctionCall(@$, $1, $3); }
;

callArguments
	: expression								{ $$ = [$1]; }
	| callArguments "," expression				{ $$ = $1; $$.push($3); }
;

callStatement
	: callExpression							{ $$ = new yy.CallStatement(@$, $1); }
;

blockStatement
	: ifBlock
	| whileBlock
	| forBlock
;

ifBlock
	: IF "(" expression ")" "{" NEWLINE statementList "}" elseBlock
		{ $$ = new yy.IfBlock(@$, $expression, $statementList, $elseBlock); }
;

elseBlock
	: /* empty */								{ $$ = null; }
	| ELSE ifBlock								{ $$ = new yy.ElseIfBlock(@$, $2); }
	| ELSE "{" NEWLINE statementList "}"		{ $$ = new yy.ElseBlock(@$, $statementList); }
;

whileBlock
	: WHILE "(" expression ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.WhileBlock(@$, $expression, $statementList); }
;

forBlock
	: FOR "(" simpleStatement ";" expression ";" simpleStatement ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.ForBlock(@$, $simpleStatement1, $expression, $simpleStatement2, $statementList); }
;

functionDeclaration
	: FUNCTION NAME "(" ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.FunctionDeclaration(@$, $2, [], $statementList, @2, @4); }
	| FUNCTION NAME "(" functionArguments ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.FunctionDeclaration(@$, $2, $functionArguments, $statementList, @2, @5); }
;

functionArguments
	: NAME										{ $$ = [$1]; }
	| functionArguments "," NAME				{ $$ = $1; $$.push($3); }
;

reserved: RESERVED;
/* js--: simplified educational javascript dialect */
/* string			(?:["]([^\"](?:[\\][\\])?(?:[\\]["])?)*["]) */
/* lexical grammar */
%lex

digit			[0-9]
alpha			[a-zA-Z_]
alphanum		[0-9a-zA-Z_]
exponent		(?:[eE][+-]?{digit}+)
whitespace		(?:[ \f\r\t\v\u00A0\u2028\u2029]+)
linecomment		(?:(?:[/][/][^\n]*)|(?:[/][*](?:[^*\n]*[*][^/\n])*[^*\n]*[*][/]))
multicomment	(?:[/][*](?:[^*]*[*][^/])*[^*]*[*][/])
skip			(?:{whitespace}|{linecomment}|{multicomment})
newlines		(?:{skip}*(?:[\n]{skip}*)+)
fraction		(?:"."{digit}+)
number			(?:(?:(?:[1-9]{digit}*)|"0"){fraction}?{exponent}?)
string			(?:["][^\\"\n]*(?:[\\][nt"\\][^\\"\n]*)*["])

reserved		(?:"undefined"|"null"|"break"|"case"|"catch"|"default"|"finally"|"instanceof"|"new"|"continue"|"void"|"delete"|"this"|"do"|"in"|"switch"|"throw"|"try"|"typeof"|"with"|"abstract"|"boolean"|"byte"|"char"|"class"|"const"|"debugger"|"double"|"enum"|"export"|"extends"|"final"|"float"|"goto"|"implements"|"import"|"int"|"interface"|"long"|"native"|"package"|"private"|"protected"|"public"|"short"|"static"|"super"|"synchronized"|"throws"|"transient"|"volatile"|"arguments"|"NaN"|"Array"|"Object"|"RegExp"|"toString"|(?:"jsmm"{alphanum}*))
invalid			(?:"'"|"~"|">>="|"<<="|">>"|"<<"|"==="|"!=="|"?"|":"|"$"|"\\")
invalid_short   (?:"|"|"&")

%%

(?:{whitespace}|{linecomment})				/* skip and comments */
{reserved}(?!{alphanum})					return "RESERVED";
{invalid}									return "INVALID";
"true"										return "TRUE";
"false"										return "FALSE";
"if"										return "IF";
"else"										return "ELSE";
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
{invalid_short}								return "INVALID";
"\""										return '"';

/lex

%start program

%% /* language grammar */

program
	: programStatementList EOF					{ $$ = new yy.nodes.Program(@$, undefined, $1); return $$; }
	| NEWLINE programStatementList EOF			{ $$ = new yy.nodes.Program(@$, undefined, $2); return $$; }
;

programStatementList
	: /* empty */								{ $$ = new yy.nodes.StatementList(@$, undefined); }
	| programStatementList commonStatement NEWLINE
		{ $$ = $1; $$.addStatement($2); }
	| programStatementList functionDeclaration NEWLINE
		{ $$ = $1; $$.addStatement($2); }
;

statementList
	: /* empty */								{ $$ = new yy.nodes.StatementList(@$, undefined); }
	| statementList commonStatement NEWLINE		{ $$ = $1; $$.addStatement($2); }
;

commonStatement
	: simpleStatement ";"						{ $$ = new yy.nodes.CommonSimpleStatement(@$, undefined, $1); }
	| blockStatement
	| returnStatement
;

simpleStatement
	: assignmentStatement
	| varStatement
	| callExpression
	| identExpression "+" "+"					{ $$ = new yy.nodes.PostfixStatement(@$, undefined, $1, $2+$2); }
;

assignmentStatement
	: identExpression "=" expression			{ $$ = new yy.nodes.AssignmentStatement(@$, undefined, $1, "=", $3); }
	| identExpression "+=" expression			{ $$ = new yy.nodes.AssignmentStatement(@$, undefined, $1, $2, $3); }
;

varStatement
	: VAR varList								{ $$ = $2; }
;

varList
	: varListItem								{ $$ = new yy.nodes.VarStatement(@$, undefined); $$.addVarItem($1); }
	| varList "," varListItem					{ $$ = $1; $$.addVarItem($3); }
;

varListItem
	: NAME										{ $$ = new yy.nodes.VarItem(@$, undefined, $1, null); }
	| NAME "=" expression 
		{
			$$ = new yy.nodes.VarItem(@$, undefined, $1, new yy.nodes.AssignmentStatement(@$, undefined, new yy.nodes.NameIdentifier(@1, undefined, $1), "=", $3));
		}
;

returnStatement
	: RETURN ";"								{ $$ = new yy.nodes.ReturnStatement(@$, undefined, null); }
	| RETURN expression ";"						{ $$ = new yy.nodes.ReturnStatement(@$, undefined, $2); }
;

expression
	: andExpression
	| expression "||" andExpression				{ $$ = new yy.nodes.BinaryExpression(@$, undefined, $1, $2, $3); }
;

andExpression
	: relationalExpression
	| andExpression "&&" relationalExpression	{ $$ = new yy.nodes.BinaryExpression(@$, undefined, $1, $2, $3); }
;

relationalExpression
	: addExpression
	| relationalExpression "==" addExpression	{ $$ = new yy.nodes.BinaryExpression(@$, undefined, $1, $2, $3); }
;

addExpression
	: multExpression
	| addExpression "+" multExpression			{ $$ = new yy.nodes.BinaryExpression(@$, undefined, $1, $2, $3); }
;

multExpression
	: unaryExpression
	| multExpression "*" unaryExpression		{ $$ = new yy.nodes.BinaryExpression(@$, undefined, $1, $2, $3); }
;

unaryExpression
	: primaryExpression
	| "+" unaryExpression						{ $$ = new yy.nodes.UnaryExpression(@$, undefined, $1, $2); }
	| "!" unaryExpression						{ $$ = new yy.nodes.UnaryExpression(@$, undefined, $1, $2); }
;

primaryExpression
	: literal
	| identExpression
	| callExpression
	| arrayDefinition
	| "(" expression ")"						{ $$ = new yy.nodes.ParenExpression(@$, undefined, $2); }
;

literal
	: NUMBER									{ $$ = new yy.nodes.NumberLiteral(@$, undefined, $1); }
	| STRING									{ $$ = new yy.nodes.StringLiteral(@$, undefined, $1); }
	| TRUE										{ $$ = new yy.nodes.BooleanLiteral(@$, undefined, true); }
	| FALSE										{ $$ = new yy.nodes.BooleanLiteral(@$, undefined, false); }
;

identExpression
	: NAME										{ $$ = new yy.nodes.NameIdentifier(@$, undefined, $1); }
	| identExpression "." NAME					{ $$ = new yy.nodes.ObjectIdentifier(@$, undefined, $1, $3); }
	| identExpression "[" expression "]"		{ $$ = new yy.nodes.ArrayIdentifier(@$, undefined, $1, $3); }
;


callExpression
	: identExpression "(" ")"					{ $$ = new yy.nodes.FunctionCall(@$, undefined, $1, []); }
	| identExpression "(" callArguments ")"		{ $$ = new yy.nodes.FunctionCall(@$, undefined, $1, $3); }
;

callArguments
	: expression								{ $$ = [$1]; }
	| callArguments "," expression				{ $$ = $1; $$.push($3); }
;

arrayDefinition
	: "[" "]"									{ $$ = new yy.nodes.ArrayDefinition(@$, undefined, []); }
	| "[" arrayList "]"							{ $$ = new yy.nodes.ArrayDefinition(@$, undefined, $2); }
;

arrayList
	: expression 								{ $$ = [$1]; }
	| arrayList "," expression					{ $$ = $1; $$.push($3); }
;

blockStatement
	: ifBlock
	| whileBlock
	| forBlock
;

ifBlock
	: IF "(" expression ")" "{" NEWLINE statementList "}" elseBlock
		{ $$ = new yy.nodes.IfBlock(@$, @4.last_column, $expression, $statementList, $elseBlock); }
;

elseBlock
	: /* empty */								{ $$ = null; }
	| ELSE ifBlock								{ $$ = new yy.nodes.ElseIfBlock(@$, @1.last_column, $2); }
	| ELSE "{" NEWLINE statementList "}"		{ $$ = new yy.nodes.ElseBlock(@$, @1.last_column, $statementList); }
;

whileBlock
	: WHILE "(" expression ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.nodes.WhileBlock(@$, @4.last_column, $expression, $statementList); }
;

forBlock
	: FOR "(" simpleStatement ";" expression ";" simpleStatement ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.nodes.ForBlock(@$, @8.last_column, $simpleStatement1, $expression, $simpleStatement2, $statementList); }
;

functionDeclaration
	: FUNCTION NAME "(" ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.nodes.FunctionDeclaration(@$, @4.last_column, $2, [], $statementList); }
	| FUNCTION NAME "(" functionArguments ")" "{" NEWLINE statementList "}"
		{ $$ = new yy.nodes.FunctionDeclaration(@$, @5.last_column, $2, $functionArguments, $statementList); }
;

functionArguments
	: NAME										{ $$ = [$1]; }
	| functionArguments "," NAME				{ $$ = $1; $$.push($3); }
;

reserved: RESERVED;
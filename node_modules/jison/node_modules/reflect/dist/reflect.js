
var parser = require("./parser").parser,
    nodes = require("./nodes"),
    mozNodes = require("./moznodes"),
    stringify = require("./stringify").stringify;

function JSParser (options) {
    // Create a parser constructor and an instance
    this.parser = new Parser(options||{});
}

JSParser.prototype = {
    parse: function (source, options) {
        return this.parser.parse(source, options);
    }
};

var defaultBuilder = {};
var mozBuilder = {};

// Define AST nodes
nodes.defineNodes(defaultBuilder);

// Define Mozilla style AST nodes
nodes.defineNodes(mozBuilder);
mozNodes.defineNodes(mozBuilder);

function Parser (options) {
    this.yy.source = options.source||null;
    this.yy.startLine = options.line || 1;
    this.yy.noloc = options.loc === false;
    this.yy.builder = options.builder||defaultBuilder;
}

Parser.prototype = parser;

// allow yy.NodeType calls in parser
for (var con in defaultBuilder) {
    if (defaultBuilder.hasOwnProperty(con)) {
        parser.yy[con] = function (name){
            var context = this;
            return function (a,b,c,d,e,f,g,h) {
                    return context.builder[name](a,b,c,d,e,f,g,h);
                };
            }(con);
    }
}

// used named arguments to avoid arguments array
parser.yy.Node = function Node (type, a,b,c,d,e,f,g,h) {
    var buildName = type[0].toLowerCase()+type.slice(1);
    if (this.builder && this.builder[buildName]) {
        return this.builder[buildName](a,b,c,d,e,f,g,h);
    } else if (mozBuilder[buildName]) {
        return mozBuilder[buildName](a,b,c,d,e,f,g,h);
    } else {
        throw 'no such node type: '+type;
    }
};

parser.yy.locComb = function (start, end) {
    start.last_line = end.last_line;
    start.last_column = end.last_column;
    start.range = [start.range[0], end.range[1]];
    return start;
};

parser.yy.loc = function (loc) {
    if (this.noloc) return null;
    if ("length" in loc) loc = this.locComb(loc[0],loc[1]);

    var newLoc = { start:  { line: this.startLine+loc.first_line - 1,
                             column: loc.first_column },
                   end:    { line: this.startLine+loc.last_line - 1,
                             column: loc.last_column },
                   range:  loc.range
                 };

    if (this.source || this.builder !== defaultBuilder)
      newLoc.source = this.source;
    return newLoc;
};

// Handle parse errors and recover from ASI
parser.yy.parseError = function (err, hash) {
    // don't print error for missing semicolon
    if (!((!hash.expected || hash.expected.indexOf("';'") >= 0) && (hash.token === 'CLOSEBRACE' || parser.yy.lineBreak || parser.yy.lastLineBreak || hash.token === 1 || parser.yy.doWhile))) {
        throw new SyntaxError(err);
    }
};

parser.lexer.options.ranges = true;

// used to check if last match was a line break (for ; insertion)
var realLex = parser.lexer.lex;
parser.lexer.lex = function () {
    parser.yy.lastLineBreak = parser.yy.lineBreak;
    parser.yy.lineBreak = false;
    return realLex.call(this);
};

var realNext = parser.lexer.next;
parser.lexer.next = function () {
    var ret = realNext.call(this);
    if (ret === 'COMMENT' || ret === 'COMMENT_BLOCK') {
        if (this.yy.options.comment) {
            this.yy.comments.push({range: this.yylloc.range, type: types[ret], value: this.yytext});
        }
        return;
    }
    if (ret && ret !== 1 && ret !== 199) {
        if (this.yy.options.tokens) {
            var tokens = this.yy.tokens;
            var last = tokens[tokens.length-1];
            if (tokens.length && (last.value == '/' || last.value == '/=')) {
                tokens[tokens.length-1] = tokenObject(this, ret);
                var t = tokens[tokens.length-1];
                t.range[0] = last.range[0];
                t.value = last.value + t.value;
            } else {
                this.yy.tokens.push(tokenObject(this, ret));
            }
        }
    }
    return ret;
};

var types = {
  "NULLTOKEN": "Null",
  "THISTOKEN": "Keyword",
  "VAR": "Keyword",
  "IDENT": "Identifier",
  "NUMBER": "Numeric",
  "STRING": "String",
  "REGEXP_BODY": "RegularExpression",
  "COMMENT": "Line",
  "COMMENT_BLOCK": "Block",
  "TRUETOKEN": "Boolean",
  "FALSETOKEN": "Boolean"
};

// Punctuator tokens
'OPENBRACE CLOSEBRACE [ ] ( ) { } . ; : , PLUSEQUAL MINUSEQUAL MULTEQUAL MODEQUAL ANDEQUAL OREQUAL XOREQUAL LSHIFTEQUAL RSHIFTEQUAL URSHIFTEQUAL DIVEQUAL LE GE STREQ STRNEQ EQEQ NE AND OR PLUSPLUS MINUSMINUS URSHIFT LSHIFT + - * % < > & | ^ ! ~ ? / ='.split(' ').forEach(function (token) {
  types[token] = 'Punctuator';
});

// Keyword tokens
'BREAK CASE CONTINUE DEBUGGER DEFAULT DELETETOKEN DO ELSE FINALLY FOR FUNCTION IF INTOKEN INSTANCEOF NEW RETURN SWITCH TRY CATCH THROW TYPEOF VAR VOIDTOKEN WHILE WITH CLASS CONSTTOKEN LET ENUM EXPORT EXTENDS IMPORT SUPERTOKEN IMPLEMENTS INTERFACE PACKAGE PRIVATE PROTECTED PUBLIC STATIC YIELD THISTOKEN EVAL ARGUMENTS'.split(' ').forEach(function (token) {
  types[token] = 'Keyword';
});

function tokenObject (lexer, token) {
    var symbols = lexer.yy.parser.terminals_;
    return {
        "type":   types[symbols[token] || token],
        "value":  lexer.match,
        "range":  lexer.yylloc.range
    };
}

parser.yy.escapeString = function (s) {
  return s.replace(/\\\n/,'').replace(/\\([^xubfnvrt0\\])/g, '$1');
};

var oldParse = parser.parse;
parser.parse = function (source, options) {
    this.yy.lineBreak = false;
    this.yy.inRegex = false;
    this.yy.ASI = false;
    this.yy.tokens = [];
    this.yy.raw = [];
    this.yy.comments = [];
    this.yy.options = options || {};
    return oldParse.call(this,source);
};

exports.Reflect = {
    parse: function (src, options) {
        return new JSParser(options).parse(src, options);
    },
    stringify: stringify
};

exports.parse = exports.Reflect.parse;
exports.stringify = stringify;
exports.builder = defaultBuilder;
exports.mozBuilder = mozBuilder;


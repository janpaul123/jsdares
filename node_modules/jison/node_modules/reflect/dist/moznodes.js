
exports.defineNodes = function (builder, init) {

var defaultIni = function (loc) {
    this.loc = loc;
    return this;
};

var def = function def(name, ini) {
    builder[name[0].toLowerCase()+name.slice(1)] = function (a,b,c,d,e,f,g,h) {
        var obj = {};
        obj.type = name;
        ini.call(obj,a,b,c,d,e,f,g,h);
        if (obj.loc) {
            obj.range = obj.loc.range || [0,0];
            delete obj.loc;
            obj.loc = arguments[ini.length-(name=='Literal' ? 2:1)];
            delete obj.loc.range;
        }
        return obj;
    };
};

/* Nodes
*/

// used in cases where object and array literals are valid expressions
function convertExprToPattern (expr) {
    if (expr.type == 'ObjectExpression') {
        expr.type = 'ObjectPattern';
    } else if (expr.type == 'ArrayExpression') {
        expr.type = 'ArrayPattern';
    }
}

// Program node
def('Program', function (elements,loc) {
    this.body = elements;
    this.loc = loc;
    this.body.forEach(function (el) {
      if (el.type == "VariableDeclaration" && el.kind == "let") {
        el.kind = "var";
      }
    });
});

// Identifier node
def('Identifier', function (name,loc) {
    this.name = name;
    this.loc = loc;
});

// Literal expression node
def('Literal', function (val, loc) {
    this.value = val;
    this.loc = loc;
});

// Var statement node
def('VariableDeclaration', function (kind, declarations, loc) {
    this.declarations = declarations;
    this.kind = kind;
    this.loc = loc;
});

def('VariableDeclarator', function (id, init, loc) {
    this.id = id;
    this.init = init;
    this.loc = loc;
});

def('Property', function (key, value, kind, loc) {
    this.key = key;
    this.value = value;
    this.kind = kind;
    this.loc = loc;
});

def('SwitchStatement', function (discriminant, cases, lexical, loc) {
    this.discriminant = discriminant;
    if (cases.length) this.cases = cases;
    this.lexical = !!lexical;
    this.loc = loc;
});

def('SwitchCase', function (test, consequent, loc) {
    this.test = test;
    this.consequent = consequent;
    this.loc = loc;
});


// Function declaration node
var funIni = function (ident, params, body, isGen, isExp, loc) {
    this.id = ident;
    this.params = params;
    this.body = body;
    this.generator = isGen;
    this.expression = isExp;
    this.loc = loc;
    if (!this.expression) {
        this.body.body.forEach(function (el) {
            if (el.type == "VariableDeclaration" && el.kind == "let") {
                el.kind = "var";
            }
        });
    }
};

def('FunctionDeclaration', funIni);

def('FunctionExpression', funIni);

// operators
def('ConditionalExpression', function (test, consequent, alternate, loc) {
    this.test = test;
    this.alternate = alternate;
    this.consequent = consequent;
    this.loc = loc;
});

def('UnaryExpression', function (operator, argument, prefix, loc) {
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
    this.loc = loc;
});


def('UpdateExpression', function (operator, argument, prefix, loc) {
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
    this.loc = loc;
});

// control structs

def('IfStatement', function (test, consequent, alternate, loc) {
    this.test = test;
    this.alternate = alternate;
    this.consequent = consequent;
    this.loc = loc;
});

return def;
};


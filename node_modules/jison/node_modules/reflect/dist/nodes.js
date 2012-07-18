
exports.defineNodes = function (builder) {

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
});

def('ExpressionStatement', function (expression, loc) {
    this.expression = expression;
    this.loc = loc;
});

def('BlockStatement', function (body, loc) {
    this.body = body;
    this.loc = loc;
});

def('EmptyStatement', defaultIni);


// Identifier node
def('Identifier', function (name,loc) {
    this.name = name;
    this.loc = loc;
});

// Literal expression node
def('Literal', function (val, loc, raw) {
    this.value = val;
    if (raw) this.raw = raw;
    this.loc = loc;
});

// "this" expression node
def('ThisExpression', defaultIni);

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

def('ArrayExpression', function (elements, loc) {
    this.elements = elements;
    this.loc = loc;
});

def('ObjectExpression', function (properties, loc) {
    this.properties = properties;
    this.loc = loc;
});

def('Property', function (key, value, kind, loc) {
    this.key = key;
    this.value = value;
    this.kind = kind;
    this.loc = loc;
});

// Function declaration node
var funIni = function (ident, params, body, isGen, isExp, loc) {
    this.id = ident;
    this.params = params;
    this.body = body;
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

// return statement node
def('ReturnStatement', function (argument, loc) {
    this.argument = argument;
    this.loc = loc;
});

def('TryStatement', function (block, handlers, finalizer, loc) {
    this.block = block;
    this.handlers = handlers || [];
    this.finalizer = finalizer;
    this.loc = loc;
});

def('CatchClause', function (param, guard, body, loc) {
    this.param = param;
    this.guard = guard;
    this.body = body;
    this.loc = loc;
});

def('ThrowStatement', function (argument, loc) {
    this.argument = argument;
    this.loc = loc;
});

def('LabeledStatement', function (label, body, loc) {
    this.label = label;
    this.body = body;
    this.loc = loc;
});

def('BreakStatement', function (label, loc) {
    this.label = label;
    this.loc = loc;
});

def('ContinueStatement', function (label, loc) {
    this.label = label;
    this.loc = loc;
});

def('SwitchStatement', function (discriminant, cases, lexical, loc) {
    this.discriminant = discriminant;
    if (cases.length) this.cases = cases;
    this.loc = loc;
});

def('SwitchCase', function (test, consequent, loc) {
    this.test = test;
    this.consequent = consequent;
    this.loc = loc;
});

def('WithStatement', function (object, body, loc) {
    this.object = object;
    this.body = body;
    this.loc = loc;
});


// operators
def('ConditionalExpression', function (test, consequent, alternate, loc) {
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
    this.loc = loc;
});

def('SequenceExpression', function (expressions, loc) {
    this.expressions = expressions;
    this.loc = loc;
});

def('BinaryExpression', function (op, left, right, loc) {
    this.operator = op;
    this.left = left;
    this.right = right;
    this.loc = loc;
});

def('AssignmentExpression', function (op, left, right, loc) {
    this.operator = op;
    this.left = left;
    this.right = right;
    this.loc = loc;
    convertExprToPattern(left);
});

def('LogicalExpression', function (op, left, right, loc) {
    this.operator = op;
    this.left = left;
    this.right = right;
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

def('CallExpression', function (callee, args, loc) {
    this.callee = callee;
    this["arguments"] = args;
    this.loc = loc;
});


def('NewExpression', function (callee, args, loc) {
    this.callee = callee;
    this["arguments"] = args;
    this.loc = loc;
});


def('MemberExpression', function (object, property, computed, loc) {
    this.object = object;
    this.property = property;
    this.computed = computed;
    this.loc = loc;
});

// debugger node
def('DebuggerStatement', defaultIni);

// empty node
def('Empty', defaultIni);

// control structs

def('WhileStatement', function (test, body, loc) {
    this.test = test;
    this.body = body;
    this.loc = loc;
});

def('DoWhileStatement', function (body, test, loc) {
    this.body = body;
    this.test = test;
    this.loc = loc;
});

def('ForStatement', function (init, test, update, body, loc) {
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
    this.loc = loc;
    if (init) convertExprToPattern(init);
});

def('ForInStatement', function (left, right, body, each, loc) {
    this.left = left;
    this.right = right;
    this.body = body;
    this.each = !!each;
    this.loc = loc;
    convertExprToPattern(left);
});

def('IfStatement', function (test, consequent, alternate, loc) {
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
    this.loc = loc;
});

def('ObjectPattern', function (properties, loc) {
    this.properties = properties;
    this.loc = loc;
});

def('ArrayPattern', function (elements, loc) {
    this.elements = elements;
    this.loc = loc;
});

return def;
};


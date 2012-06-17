
var indentChar = '    '; //4 spaces

function idt (lvl) {
    if (lvl < 0) lvl = 0;
    return Array(lvl+1).join(indentChar);
}

var codegens = exports.nodes = {
    'EmptyStatement': function Empty_codegen () {
        return '';
    },
    'Literal': function LiteralExpr_codegen () {
        switch (this.type) {
            case 'null':
                return 'null';
            case 'string':
                return '"'+this.value+'"';
            default:
                return this.value.toString();
        }
    },
    'ObjectExpression': function ObjectExpr_codegen (lvl) {
        return this.children.length ? "{\n"+idt(lvl)+this.children.map(function(node){return node.toJS(lvl+1)}).join(',\n'+idt(lvl))+'\n'+idt(lvl-1)+'}':
            '{}';
    },
    'ThisExpression': function ThisExpression_codegen (lvl) {
        return 'this';
    },
    'ArrayExpression': function ObjectExpr_codegen (lvl) {
        return "["+this.children.map(function(node){return node.toJS(lvl+1)}).join(', ')
            +(this.children.length && this.children[this.children.length-1].nodeType === 'Empty' ? ',':'')
            +"]";
    },
    'MemberExpression': function MemberExpr_codegen (lvl) {
        return this.children[0].toJS(lvl+1) + 
                (this.brackets ?
                  '['+this.children[1].toJS(lvl+1)+']' :
                  '.'+this.children[1].value);
    },
    'NewExpression': function MemberExpr_codegen (lvl) {
        return 'new '+this.children[0].toJS(lvl+1) + 
                (this.children.length > 1 ?
                  '('+this.children.slice(1).map(function(node){return node.toJS(lvl+1)}).join(', ')+')' : '()');
    },
    'CallExpression': function CappExpr_codegen (lvl) {
        return this.children[0].toJS(lvl+1) + 
                (this.children.length > 1 ?
                  '('+this.children.slice(1).map(function(node){return node.toJS(lvl+1)}).join(', ')+')' : '()');
    },
    'UpdateExpression': function CountExpr_codegen (lvl) {
        return this.isPrefix ?
            this.op + this.children[0].toJS(lvl+1) :
            this.children[0].toJS(lvl+1) + this.op;
    },
    //'DeleteExpression': function DeleteExpr_codegen (lvl) {
        //return 'delete '+this.children[0].toJS(lvl+1);
    //},
    //'VoidExpression': function VoidExpr_codegen (lvl) {
        //return 'void '+this.children[0].toJS(lvl+1);
    //},
    //'TypeofExpression': function TypeofExpr_codegen (lvl) {
        //return 'typeof '+this.children[0].toJS(lvl+1);
    //},
    'UnaryExpression': function UnaryPlusExpr_codegen (lvl) {
        return '+ '+this.children[0].toJS(lvl+1);
    },
    'ConditionalExpression': function ConditionalExpr_codegen (lvl) {
        return this.children[0].toJS(lvl+1) + ' ? ' +
            this.children[1].toJS(lvl+1) +' : '+
            this.children[2].toJS(lvl+1);
    },
    'AssignmentExpression': function AssignExpr_codegen (lvl) {
        return this.children[0].toJS(lvl+1) +' '+ this.op +' '+
            this.children[1].toJS(lvl+1);
    },
    'BinaryExpression': function BinaryExpr_codegen (lvl) {
        return this.children[0].toJS(lvl+1) + this.op +' '+ this.children[1].toJS(lvl+1);
    },
    'BlockStatement': function BlockStmt_codegen (lvl) {
        return this.body.length ? "{\n"+idt(lvl)+genStmts(this.body, lvl)+"\n"+idt(lvl-1)+"}" :
        '{ }';
    },
    'VariableDeclaration': function VariableDeclaration_codegen (lvl) {
        return "var "+this.children.map(function(node){return node.toJS(lvl);}).join(',\n'+idt(lvl+1));
    },
    'InitPatt': function InitPatt_codegen (lvl) {
        return this.children[0].toJS(lvl) +' = '+
            this.children[1].toJS(lvl);
    },
    'IfStatement': function IfStmt_codegen (lvl) {
        return 'if (' + this.children[0].toJS(lvl+1) +') '+ this.children[1].blockgen(lvl+1)
            + (this.children[2].nodeType === 'EmptyStatement' ? '' :
            ' else '+this.children[2].blockgen(lvl));
    },
    'DoWhileStatement': function DoWhileStmt_codegen (lvl) {
        return 'do '+this.children[0].blockgen(lvl+1) + ' while (' + this.children[1].toJS(lvl+1) +')';
    },
    'WhileStatement': function WhileStmt_codegen (lvl) {
        return 'while (' + this.children[0].toJS(lvl+1) +') '+ this.children[1].blockgen(lvl+1);
    },
    'ForStatement': function ForStmt_codegen (lvl) {
        return 'for (' + this.children[0].toJS(lvl+1) +
            ';' + this.children[1].toJS(lvl+1) +
            ';' + this.children[2].toJS(lvl+1) +') '+ this.children[3].blockgen(lvl+1);
    },
    'ForInStatement': function ForStmt_codegen (lvl) {
        return 'for (' + this.children[0].toJS(lvl+1) +
            ' in ' + this.children[1].toJS(lvl+1) +') '+ this.children[2].blockgen(lvl+1);
    },
    'ContinueStatement': function ContinueStmt_codegen (lvl) {
        return 'continue' + (this.label ? ' '+this.label : '');
    },
    'BreakStatement': function BreakStmt_codegen (lvl) {
        return 'break' + (this.label ? ' '+this.label : '');
    },
    'ReturnStatement': function ReturnStatement_codegen (lvl) {
        return 'return' + (this.children.length ? ' '+this.children[0].toJS(lvl+1) : '');
    },
    'WithStatement': function WithStmt_codegen (lvl) {
        return 'with (' +this.children[0].toJS() + ') ' + this.children[1].blockgen(lvl);
    },
    'SwitchStatement': function SwitchStmt_codegen (lvl) {
        return 'switch ('+this.children[0].toJS()+') {\n'+idt(lvl)
            +this.children.slice(1).map(function(node){return node.toJS(lvl+1)}).join('\n'+idt(lvl))
            +'\n'+idt(lvl-1)+'}';
    },
    'SwitchCase': function Case_codegen (lvl) {
        return 'case ' +this.children[0].toJS()+':\n'+idt(lvl)+this.children.slice(1).map(function(node){return node.blockgen(lvl+1)}).join('\n'+idt(lvl));
    },
    'LabeledStatement': function LabelledStmt_codegen (lvl) {
        return 'labelled:\n'+idt(lvl) +this.children[0].blockgen(lvl+1);
    },
    'ThrowStatement': function ThrowStmt_codegen (lvl) {
        return 'throw ' + this.children[0].toJS(lvl+1);
    },
    'TryStatement': function TryStmt_codegen (lvl) {
        return 'try ' + this.children[0].toJS(lvl+1)
            +this.children[1].toJS(lvl+1)
            +(this.children.length === 3 ? 
                ' finally '+this.children[2].toJS(lvl+1) : '');
    },
    'CatchClause': function CatchClause_codegen (lvl) {
        return ' catch (' + this.children[0].toJS(lvl) +') '+this.children[1].toJS(lvl);
    },
    'DebuggerStatement': function DebuggerStmt_codegen (lvl) {
        return 'debugger';
    },
    'FunctionDeclaration': function FunctionDeclaration_codegen (lvl) {
        return 'function ' + this.children[0].toJS() +' ('
            +this.children[1].toJS(lvl+1) + ') '
            +'{\n'+idt(lvl)+genStmts(this.children.slice(2), lvl) +'\n'+idt(lvl-1)+'}';
    },
    'FunctionExpression': function FunctionExpr_codegen (lvl) {
        return 'function' + (this.children[0].nodeType === 'Empty' ? '' : ' '+this.children[0].toJS()) +' ('
            +this.children[1].toJS() + ') '
            +'{\n'+idt(lvl)+genStmts(this.children.slice(2), lvl) +'\n'+idt(lvl-1)+'}';
    },
    'Program': function Program_codegen (lvl) {
        return this.children.map(function(node){return node.blockgen(lvl+1)}).join('\n')+'\n';
    }
};

function binaryExprCodegen (lvl) {
    return this.children[0].toJS(lvl+1) +' '+ this.op +' '+ this.children[1].toJS(lvl+1);
}

// convenience function for generating a list of statements
function genStmts (nodes, lvl) {
    return nodes.map(function(node){return node.blockgen(lvl)}).join('\n'+idt(lvl));
}

// convenience function for generating code as a statement (default is expr)
function blockgen () { return this.stmtWrap(this.toJS.apply(this, arguments)); }

// Most statements end with a semicolon
function defaultStmtWrap (source) { return source+';'; }

// But some (like while-loop, if-then, etc) do not
function idWrap (source) { return source; }

// Wrap epressions in parens if they were in original source
function curryParenWrap (fun) { return function (lvl) { return this.parens ? '('+fun.call(this, lvl)+')' : fun.call(this, lvl); }; }

// Overwrite defaultStmtWrap for specific nodes
var wraps = {
    // objects must be wrapped with parens to disambiguate from blocks
    'ObjectExpression': function (source) { return defaultStmtWrap(this.parens ? source : '('+source+')'); },
    'BlockStatement': idWrap,
    'WhileStatement': idWrap,
    'WithStatement': idWrap,
    'ForStatement': idWrap,
    'ForInStatement': idWrap,
    'IfStatement': idWrap,
    'SwitchStatement': idWrap,
    'LabeledStatement': idWrap,
    'TryStatement': idWrap,
    // func-expr must be wrapped with parens to disambiguate from func-decl
    'FunctionExpression': function (source) { return defaultStmtWrap(this.parens ? source : '('+source+')'); },
    'FunctionDeclaration': idWrap,
    'Program': idWrap
};


// Extend the node prototypes to include code generation functions
exports.extend = function extend (protos) {
    var type;
    protos.base.stmtWrap = defaultStmtWrap;
    protos.base.blockgen = blockgen;
    for (type in codegens) {
        protos[type].toJS = curryParenWrap(codegens[type]);
        if (type in wraps) protos[type].stmtWrap = wraps[type];
    }
};


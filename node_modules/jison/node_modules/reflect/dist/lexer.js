// Basic RegExp Lexer
// MIT Licensed
// Zachary Carter <zach@carter.name>

exports.init = function (original) {
    var lexer = original; //Object.create(original);
    lexer.dynamicMatchers = 0;
    lexer.matcherStates = [];

    var setInput = original.setInput;
    lexer.setInput = function (input) {
        setInput.call(this, input);
        this.dynamicMatchers = this.dynamicMatchers||0;
        this.matcherStates = [];
    };

    lexer.addMatcher = function (regex, matchConds) {
        var self = this;
        this.matcherStates[this.dynamicMatchers] = matchConds;
        this.dynamicMatchers++;
        this.rules.unshift(regex);
        matchConds.forEach(function (cond) {
            self.conditions[cond].rules.unshift(-self.dynamicMatchers);
        });
    };

    lexer.removeMatcher = function (index) {
        if (index > this.dynamicMatchers) return;
        var r = this.rules.splice(this.dynamicMatchers-index-1,1);
        console.error('ind', index, this.dynamicMatchers);
        console.error(r);
        console.error(this.matcherStates);
        var self = this;
        this.matcherStates[index].forEach(function (state) {
            self.conditions[state].rules.splice(self.conditions[state].rules.indexOf(-(index+1)), 1);
        });
        this.matcherStates.splice(index,1);
        this.dynamicMatchers--;
    };

    lexer.dynamicAction = function (match, index) { },

    lexer.next = function () {
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
            tempMatch = this._input.match(this.rules[rules[i]+this.dynamicMatchers]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = rules[i]+this.dynamicMatchers;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/\n.*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.dynamicMatchers && index < this.dynamicMatchers ?
                this.dynamicAction(this.match, index) :
                this.performAction.call(this, this.yy, this, index-this.dynamicMatchers,this.conditionStack[this.conditionStack.length-1]);
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
    };

    return lexer;
};

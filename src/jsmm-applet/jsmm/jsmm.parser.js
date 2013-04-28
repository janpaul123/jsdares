/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.parser = require('./jsmmparser').parser;
	jsmm.parser.yy = {};
	jsmm.parser.yy.nodes = jsmm.nodes;

	// function used by the parser to throw errors
	// also used below by catching tokenizer errors
	jsmm.parser.yy.parseError = function(errStr, hash) {
		hash = hash || {};
		var token = hash.token || '';
		var expected = hash.expected || [];
		var loc = {
			line: jsmm.parser.lexer.yylloc.first_line || 1,
			column: jsmm.parser.lexer.yylloc.first_column
		};
		
		// if there are no newlines, give a range instead of a single position
		if (hash.text.match(/\n/) === null) {
			loc.column2 = loc.column + hash.text.length;
		}
		
		// entries are in the form "'FOR'", remove the extra quotes
		token = token.replace(/[']/g, "");
		for (var i=0; i<expected.length; i++) {
			expected[i] = expected[i].replace(/[']/g, "");
		}
		
		var makeNear = function(text, near) {
			text = text.substring(0, text.indexOf('\n'));
			if (text.replace(/\s*/, '').length > 0) {
				return (near || ' near ') + '<var>' + text + '</var>';
			} else {
				return '';
			}
		};
		
		var suggestionError = function(suggestion, an) {
			throw new jsmm.msg.CriticalError(loc, 'Invalid syntax encountered' + makeNear(hash.text) + ', perhaps there is ' + (an ? 'an' : 'a') +' <var>' + suggestion + '</var> missing', errStr);
		};

		if (token === 'RESERVED') {
			// special case: passing on the information that the word is reserved
			throw new jsmm.msg.CriticalError(loc, 'Unfortunately <var>' + hash.text + '</var> is a reserved word, which means you cannot use it as a variable name', errStr);
		} else if (token === 'INVALID') {
			// special cases: passing on information about the used symbol
			if (hash.text === "'") {
				throw new jsmm.msg.CriticalError(loc, 'Unfortunately <var>\'</var> cannot be used, please use <var>"</var> instead', errStr);
			} else if (['~', '&', '|', '<<', '>>', '>>=', '<<='].indexOf(hash.text) >= 0) {
				throw new jsmm.msg.CriticalError(loc, 'Unfortunately the bitwise operator <var>' + hash.text + '</var> cannot be used', errStr);
			} else if (['===', '!=='].indexOf(hash.text) >= 0) {
				throw new jsmm.msg.CriticalError(loc, 'Unfortunately the strict equality operator <var>' + hash.text + '</var> cannot be used', errStr);
			} else if (['?', ':', '\\'].indexOf(hash.text) >= 0) {
				throw new jsmm.msg.CriticalError(loc, 'Unfortunately the symbol <var>' + hash.text + '</var> cannot be used', errStr);
			} else if (hash.text === '$') {
				throw new jsmm.msg.CriticalError(loc, 'Unfortunately the symbol <var>$</var>, often used for the jQuery library, cannot be used', errStr);
			}
		} else if (token === '"') {
			throw new jsmm.msg.CriticalError(loc, 'This string has not been closed, please add another <var>"</var> on this line', errStr);
		} else if (hash.token === null) {
			// lexer error
			loc = {line: hash.line+1, column: 0};
			throw new jsmm.msg.CriticalError(loc, 'Invalid syntax encountered', errStr);
		} else if (expected.length === 1 && expected[0] === 'NEWLINE') {
			if (token === 'ELSE') {
				// two or more else branches gives this situation
				throw new jsmm.msg.CriticalError(loc, 'Invalid syntax encountered, perhaps the <var>else</var> branches are incorrect', errStr);
			} else if (token === 'IF') {
				// "else if" without the "else" gives this
				suggestionError('else', true);
			} else {
				throw new jsmm.msg.CriticalError(loc, 'Invalid syntax encountered, perhaps some code' + makeNear(hash.text) + ' should be put on a new line', errStr);
			}
		} else if (expected.length === 1) {
			// if only one thing can be expected, pass it on
			if (expected[0] === 'NAME') {
				expected[0] = 'variable name';
			}
			suggestionError(expected[0]);
		} else if (expected.indexOf(';') >= 0 && token === 'NEWLINE') {
			// ; expected before of newline is usually forgotten
			suggestionError(';');
		} else if (expected.indexOf('==') >= 0 && token === '=') {
			// ; expected before of newline is usually forgotten
			throw new jsmm.msg.CriticalError(loc, 'Invalid syntax encountered' + makeNear(hash.text) + ', perhaps it should be <var>==</var> instead', errStr);
		} else if (expected.indexOf('}') >= 0 && ['FUNCTION', 'ELSE', 'EOF'].indexOf(token) >= 0) {
			// } expected before function declaration, else, eof is usually forgotten
			suggestionError('}');
		} else if (expected.indexOf(')') >= 0 && ['{', ';', 'NEWLINE'].indexOf(token) >= 0) {
			// ) expected before { or ; is usually forgotten
			suggestionError(')');
		} else if (expected.indexOf('TRUE') >= 0 && token === '{') {
			// expression expected, but { given, usually someone tries to make an object
			throw new jsmm.msg.CriticalError(loc, 'You cannot use <var>{</var> here, only after <var>if</var>, <var>else</var>, <var>while</var>, <var>for</var>, and <var>function</var>', errStr);
		} else if (expected.indexOf('TRUE') >= 0 && token === 'FUNCTION') {
			// expression expected, but "FUNCTION" given, usually someone tries to make an inline function
			throw new jsmm.msg.CriticalError(loc, 'You cannot use <var>function</var> here, only on a separate line', errStr);
		} else {
			throw new jsmm.msg.CriticalError(loc, 'Invalid syntax encountered' + makeNear(hash.text), errStr);
		}
	};
};
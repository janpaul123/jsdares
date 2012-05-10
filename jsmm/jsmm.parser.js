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
			line: jsmm.parser.lexer.yylloc.first_line,
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
			if (text.replace(/\s*/, '').length > 0) {
				return (near || ' near ') + '<var>' + text + '</var>';
			} else {
				return '';
			}
		};
		
		//console.log(hash.text);
		var suggestionError = function(suggestion) {
			throw new jsmm.msg.Error(loc, 'Invalid syntax encountered' + makeNear(hash.text) + ', perhaps there is a <var>' + suggestion + '</var> missing', errStr);
		};
		
		if (token === "RESERVED") {
			// special case: passing on the information that the word is reserved
			throw new jsmm.msg.Error(loc, 'Unfortunately <var>' + hash.text + '</var> is a reserved word, which means you cannot use it as a variable name', errStr);
		} else if (hash.token === null) {
			// lexer error
			loc = {line: hash.line+1, column: 0};
			throw new jsmm.msg.Error(loc, 'Invalid syntax encountered', errStr);
		} else if (expected.length === 1 && expected[0] === 'NEWLINE') {
			throw new jsmm.msg.Error(loc, 'Invalid syntax encountered, perhaps some code' + makeNear(hash.text) + ' should be put on a new line.', errStr);
		} else if (expected.length === 1) {
			// if only one thing can be expected, pass it on
			if (expected[0] === 'NAME') {
				expected[0] = 'variable name';
			}
			suggestionError(expected[0]);
		} else if (expected.indexOf(";") >= 0 && token === "NEWLINE") {
			// ; expected before of newline is usually forgotten
			suggestionError(';');
		} else if (expected.indexOf("}") >= 0 && ["FUNCTION", "EOF"].indexOf(token) >= 0) {
			// } expected before function declaration or eof is usually forgotten
			suggestionError('}');
		} else if (expected.indexOf(")") >= 0 && ["{", ";", "NEWLINE"].indexOf(token) >= 0) {
			// ) expected before { or ; is usually forgotten
			suggestionError(')');
		} else {
			throw new jsmm.msg.Error(loc, 'Invalid syntax encountered' + makeNear(hash.text), errStr);
		}
	};
};
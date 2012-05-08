/*jshint node:true*/
"use strict";

var jsmm = require('./jsmm');
var fs = require('fs');

fs.readFile('test.txt', function(err, data){
	var tree = new jsmm.Tree(data);
	if (tree.hasError()) {
		console.log(tree.getError());
	} else {
		console.log(tree.programNode.getRunCode());
		var func = tree.programNode.getRunFunction({ console: {
					log: {
						name: 'log',
						augmented: 'function',
						example: 'log("Hi")',
						func: function(context, name, args) {
							return console.log(args[0] || '');
						}
					}
				}});
		func();
	}
	/*
	var browser = new jsmm.Browser();
	browser.setCode(data);
	browser.setScope({console: console});
	if (!browser.runAll()) {
		console.log(browser.getError());
	}
	*/
});

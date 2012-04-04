/*jshint node:true*/
"use strict";

var jsmm = require('./jsmm');
var fs = require('fs');

fs.readFile('test.txt', function(err,data){
	var browser = new jsmm.Browser();
	browser.setCode(data);
	if (browser.getDot() === undefined) {
		console.log(browser.getError());
	} else {
		console.log(browser.getDot());
	}
});
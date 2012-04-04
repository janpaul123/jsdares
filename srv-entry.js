/*jshint node:true*/
"use strict";

var jsmm = require('./jsmm');
var fs = require('fs');

fs.readFile('test.txt', function(err,data){
	var browser = new jsmm.Browser();
	browser.setCode(data);
	browser.setScope({console: console});
	if (!browser.runAll()) {
		console.log(browser.getError());
	}
});

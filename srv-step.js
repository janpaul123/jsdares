var jsmm = require('./jsmm');
var fs = require('fs');

fs.readFile('test.txt', function(err,data){
	var browser = new jsmm.Browser();
	browser.setCode(data);
	browser.setScope({console: console});
	
	browser.stepInit();
	
	var step;
	do {
		step = browser.stepNext();
		console.log(step);
	} while(step !== undefined);
	
	if (browser.hasError()) {
		console.log(browser.getError());
	}
});
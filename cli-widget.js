/*jshint node:true jquery:true*/
"use strict";

$(function() {
	var applet = require('jsmm-applet');
	window.applet = applet;

	var $main = $('<div id="main"></div>');
	$('body').append($main);

	var ui = new applet.UI($main);
	window.ui = ui;

	var stressTime = function(n, f) {
		var start = (new Date()).getTime();
		for (var i=0; i<n; i++) {
			f();
		}
		return ((new Date()).getTime() - start)/n;
	};

	var log = function(text) {
		console.log(text);
	};

	var clear = function() {

	};

	var tree, func;
	
	//$('#extra-stress').click(function(e) {
	window.stress = function() {
		clear();
		var parseAvg = stressTime(200, function() { tree = new window.ui.editor.language.Tree(window.ui.editor.code.text); });
		var parseGenAvg = stressTime(200, function() { func = window.ui.editor.tree.programNode.getRunFunction(); });
		var runAvg = stressTime(200, function() { window.ui.editor.run(); });
		clear();
		log('Program average parse time: ' + parseAvg + 'ms (out of 200 trials)');
		log('Program average code generation time: ' + parseGenAvg + 'ms (out of 200 trials)');
		log('Program average run time: ' + runAvg + 'ms (out of 200 trials)');
		log('');
		log('Note: the Javascript time function is not completely reliable...');
	};
});
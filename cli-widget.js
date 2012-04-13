/*jshint node:true jquery:true*/
"use strict";

$(function() {
	var jsmm = require('./jsmm');
	var editor = require('./basiceditor');
	var cs = require('./console');

	if (window.localStorage.getItem('1') === null) {
		window.localStorage.setItem('1', '// Some example code\nfunction cube(n) {\n  return n*n*n;\n}\n\nfor (var i=0; i<10; i++) {\n  var output = cube(i);\n  console.log(i + ": " + output);\n}\n');
	}

	var ui = {
		editablesEnabled: function() {
			$('#edit').addClass('active');
		},
		editablesDisabled: function() {
			$('#edit').removeClass('active');
		},
		highlightingEnabled: function() {
			$('#highlight').addClass('active');
		},
		highLightingDisabled: function() {
			$('#highlight').removeClass('active');
		},
		criticalError: function() {
			$('#step').addClass('disabled');
			$('#step-back').addClass('disabled');
			$('#refresh').addClass('disabled');
			$('#edit').addClass('disabled');
			$('#highlight').addClass('disabled');
		},
		runningWithoutError: function() {
			$('#step').removeClass('disabled');
			$('#step-back').addClass('disabled');
			$('#refresh').addClass('disabled');
			$('#edit').removeClass('disabled');
			$('#highlight').removeClass('disabled');
		},
		runningWithError: function() {
			$('#step').removeClass('disabled');
			$('#step-back').addClass('disabled');
			$('#refresh').addClass('disabled');
			$('#edit').removeClass('disabled');
			$('#highlight').removeClass('disabled');
		},
		steppingWithoutError: function() {
			$('#step').removeClass('disabled');
			$('#step-back').removeClass('disabled');
			$('#refresh').removeClass('disabled');
			$('#edit').removeClass('disabled');
			$('#highlight').removeClass('disabled');
		},
		steppingWithError: function() {
			$('#step').addClass('disabled');
			$('#step-back').removeClass('disabled');
			$('#refresh').removeClass('disabled');
			$('#edit').removeClass('disabled');
			$('#highlight').removeClass('disabled');
		}
	};

	var ed = new editor.Editor(jsmm, $('#editor'), ui);
	var myConsole = new cs.Console($('#console'), ed);
	ed.setScope({console: myConsole.getAugmentedObject()});
	
	var realConsole = {
		log: function(text) {
			if (console && console.log) {
				console.log(text);
				return true;
			} else {
				return false;
			}
		}
	};

	var clear = function() {
		myConsole.clear();
		//myCanvas.clear();
	};

	$('#highlight').tooltip({title: '<strong>ctrl</strong> / <strong>&#8984;</strong>', placement: 'bottom', trigger: 'manual'});
	$('#edit').tooltip({title: '<strong>alt</strong> / <strong>&#8997;</strong>', placement: 'bottom', trigger: 'manual'});

	$('#step').click($.proxy(ed.stepForward, ed));
	$('#step-back').click($.proxy(ed.stepBackward, ed));
	$('#refresh').click($.proxy(ed.restart, ed));
	$('#highlight').click(function(event) {
		$('#highlight').tooltip('toggle');
		if ($('#highlight').hasClass('active')) ed.disableHighlighting();
		else ed.enableHighlighting();
	});
	$('#edit').click(function(event) {
		$('#edit').tooltip('toggle');
		if ($('#edit').hasClass('active')) ed.disableEditables();
		else ed.enableEditables();
	});

	$('#console-button').click(function(e) {
		$('#canvas').hide();
		$('#console').show();
	});

	$(document).on('keydown', function(event) {
		// 17 == CTRL, 18 == ALT, (17, 91, 224) == COMMAND
		if ([17, 91, 224].indexOf(event.keyCode) >= 0) {
			$('#highlight').tooltip('hide');
			ed.enableHighlighting();
		} else if (event.keyCode === 18) {
			$('#edit').tooltip('hide');
			ed.enableEditables();
		}
	});

	$(document).on('keyup', function(event) {
		// 17 == CTRL, 18 == ALT, (17, 91, 224) == COMMAND
		if ([17, 91, 224].indexOf(event.keyCode) >= 0) {
			$('#highlight').tooltip('hide');
			ed.disableHighlighting();
		} else if (event.keyCode === 18) {
			$('#edit').tooltip('hide');
			ed.disableEditables();
		}
	});

	ed.setText(window.localStorage.getItem('1'));

	/*
	$('#canvas-button').click(function(e) {
		$('#canvas').show();
		$('#console').hide();
	});
*/
	
	/*
	$('#console-log').click(function(e) {
		run();
		var offset = $('#code')[0].selectionStart;
		var code = browser.getCode();
		$('#code').val(code.insertAtOffset(offset, 'console.log("Hi!");'));
		$('#code')[0].selectionStart = offset + 12;
		$('#code')[0].selectionEnd = $('#code')[0].selectionStart + 5;
		run();
	});
	
	$('#console-clear').click(function(e) {
		run();
		var offset = $('#code')[0].selectionStart;
		var code = browser.getCode();
		$('#code').val(code.insertAtOffset(offset, 'console.clear();'));
		$('#code')[0].selectionStart = offset + 16;
		$('#code')[0].selectionEnd = $('#code')[0].selectionStart;
		run();
	});
	
	$('#console-example').click(function(e) {
		$('#code').val($('#code').val() + '\n// Some example code\nfunction cube(n) {\n  return n*n*n;\n}\n\nfor (var i=0; i<10; i++) {\n  var output = cube(i);\n  console.log(i + ": " + output);\n}\n');
		run();
	});
	
	$('#extra-compile').click(function(e) {
		clear();
		myConsole.log(browser.getRawCode());
	});
	
	$('#extra-safe').click(function(e) {
		clear();
		myConsole.log(browser.getSafeCode());
	});
	
	$('#extra-tree').click(function(e) {
		clear();
		window.open('https://chart.googleapis.com/chart?cht=gv&chl=' + encodeURIComponent(browser.getDot()));
		myConsole.log('"dot" string (renderable with Graphviz):\n');
		myConsole.log(browser.getDot());
	});
	
	$('#extra-elements').click(function(e) {
		clear();
		
		//myConsole.log('There may be multiple instances of the same element due to parser behaviour. (??)\n');
		
		for (var i=0; i<browser.context.elements.length; i++) {
			var element = browser.context.elements[i];
			myConsole.log(element.type + ' @ line ' + element.startPos.line + ', column ' + element.startPos.column);
		}
		
		if (realConsole.log(browser.context)) {
			myConsole.log('\nNote: full context has also been printed to browser console.');
		}
	});
	
	$('#extra-tests').click(function(e) {
		clear();
		jsmm.test.runAll();
		myConsole.log(jsmm.test.output);
	});
	
	var stressTime = function(n, f) {
		var start = (new Date()).getTime();
		for (var i=0; i<n; i++) {
			f();
		}
		return ((new Date()).getTime() - start)/n;
	};
	
	$('#extra-stress').click(function(e) {
		var parseAvg = stressTime(200, function() { browser.reset(); browser.parse(); });
		var parseGenAvg = stressTime(200, function() { browser.reset(); browser.makeSafeFunc(); });
		var runAvg = stressTime(200, function() { browser.runSafe(); });
		clear();
		myConsole.log('Program average parse time: ' + parseAvg + 'ms (out of 200 trials)');
		myConsole.log('Program average parse + code generation time: ' + parseGenAvg + 'ms (out of 200 trials)');
		myConsole.log('Program average run time: ' + runAvg + 'ms (out of 200 trials)');
		myConsole.log();
		myConsole.log('Note: the Javascript time function is not completely reliable...');
	});
	
	$('#extra-scope').click(function(e) {
		clear();
		if (!browser.isStepping()) {
			myConsole.log('Not stepping...');
			return;
		}
		
		myConsole.log(JSON.stringify(browser.stack.getLastStackElement().scope, function(key, value) {
			if (typeof value === 'function') {
				return '[Function]';
			} else {
				return value;
			}
		}, 2));
		
		if (realConsole.log(browser.stack.getLastStackElement().scope)) {
			myConsole.log('\nNote: scope has also been printed to browser console.');
		}
	});
	
	$('#extra-stack').click(function(e) {
		clear();
		if (!browser.isStepping()) {
			myConsole.log('Not stepping...');
			return;
		}
		
		for (var i=0; i<browser.stack.elements.length; i++) {
			var element = browser.stack.elements[i].element;
			myConsole.log(element.type + ' @ line ' + element.startPos.line);
		}
		
		if (realConsole.log(browser.stack)) {
			myConsole.log('\nNote: full stack has also been printed to browser console.');
		}
	});
	
	$('#extra-error').click(function(e) {
		clear();
		myConsole.log(JSON.stringify(browser.getError(), null, 2));
		
		if (realConsole.log(browser.getError())) {
			myConsole.log('\nNote: error has also been printed to browser console.');
		}
	});

	$('#edit').click(function(e) {
		editor.enableEditables();
	});

	$('#highlight').click(function(e) {
		editor.browser = browser;
		editor.console = myConsole;
		editor.enableHighlight();
	});
	
	$('#about').click(function(e) {
		clear();
		myConsole.log('This is a tool to become a good programmer. The primary objective is to teach programming in an engaging way. It can also give current programmers insights in what it is they are doing.');
		myConsole.log();
		myConsole.log('The programming language you program in is js--, a subset of Javascript. A lot of things allowed in Javascript are not allowed here, yet it is still quite an expressive language. The intention is to stimulate learning by giving meaningful error messages and sensible operations.');
		myConsole.log();
		myConsole.log('Most of the interface ideas presented in this and feature prototypes are stolen from Bret Victor. I share his belief that direct interaction and abstraction are very powerful concepts, both in programming and other fields. We should program and teach programming this way.');
		myConsole.log();
		myConsole.log('This is a first step, mostly to test the compiler, and verify that something like this is possible in the browser. Next on the roadmap are:');
		myConsole.log('* drawing on canvas');
		myConsole.log('* autocompletion');
		myConsole.log('* interactive programs (event handling, time-based)');
		myConsole.log('* direct value manipulation');
		myConsole.log('* up on the ladder of abstraction!');
		myConsole.log();
		myConsole.log('If you have any ideas, complaints, or suggestions about this prototype or its wider context, do not hesitate to mail me at me@janpaulposma.nl.');
	});
	*/

	/*
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var myCanvas = {
		clear: function() {
			//$('#canvas').width($('#canvas').width());
			context.clearRect(0, 0, canvas.width, canvas.height);
			context = canvas.getContext('2d');
			context.beginPath();
			context.strokeStyle = "#00dd00";
			context.fillStyle = "rgba(50, 250, 50, 0.4)";
		},
		arc: function() {
			context.arc.apply(context, arguments);
		},
		beginPath: function() {
			context.beginPath.apply(context, arguments);
		},
		closePath: function() {
			context.closePath.apply(context, arguments);
		},
		fill: function() {
			context.fill.apply(context, arguments);
		},
		stroke: function() {
			context.stroke.apply(context, arguments);
		},
		clip: function() {
			context.clip.apply(context, arguments);
		},
		moveTo: function() {
			context.moveTo.apply(context, arguments);
		},
		lineTo: function() {
			context.lineTo.apply(context, arguments);
		},
		arcTo: function() {
			context.arcTo.apply(context, arguments);
		},
		bezierCurveTo: function() {
			context.bezierCurveTo.apply(context, arguments);
		},
		quadraticCurveTo: function() {
			context.quadraticCurveTo.apply(context, arguments);
		},
		rect: function() {
			context.rect.apply(context, arguments);
		}
	};
	*/
});
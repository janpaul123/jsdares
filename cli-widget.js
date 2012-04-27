/*jshint node:true jquery:true*/
"use strict";

$(function() {
	var output = require('./output');

	var ui = new output.UI();
	window.ui = ui;
	
	/*
	var jsmm = require('./jsmm');
	var editor = require('./editor');
	var output = require('./output');

	if (window.localStorage.getItem('program-3') === null) {
		window.localStorage.setItem('program-3', "/// EXAMPLE CONSOLE PROGRAM ///\nconsole.setColor(\"#64e9e1\");\nconsole.log(\"Colourful multiplication table:\");\nconsole.log(\"\");\nvar width=9;\n\nfunction printLine(x) {\n  var line = \"\";\n  for (var i=1; i<=width; i++) {\n    var number = i*x;\n    line += number + \"\\t\";\n  }\n  console.log(line);\n}\n\nfor (var i=1; i<=30; i++) {\n  console.setColor(\"hsl(\" + i*11 + \", 100%, 50%)\");\n  printLine(i);\n}\n\n/// EXAMPLE CANVAS PROGRAM ///\nvar context = canvas.getContext(\"2d\");\nfor (var i=0; i<22; i++) {\n  context.fillStyle = \"hsla(\" + (i*17) + \", 80%, 50%, 0.8)\";\n  context.fillRect(10+i*19.7, 254+i*-52.3+i*i*3.3, 50, 50);\n}\n\ncontext.strokeStyle = \"#a526a5\";\ncontext.font = \"32pt Calibri\";\ncontext.lineWidth = 2;\ncontext.strokeText(\"Hello World!\", 73, 399);\n\n/// EXAMPLE ROBOT PROGRAM ///\nwhile(!robot.detectGoal()) {\n  robot.turnLeft();\n  while (robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive();\n}");
	}

	if (window.localStorage.getItem('robot-3') === null) {
		window.localStorage.setItem('robot-3', "{\"columns\":8,\"rows\":8,\"initialX\":3,\"initialY\":7,\"initialAngle\":90,\"mazeObjects\":49,\"verticalActive\":[[false,false,false,false,false,false,false,false],[false,false,false,false,true,true,false,false],[false,false,true,true,false,false,false,false],[false,true,true,false,false,true,false,true],[false,false,false,false,true,false,false,false],[false,true,false,false,true,true,true,false],[false,false,false,true,false,true,true,false],[false,true,true,true,true,true,true,true]],\"horizontalActive\":[[false,true,false,true,false,false,false,false],[false,true,true,false,true,false,true,true],[false,true,false,true,true,true,false,true],[false,true,false,false,true,false,true,false],[false,false,true,true,false,false,true,true],[false,true,true,true,true,false,false,true],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],\"blockGoal\":[[true,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]]}");
	}

	var highlightingKey = false, editablesKey = false;

	var ui = {
		editablesEnabled: function() {
			$('#edit').addClass('active');
		},
		editablesDisabled: function() {
			$('#edit').removeClass('active');
			editablesKey = false;
			refreshCheckKeys();
		},
		highlightingEnabled: function() {
			$('#highlight').addClass('active');
		},
		highLightingDisabled: function() {
			$('#highlight').removeClass('active');
			highlightingKey = false;
			refreshCheckKeys();
		},
		previewing: function() {
			$('#step').addClass('disabled');
			$('#step-back').addClass('disabled');
			$('#refresh').addClass('disabled');
			$('#edit').addClass('disabled');
			$('#highlight').addClass('disabled');
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
		},
		textChanged: function(code) {
			window.localStorage.setItem('program-3', code.text);
		}
	};

	var ed = new editor.Editor(jsmm, $('#editor'), ui, window.localStorage.getItem('program-3'));
	window.ed = ed;
	var myConsole = new output.Console($('#console'), ed);
	var canvas = new output.Canvas($('#canvas'), ed);
	var robot = new output.Robot($('#robot'), ed, 8, 8);
	window.robot = robot;

	if (window.localStorage.getItem('robot-3') !== null) {
		robot.setState(JSON.parse(window.localStorage.getItem('robot-3')));
	}

	robot.setStateChangedCallback(function(state) {
		window.localStorage.setItem('robot-3', JSON.stringify(state));
	});

	var scope = {
		console: myConsole.getAugmentedObject(),
		canvas: canvas.getAugmentedObject(),
		robot: robot.getAugmentedObject()
	};

	ed.setScope(scope);
	
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

	var runner = new jsmm.SimpleRunner('', scope);

	var clear = function() {
		myConsole.clear();
		//myCanvas.clear();
		runner.setText(ed.getText());
		$('#refresh').removeClass('disabled');
	};

	var log = function(text) {
		myConsole.log(null, 'log', [text]);
	};

	var isMac = navigator.platform.indexOf("Mac") >= 0;
	$('#highlight').tooltip({title: '<strong>ctrl</strong>' + (isMac ? ' or <strong>cmd</strong> (&#8984;)' : ''), placement: 'bottom'});
	$('#edit').tooltip({title: '<strong>alt</strong>' + (isMac ? ' (&#8997;)' : ''), placement: 'bottom'});

	$('#step').click($.proxy(ed.stepForward, ed));
	$('#step-back').click($.proxy(ed.stepBackward, ed));
	$('#refresh').click($.proxy(ed.restart, ed));
	$('#highlight').click(function(event) {
		if ($('#highlight').hasClass('active')) ed.disableHighlighting();
		else ed.enableHighlighting();
	});
	$('#edit').click(function(event) {
		if ($('#edit').hasClass('active')) ed.disableEditables();
		else ed.enableEditables();
	});

	$('#console-button').click(function(e) {
		$('#canvas').hide();
		$('#console').show();
	});


	var checkKeys = function(event) {
		if (highlightingKey && !(event.ctrlKey || event.metaKey)) {
			ed.disableHighlighting();
		}
		if (editablesKey && !event.altKey) {
			ed.disableEditables();
		}
	};

	var refreshCheckKeys = function() {
		if (highlightingKey || editablesKey) {
			$(document).on('mousemove', checkKeys);
		} else {
			$(document).off('mousemove', checkKeys);
		}
	};

	$(document).on('keydown', function(event) {
		// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
		if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
			ed.enableHighlighting();
			highlightingKey = true;
			refreshCheckKeys();
		} else if (event.keyCode === 18) {
			ed.enableEditables();
			editablesKey = true;
			refreshCheckKeys();
		}
	});

	$(document).on('keyup', function(event) {
		// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
		if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
			ed.disableHighlighting();
		} else if (event.keyCode === 18) {
			ed.disableEditables();
		}
	});

	$('#robot-link').click(function() {
		setTimeout(function() {
			robot.makeActive();
		}, 0);
	});

	$('#dare-select').modal({
		show: false
	});

	$('#select-dare').click(function() {
		$('#dare-select').modal('show');
	});
	*/

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
		var code = runner.getCode();
		$('#code').val(code.insertAtOffset(offset, 'console.log("Hi!");'));
		$('#code')[0].selectionStart = offset + 12;
		$('#code')[0].selectionEnd = $('#code')[0].selectionStart + 5;
		run();
	});
	
	$('#console-clear').click(function(e) {
		run();
		var offset = $('#code')[0].selectionStart;
		var code = runner.getCode();
		$('#code').val(code.insertAtOffset(offset, 'console.clear();'));
		$('#code')[0].selectionStart = offset + 16;
		$('#code')[0].selectionEnd = $('#code')[0].selectionStart;
		run();
	});
	
	$('#console-example').click(function(e) {
		$('#code').val($('#code').val() + '\n// Some example code\nfunction cube(n) {\n  return n*n*n;\n}\n\nfor (var i=0; i<10; i++) {\n  var output = cube(i);\n  console.log(i + ": " + output);\n}\n');
		run();
	});
*/
	
	/*
	$('#extra-compile').click(function(e) {
		clear();
		log(runner.getRawCode());
	});
	
	$('#extra-safe').click(function(e) {
		clear();
		log(runner.getSafeCode());
	});
	
	$('#extra-tree').click(function(e) {
		clear();
		window.open('https://chart.googleapis.com/chart?cht=gv&chl=' + encodeURIComponent(runner.getDot()));
		log('"dot" string (renderable with Graphviz):\n');
		log(runner.getDot());
	});

	$('#extra-canvas-mirror').click(function(e) {
		clear();
		$('#canvas').addClass('canvas-show-mirror');
		log('The canvas mirror is used to map canvas x-y coordinates back to lines of code. With the console this is easy, as DOM elements can be given jQuery data attributes. Canvas pixels, however, can be drawn using complex functions such as splines. As such, the mirror mimics every action of the real canvas, but the three colour channels are used for encoding call information. This way the corresponding line in the code can be highlighted, and all corresponding pixels in the image can be highlighted as well. Note that the specific call, and not only the line of code, is stored, so that only the pixels of that specific call are highlighted.');
	});
	
	$('#extra-nodes').click(function(e) {
		clear();
		runner.parse();
		
		for (var i=0; i<runner.tree.nodes.length; i++) {
			var node = runner.tree.nodes[i];
			log(node.type + ' @ line ' + node.lineLoc.line + ', column ' + node.lineLoc.column);
		}
		
		if (realConsole.log(runner.tree)) {
			log('\nNote: full tree has also been printed to browser console.');
		}
	});
	
	$('#extra-tests').click(function(e) {
		clear();
		jsmm.test.runAll();
		log(jsmm.test.output);
	});
	
	var stressTime = function(n, f) {
		var start = (new Date()).getTime();
		for (var i=0; i<n; i++) {
			f();
		}
		return ((new Date()).getTime() - start)/n;
	};
	
	$('#extra-stress').click(function(e) {
		clear();
		var parseAvg = stressTime(200, function() { runner.reset(); runner.parse(); });
		var parseGenAvg = stressTime(200, function() { runner.reset(); runner.makeSafeFunc(); });
		var runAvg = stressTime(200, function() { runner.runSafe(); });
		clear();
		log('Program average parse time: ' + parseAvg + 'ms (out of 200 trials)');
		log('Program average parse + code generation time: ' + parseGenAvg + 'ms (out of 200 trials)');
		log('Program average run time: ' + runAvg + 'ms (out of 200 trials)');
		log('');
		log('Note: the Javascript time function is not completely reliable...');
	});
	*/
	
	/*
	$('#extra-scope').click(function(e) {
		clear();
		if (!runner.isStepping()) {
			log('Not stepping...');
			return;
		}
		
		log(JSON.stringify(runner.stack.getLastStackElement().scope, function(key, value) {
			if (typeof value === 'function') {
				return '[Function]';
			} else {
				return value;
			}
		}, 2));
		
		if (realConsole.log(runner.stack.getLastStackElement().scope)) {
			log('\nNote: scope has also been printed to browser console.');
		}
	});
	
	$('#extra-stack').click(function(e) {
		clear();
		if (!runner.isStepping()) {
			log('Not stepping...');
			return;
		}
		
		for (var i=0; i<runner.stack.elements.length; i++) {
			var element = runner.stack.elements[i].element;
			log(element.type + ' @ line ' + element.startPos.line);
		}
		
		if (realConsole.log(runner.stack)) {
			log('\nNote: full stack has also been printed to browser console.');
		}
	});
	
	$('#extra-error').click(function(e) {
		clear();
		log(JSON.stringify(runner.getError(), null, 2));
		
		if (realConsole.log(runner.getError())) {
			log('\nNote: error has also been printed to browser console.');
		}
	});
	
	$('#about').click(function(e) {
		clear();
		log('This is a tool to become a good programmer. The primary objective is to teach programming in an engaging way. It can also give current programmers insights in what it is they are doing.');
		log();
		log('The programming language you program in is js--, a subset of Javascript. A lot of things allowed in Javascript are not allowed here, yet it is still quite an expressive language. The intention is to stimulate learning by giving meaningful error messages and sensible operations.');
		log();
		log('Most of the interface ideas presented in this and feature prototypes are stolen from Bret Victor. I share his belief that direct interaction and abstraction are very powerful concepts, both in programming and other fields. We should program and teach programming this way.');
		log();
		log('This is a first step, mostly to test the compiler, and verify that something like this is possible in the runner. Next on the roadmap are:');
		log('* drawing on canvas');
		log('* autocompletion');
		log('* interactive programs (event handling, time-based)');
		log('* direct value manipulation');
		log('* up on the ladder of abstraction!');
		log();
		log('If you have any ideas, complaints, or suggestions about this prototype or its wider context, do not hesitate to mail me at me@janpaulposma.nl.');
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
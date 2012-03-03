var jsmm = require('./jsmm');

$(function() {
	if (window.localStorage.getItem('1') === null) {
		window.localStorage.setItem('1', '// Some example code\nfunction cube(n) {\n  return n*n*n;\n}\n\nfor (var i=0; i<10; i++) {\n  var output = cube(i);\n  console.log(i + ": " + output);\n}\n');
	}
	
	$('#code').val(window.localStorage.getItem('1'));
	
	var myConsole = {
		log: function(text) {
			$('#console').val($('#console').val() + text + '\n');
		},
		lineLog: function(text) {
			$('#console').val($('#console').val() + text);
		},
		clear: function() {
			$('#console').val('');
		}
	};
	
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
	
	var browser = new jsmm.Browser();
	
	var getPosition = function(text) {
		// add a space because of a bug when text contains only newlines
		text += ' ';
		$('#mirror').text(text);
		$('#mirror').text(text);
		return {x: $('#mirror').outerWidth(), y: $('#mirror').outerHeight()};
	};
	
	var drawMessage = function(msg) {
		var startPos = getPosition(browser.getCode().lineColumnToPositionText(msg.line, msg.column));
		var endPos = null;
		if (msg.column2 > msg.column) endPos = getPosition(browser.getCode().lineColumnToPositionText(msg.line, msg.column2));
		
		// the offset is weird since .position().top changes when scrolling
		offset = {
			x: ($('#code').position().left + $('#editor').scrollLeft()),
			y: ($('#code').position().top + $('#editor').scrollTop())
		};
		
		if (msg instanceof jsmm.msg.Line) {
			var message = msg.message;
			
			var lineMsg = $('#lineMsg-' + msg.line);
			if (lineMsg.length <= 0) {
				lineMsg = $('<div class="lineMsg"></div>');
				lineMsg.attr('id', 'lineMsg-' + msg.line);
				$('#margin').append(lineMsg);
				lineMsg.fadeIn(100);
				lineMsg.css('top', startPos.y + offset.y);
			} else {
				if (lineMsg.text().length > 0 && msg.append) {
					message = lineMsg.text() + ', ' + msg.message;
				}
			}
			lineMsg.text(message);
		} else {
			$('#messagebox').css('left', startPos.x + offset.x);
			$('#messagebox').css('top', startPos.y + offset.y);
			$('#message').html(msg.html);
			
			$('#marking').css('left', startPos.x + offset.x);
			$('#marking').css('top', startPos.y + offset.y);
			if (endPos !== null) {
				$('#marking').width(endPos.x - startPos.x);
				// height is constant, set in css;
			} else {
				$('#marking').width(0);
			}
			
			if (msg instanceof jsmm.msg.Error){
				$('#error').css('top', startPos.y + offset.y);
				$('#error').fadeIn(100);
				$('#arrow').fadeOut(100);
				$('#code').addClass('error');
				$('#code').removeClass('stepping');
			} else {
				$('#arrow').css('top', startPos.y + offset.y);
				$('#arrow').fadeIn(100);
				$('#error').fadeOut(100);
				$('#marking').fadeIn(100);
				$('#messagebox').fadeIn(100);
				$('#code').removeClass('error');
			}
		}
	};
	
	var hideMessage = function() {
		$('#messagebox').fadeOut(100);
		$('#error').fadeOut(100);
		$('#arrow').fadeOut(100);
		$('#marking').fadeOut(100);
		$('#code').removeClass('error');
		$('#code').removeClass('stepping');
	};
	
	var updateSize = function() {
		// NOTE: getPosition is not necessarily suitable for this
		$('#code').height(getPosition($('#code').val()).y + 100);
		$('#code').width(getPosition($('#code').val()).x + 100);
	};
	
	var clear = function() {
		myConsole.clear();
		$('#margin .lineMsg').fadeOut(100, function() {
			$(this).remove();
		});
	};
	
	var run = function() {
		clear()
		browser.setText($('#code').val());
		browser.setScope({console: myConsole});
		browser.runSafe();
		
		if (browser.hasError()) {
			drawMessage(browser.getError());
		} else {
			hideMessage();
		}
	};
	
	var step = function() {
		if (browser.hasError()) return;
		
		if (!browser.isStepping()) {
			clear();
			hideMessage();
			browser.stepInit();
			$('#code').addClass('stepping');
		} else {						
			var msgs = browser.stepNext();
			if (browser.hasError()) {
				drawMessage(browser.getError());
			} else if (msgs === undefined) {
				hideMessage();
			} else {
				for (var i=0; i<msgs.length; i++) {
					drawMessage(msgs[i]);
				}
			}
		}
	};
	
	// TODO: use http://archive.plugins.jquery.com/project/fieldselection
	var autoindent = function(e) {
		// 13 = enter, 221 = ] or }
		if (e.keyCode === 13 || e.keyCode === 221) {
			var code = browser.getCode();
			var offset = $('#code')[0].selectionStart;
			var pos = code.offsetToPos(offset);
			if (pos.line > 1) {
				var prevLine = code.getLine(pos.line-1);
				var curLine = code.getLine(pos.line);
				var spaces = prevLine.match(/^ */)[0].length;
				var spacesAlready = curLine.match(/^ */)[0].length;
				spaces += prevLine.match(/{ *$/) !== null ? 2 : 0;
				spaces -= spacesAlready;
				spaces -= curLine.match(/^ *}/) !== null ? 2 : 0;
				if (spaces > 0) {
					startOffset = code.lineColumnToOffset(pos.line, 0);
					$('#code').val(code.insertAtOffset(startOffset, new Array(spaces+1).join(' ')));
					$('#code')[0].selectionStart = offset + spaces;
					$('#code')[0].selectionEnd = $('#code')[0].selectionStart;
				} else if (spaces < 0 && spacesAlready >= -spaces) {
					startOffset = code.lineColumnToOffset(pos.line, 0);
					endOffset = startOffset-spaces;
				    $('#code').val(code.removeAtOffsetRange(startOffset, endOffset));
				    $('#code')[0].selectionStart = offset + spaces;
					$('#code')[0].selectionEnd = $('#code')[0].selectionStart;
				}
			}
		}
	};
	
	$('#step').click(step);
	$('#code').bind('keydown', updateSize);
	$('#code').bind('keyup paste', function(e) {
		window.localStorage.removeItem('1');
		window.localStorage.setItem('1', $('#code').val());
		updateSize();
		run();
		autoindent(e);
	});
	
	$('#error, #arrow').click(function(e) {
		$('#marking').fadeToggle(100);
		$('#messagebox').fadeToggle(100);
	});
	
	$('#messagebox, #marking').click(function(e) {
		$('#marking').fadeOut(100);
		$('#messagebox').fadeOut(100);
	});
	
	$('#console-log').click(function(e) {
		run();
		var offset = $('#code')[0].selectionStart;
		var code = browser.getCode();
		$('#code').val(code.insertAtOffset(offset, 'console.log("Hi!");'));
		$('#code')[0].selectionStart = offset + 12;
		$('#code')[0].selectionEnd = $('#code')[0].selectionStart + 5;
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
		
		myConsole.log('There may be multiple instances of the same element due to parser behaviour.\n');
		
		for (var i=0; i<browser.context.elements.length; i++) {
			var element = browser.context.elements[i];
			myConsole.log(element.type + ' @ line ' + element.startPos.line);
		}
		
		if (realConsole.log(browser.context)) {
			myConsole.log('\nNote: full context has also been printed to browser console.');
		}
	});
	
	$('#extra-tests').click(function(e) {
		clear();
		myConsole.log(jsmm.test.runAll());
	});
	
	var stressTime = function(n, f) {
		var start = (new Date).getTime();
		for (var i=0; i<n; i++) {
			f();
		}
		return ((new Date).getTime() - start)/n;
	};
	
	$('#extra-stress').click(function(e) {
		var parseAvg = stressTime(200, function() { browser.reset(); browser.parse(); });
		var parseGenAvg = stressTime(200, function() { browser.reset(); browser.makeSafeFunc(); });
		var runAvg = stressTime(200, function() { browser.runSafe(); });
		clear();
		myConsole.log('Program average parse time: ' + parseAvg + 'ms (out of 200 trials)');
		myConsole.log('Program average parse + code generation time: ' + parseGenAvg + 'ms (out of 200 trials)');
		myConsole.log('Program average run time: ' + runAvg + 'ms (out of 200 trials)');
		myConsole.log('');
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
	
	updateSize();
	run();
});
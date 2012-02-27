var jsmm = require('./jsmm');
var $ = require('br-jquery');

$(function() {
	$('#code').val(window.localStorage.getItem('1'));
	
	var myConsole = {
		log: function(text) {
			$('#console').val($('#console').val() + text + '\n');
		},
		clear: function() {
			$('#console').val('');
		}
	};
	
	var browser = new jsmm.Browser();
	
	var getPosition = function(text) {
		var textareaWidth = $('#code').outerWidth();
		$('#mirror').text(text);
		return {x: $('#mirror').outerWidth(), y: $('#mirror').outerHeight()};
	};
	
	var drawMessage = function(msg) {
		var startPos = getPosition(browser.formatForPosition(msg.line, msg.column));
		var endPos = null;
		if (msg.column2 > msg.column) endPos = getPosition(browser.formatForPosition(msg.line, msg.column2));
		
		// the offset is weird since .position().top changes when scrolling
		offset = {
			x: ($('#code').position().left + $('#editor').scrollLeft()),
			y: ($('#code').position().top + $('#editor').scrollTop())
		};
		
		$('#messagebox').css('left', startPos.x + offset.x);
		$('#messagebox').css('top', startPos.y + offset.y);
		$('#message').html(msg.html);
		
		if (endPos !== null) {
			$('#marking').css('left', startPos.x + offset.x);
			$('#marking').css('top', startPos.y + offset.y);
			$('#marking').width(endPos.x - startPos.x);
			// height is constant, set in css
			$('#marking').fadeIn(100);
		} else {
			$('#marking').fadeOut(100);
		}
		
		if (msg instanceof jsmm.msg.Error){
			$('#error').css('top', startPos.y);
			$('#error').fadeIn(100);
			$('#arrow').fadeOut(100);
		} else {
			$('#arrow').css('top', startPos.y);
			$('#arrow').fadeIn(100);
			$('#error').fadeOut(100);
			$('#messagebox').fadeIn(100);
		}
	};
	
	var hideMessage = function() {
		$('#messagebox').fadeOut(100);
		$('#error').fadeOut(100);
		$('#arrow').fadeOut(100);
		$('#marking').fadeOut(100);
	};
	
	var updateSize = function() {
		// NOTE: getPosition is not necessarily suitable for this
		$('#code').height(getPosition($('#code').val()).y + 100);
		$('#code').width(getPosition($('#code').val()).x + 100);
	};
	
	var run = function() {
		myConsole.clear();
		browser.setCode($('#code').val());
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
			myConsole.clear();
			hideMessage();
			browser.stepInit();
		} else {						
			var result = browser.stepNext();
			if (browser.hasError()) {
				drawMessage(browser.getError());
			} else if (result === undefined) {
				hideMessage();
			} else {
				drawMessage(result);
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
	});
	
	$('#error').click(function(e) {
		$('#messagebox').fadeToggle(100);
	});
	
	$('#arrow').click(function(e) {
		$('#messagebox').fadeToggle(100);
	});
	
	$('#messagebox').click(function(e) {
		$('#messagebox').fadeOut(100);
	});
	
	updateSize();
	run();
});
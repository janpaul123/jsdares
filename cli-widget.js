var jsmm = require('./jsmm');
var $ = require('br-jquery');

$(function() {
	$('#code').val(window.localStorage.getItem('1'));
	
	var myConsole = {
		log: function(text) {
			$('#console').val($('#console').val() + text + '\n');
			//console.log(text);
		},
		clear: function() {
			$('#console').val('');
		}
	};
	
	var browser = new jsmm.Browser();
	
	var drawError = function() {
		if (browser.getError()) {
			$('#error').css('top', $('#mirror').height() - $('#code').scrollTop());
			
			$('#errorbox').css('top', $('#code').position().top + $('#mirror').outerHeight() - $('#code').scrollTop());
			$('#errorbox').css('left', $('#code').position().left + $('#mirror').outerWidth() - $('#code').scrollLeft());
			$('#errormessage').html(browser.getError().html);
		}
	};
	
	var run = function(e) {
		myConsole.clear();
		browser.setCode($('#code').val());
		browser.setScope({console: myConsole});
		if (!browser.runAll()) {
			$('#mirror').text(browser.formatErrorForPosition());
			
			
			myConsole.log(JSON.stringify(browser.getError()));
			//console.log(browser.getError());
			if (false) {
				console.log(browser.getSafeCode());
				jsmm.verbose = true;
				browser.reset();
				browser.runAll();
				console.log(browser.getError());
			}
			
			drawError();
			$('#error').fadeIn(100);
		} else {
			$('#error').fadeOut(100);
			$('#errorbox').fadeOut(100);
		}
	};
	
	$('#run').click(run);
	
	$('#code').scroll(drawError);
	$('#code').bind('keydown', function(e) {
		//$('#error').fadeOut(100);
		//$('#errorbox').fadeOut(100);
	});
	$('#code').bind('keyup paste', function(e) {
		window.localStorage.removeItem('1');
		window.localStorage.setItem('1', $('#code').val());
		//browser.reset();
		//drawError();
		run();
	});
	
	$('#error').click(function(e) {
		$('#errorbox').fadeToggle(100);
	});
	
	$('#errorbox').click(function(e) {
		$('#errorbox').fadeOut(100);
	});
	
	run();
	//drawError();
});
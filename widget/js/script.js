$(function() {
	$('#text').val(window.localStorage.getItem('1'));
	$('#text').bind('keyup paste', function(e) {
		window.localStorage.removeItem('1');
		window.localStorage.setItem('1', $('#text').val());
	});
	
	var myConsole = {
		log: function(text) {
			$('#console').val($('#console').val() + text + '\n');
		}
	};
	
	
	
});
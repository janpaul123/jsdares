/*jshint node:true*/
"use strict";

var jsmm = require('./jsmm');
var $ = require('br-jquery');

$(function() {
	$('#graph').click(function(e) {
		var code = $('#code').val();
		var dot = jsmm.parse(code).getDot();
		$('#graphImg').attr('src', "https://chart.googleapis.com/chart?cht=gv&chl=" + encodeURIComponent(dot));
	});
});
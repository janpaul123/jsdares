/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.performance = {};

	output.performance.testFunction = function(func) {
		// warmup
		for (var i=0; i<100; i++) {
			func();
		}

		var start = (new Date()).getTime(), diff = 0, num = 0;
		while(diff < 3000) {
			for (var i=0; i<100; i++) {
				func();
				func();
				func();
				func();
				func();
				func();
				func();
				func();
				func();
				func();
				num += 10;
			}
			diff = (new Date()).getTime() - start;
		}
		return {time: diff/num, num: num};
	};

	output.performance.testObject = function(obj, filter) {
		var keys = [], current = 0;
		for (var key in obj) {
			if (filter === undefined || filter.indexOf(key) >= 0) {
				keys.push(key);
			}
		}
		console.log('testing: ' + keys.join(', '));
		var test = function() {
			setTimeout(function() {
				var call = obj[keys[current]];
				var dummyContext = {getStepNum: function(){ return 0; }, getCallNodeId: function(){ return 0; }};
				var example = obj[keys[current]].example;
				var func;

				if (call.func !== undefined) {
					var parenPos = example.indexOf('(');
					var name = example.substring(0, parenPos);
					func = function() {
						call.func(dummyContext, name, eval('[' + example.substring(parenPos+1, example.length-1) + ']'));
					};
				} else if (example.indexOf('=') >= 0) {
					var name = example.substring(0, example.indexOf(' '));
					func = function() {
						call.set(dummyContext, name, eval(example.substring(example.indexOf('=')+1)));
					};
				} else {
					func = function() {
						call.get(example);
					};
				}

				var result = output.performance.testFunction(func);
				console.log(example + ': ' + result.time + ' ms (' + result.num + ' times)');
				current++;
				if (current < keys.length) {
					test();
				}
			}, 100);
		};
		test();
	};
};
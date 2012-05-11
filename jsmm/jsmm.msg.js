/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.msg = {};
	jsmm.msg.Inline = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Line = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Call = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Error = function() { return this.init.apply(this, arguments); };
	
	jsmm.msg.addCommonMessageMethods = function(msg) {
		msg.getMessage = function() {
			return this.msg.replace(/<var>/g, '').replace(/<\/var>/g, '');
		};

		msg.getHTML = function() {
			var html = this.msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
			return html.replace(/&lt;var&gt;/g, '<var>').replace(/&lt;\/var&gt;/g, '</var>');
		};
		
		return msg;
	};
	
	jsmm.msg.Inline.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc, callNr, msg) {
			this.type = 'Inline';
			this.loc = loc.lineLoc || loc;
			this.callNr = callNr;
			this.msg = msg;
		}
	});
	
	jsmm.msg.Error.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc, msg, more, orig) {
			this.type = 'Error';
			this.loc = loc.lineLoc || loc;
			this.msg = msg;
			this.more = more || '';
			this.orig = orig || null;
		}
	});
};

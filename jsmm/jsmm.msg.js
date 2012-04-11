/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.msg = {};
	jsmm.msg.Inline = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Line = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Continue = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Error = function() { return this.init.apply(this, arguments); };
	
	jsmm.msg.addCommonMessageMethods = function(msg) {
		msg.initMsg = function(msg) {
			var message = (typeof msg === 'function') ? msg : function(f) { return msg; };
			this.message = message(function f(val) { return val; });
			this.html = message(function f(val) {
				// we assume that val is already JSON stringified
				return '<span class="msg-value">' + val.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;') + '</span>';
			});
		};
		msg.loadLineLoc = function(lineLoc) {
			if (lineLoc.lineLoc !== undefined) lineLoc = lineLoc.lineLoc;
			this.line = lineLoc.line || 0;
			this.column = lineLoc.column || 0;
			if (typeof lineLoc.column2 === 'number' && lineLoc.column2 > lineLoc.column) {
				this.column2 = lineLoc.column2;
			} else {
				this.column2 = this.column;
			}
		};
		return msg;
	};
	
	jsmm.msg.Inline.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc, msg) {
			this.type = 'Inline';
			this.loadLineLoc(loc);
			this.initMsg(msg);
		}
	});
	
	jsmm.msg.Line.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc, msg, append) {
			this.type = 'Line';
			this.loadLineLoc(loc);
			this.initMsg(msg);
			this.append = append || false;
		}
	});
	
	jsmm.msg.Continue.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc) {
			this.type = 'Continue';
			this.loadLineLoc(loc);
		}
	});
	
	jsmm.msg.Error.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc, msg, more, orig) {
			this.type = 'Error';
			this.loadLineLoc(loc);
			this.initMsg(msg);
			this.more = more || '';
			this.orig = orig || null;
		}
	});
};

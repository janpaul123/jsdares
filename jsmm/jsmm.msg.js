/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.msg = {};
	jsmm.msg.Inline = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Line = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Continue = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Error = function() { return this.init.apply(this, arguments); };
	
	jsmm.msg.addCommonMessageMethods = function(element) {
		element.initMsg = function(msg) {
			var message = (typeof msg === 'function') ? msg : function(f) { return msg; };
			this.message = message(function f(val) { return val; });
			this.html = message(function f(val) {
				// we assume that val is already JSON stringified
				return '<span class="msg-value">' + val.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;') + '</span>';
			});
		};
		element.loadPos = function(pos) {
			var startPos = pos.startPos || {};
			var endPos = pos.endPos || {};
			this.line = startPos.line || 0;
			this.column = startPos.column || 0;
			if ((endPos.line || 0) === this.line && (endPos.column || 0) >= this.column) {
				this.column2 = endPos.column || 0;
			} else {
				this.column2 = this.column;
			}
		};
		return element;
	};
	
	jsmm.msg.Inline.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos, msg) {
			this.type = 'Inline';
			this.loadPos(pos);
			this.initMsg(msg);
		}
	});
	
	jsmm.msg.Line.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos, msg, append) {
			this.type = 'Line';
			this.loadPos(pos);
			this.initMsg(msg);
			this.append = append || false;
		}
	});
	
	jsmm.msg.Continue.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos) {
			this.type = 'Continue';
			this.loadPos(pos);
		}
	});
	
	jsmm.msg.Error.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos, msg, more, orig) {
			this.type = 'Error';
			this.loadPos(pos);
			this.initMsg(msg);
			this.more = more || '';
			this.orig = orig || null;
		}
	});
};

/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.msg = {};
	jsmm.msg.Inline = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Line = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Call = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Error = function() { return this.init.apply(this, arguments); };
	
	jsmm.msg.addCommonMessageMethods = function(msg) {
		msg.initMsg = function(msg) {
			this.message = msg.replace(/<var>/g, '').replace(/<\/var>/g, '');
			this.html = msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
			this.html = this.html.replace(/&lt;var&gt;/g, '<var>').replace(/&lt;\/var&gt;/g, '</var>');
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
		init: function(loc, callNr, msg) {
			this.type = 'Inline';
			this.callNr = callNr;
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
	
	jsmm.msg.Call.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(nr) {
			this.type = 'Call';
			this.nr = nr;
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

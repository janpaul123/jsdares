module.exports = function(jsmm) {
	jsmm.msg = {};
	jsmm.msg.Line = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Inline = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Error = function() { return this.init.apply(this, arguments); };
	
	jsmm.msg.addCommonMessageMethods = function(element) {
		element.initMsg = function(msg) {
			var message = (typeof msg === 'function') ? msg : function(f) { return msg; };
			this.message = message(function f(val) { return val; });
			this.html = message(function f(val) { 
				// we assume that val is already JSON stringified
				return '<span class="msg-value">' + val.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;') + '</span>';
			}),
			this.line = 0;
			this.column = 0;
			this.column2 = 0;
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
	
	jsmm.msg.Line.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos, msg, lineMsg) {
			this.initMsg(msg);
			this.loadPos(pos);
			this.lineMsg = lineMsg;
		}
	});
	
	jsmm.msg.Inline.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos, msg) {
			this.initMsg(msg);
			this.loadPos(pos);
		}
	});
	
	jsmm.msg.Error.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(pos, msg, more, orig) {
			this.initMsg(msg);
			this.loadPos(pos);
			this.more = more || '';
			this.orig = orig || null;
		}
	});
};

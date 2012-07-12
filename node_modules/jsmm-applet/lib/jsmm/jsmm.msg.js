/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.msg = {};
	
	jsmm.msg.addCommonMessageMethods = function(msg) {
		msg.getMessage = function() {
			return this.msg.replace(/<var>/g, '').replace(/<\/var>/g, '');
		};

		msg.getHTML = function() {
			var html = this.msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
			return html.replace(/&lt;var&gt;/g, '<var>').replace(/&lt;\/var&gt;/g, '</var>');
		};

		msg.getLoc = function(tree) {
			if (this.loc !== undefined) {
				return this.loc;
			} else if (this.nodeId !== 0) {
				return tree.getNodeById(this.nodeId)[this.locType];
			} else {
				return {line: 1, column: 0};
			}
		};
		
		return msg;
	};
	
	jsmm.msg.Inline = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Inline.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(nodeId, msg, locType) {
			this.type = 'Inline';
			this.nodeId = nodeId;
			this.msg = msg;
			this.locType = locType || 'lineLoc';
		}
	});
	
	jsmm.msg.Error = function() { return this.init.apply(this, arguments); };
	jsmm.msg.Error.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(nodeId, msg, orig, locType) {
			this.type = 'Error';
			this.nodeId = nodeId ? nodeId : 0;
			this.msg = msg;
			this.locType = locType || 'lineLoc';
			this.orig = orig || null;
		}
	});

	jsmm.msg.CriticalError = function() { return this.init.apply(this, arguments); };
	jsmm.msg.CriticalError.prototype = jsmm.msg.addCommonMessageMethods({
		init: function(loc, msg, orig) {
			this.type = 'Error';
			this.loc = loc;
			this.msg = msg;
			this.orig = orig || null;
		}
	});
};

/*jshint node:true jquery:true*/
"use strict";

var _ = require('underscore');
var dareData = require('./dareData');

module.exports = function(client) {
	client.Sync = function() { return this.init.apply(this, arguments); };
	client.Sync.prototype = {
		init: function() {
		},

		remove: function() {
		},

		getCollectionAndDaresAndInstances: function(_id, success) {
      var collection = {};
      Object.assign(collection, dareData.collections[_id]);
      collection.dares = collection.dareIds.map((function(dareId) {
        return this.getDareAndInstance(dareId);
      }).bind(this));
      success(collection);
    },

    getDareAndInstance: function(_id) {
      var dare = {};
      Object.assign(dare, dareData.dares[_id]);

      var instances = JSON.parse(localStorage['jsdaresInstances'] || '{}');
      dare.instance = instances[_id] || { dareId: _id };

			return dare;
		},

		getDareEdit: function(_id, success) {
			alert('TODO');
		},

		updateProgram: function(instance) {
			this.updateInstance(instance);
		},

		updateInstance: function(instance) {
      var instances = JSON.parse(localStorage['jsdaresInstances'] || '{}');
      instances[instance.dareId] = instances[instance.dareId] || {};
      Object.assign(instances[instance.dareId], instance);
      localStorage['jsdaresInstances'] = JSON.stringify(instances);
		},

		updateDare: function(dare) {
			alert('TODO');
		}
	};
};

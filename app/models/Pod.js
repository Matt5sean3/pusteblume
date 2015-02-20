exports.definition = {
	config: {
		columns: {
			"url": "string"
		},
		defaults: {
			"url": ""
		},
		adapter: {
			type: "properties",
			collection_name: "Pod"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});

		return Collection;
	}
};
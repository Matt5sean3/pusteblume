exports.definition = {
	config: {
		columns: {
			"name" : "string",
			"id" : "string"
		},
		defaults: {
			"name" : "",
			"id" : ""
		},
		adapter: {
			type: "properties",
			collection_name: "Aspect"
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
exports.definition = {
	config: {
		columns: {
			"name" : "string",
			"thumbnail" : "string"
		},
		defaults: {
			"name" : "",
			"thumbnail" : ""
		},
		adapter: {
			type: "properties",
			collection_name: "Profile"
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
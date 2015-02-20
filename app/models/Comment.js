exports.definition = {
	config: {
		columns: {
			"profile": "int",
			"post": "int",
			"text": "string"
		},
		defaults: {
			
		},
		adapter: {
			type: "properties",
			collection_name: "Comment"
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
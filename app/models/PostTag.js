exports.definition = {
	config: {
		columns: {
			"post": "int",
			"name": "string"
		},
		defaults: {
			"post": 0,
			"name": ""
		},
		adapter: {
			type: "properties",
			collection_name: "PostTag"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			getPost: function()
			{
				return Alloy.Collections.instance("Post").get(this.get("post"));
			}
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
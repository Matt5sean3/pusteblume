exports.definition = {
	config: {
		column: {
			"post" : "int",
			"profile" : "int"
		},
		defaults: {
			"post": 0,
			"profile": 0
		},
		adapter: {
			type: "properties",
			collection_name: "Like"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			getPost: function() {
				return Alloy.Collections.instance("Post").get(this.get("post"));
			},
			getProfile: function() {
				return Alloy.Collections.instance("Profile").get(this.get("profile"));
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
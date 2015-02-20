exports.definition = {
	config: {
		columns: {
			"profile": "int",
			"name": "string"
		},
		defaults: {
			"profile": -1,
			"name": ""
		},
		adapter: {
			type: "properties",
			collection_name: "ProfileTag"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
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
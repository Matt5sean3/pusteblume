exports.definition = {
	config: {
		column: {
			"profile": "int"
		},
		defaults: {
			"profile": ""
		},
		adapter: {
			type: "properties",
			collection_name: "Account"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
			getProfile: function(){
				return Alloy.Collections.instance("Profile").get(this.get("profile"));
			}
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
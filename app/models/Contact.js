exports.definition = {
	config: {
		columns: {
			"aspect": "int",
			"profile": "int"
		},
		defaults: {
			
		},
		adapter: {
			type: "properties",
			collection_name: "Contact"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
			getAspect: function()
			{
				return Alloy.Collections.instance("Aspect").get(this.get("aspect"));
			},
			getProfile: function()
			{
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
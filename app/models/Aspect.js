exports.definition = {
	config: {
		columns: {
			"profile" : "int", // the id of the associated profile
			"name": "string"
		},
		defaults: {
			"type" : 0,
			"profile" : 0
		},
		adapter: {
			type: "properties",
			collection_name: "Aspect"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			getProfile : function() {
				return Alloy.Collections.instance("Profile").get(this.get("profile"));
			},
			getContacts : function()
			{
				return Alloy.Collections.instance("Contact").where({aspect: this.id});
			}
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
			populate : function(text)
			{
				var res = String(text).match(/gon.user=(.[^}][^;]+});/i);
				// add the array of aspects
				var aspects = JSON.parse(res[1]).aspects;
				for(var c = 0; c < aspects.length; c++)
				{
					var aspect = Alloy.createModel("Aspect", aspects[c]);
					this.add(aspect);
				}
			}
		});

		return Collection;
	}
};
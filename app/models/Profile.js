exports.definition = {
	config: {
		columns: {
			"pod": "int",
			"name" : "string",
			"smallAvatar": "string",
			"mediumAvatar": "string",
			"largeAvatar": "string",
			"gender" : "string"
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
			getPod : function()
			{
				return Alloy.Collections.instance("Pod").get(this.get("pod"));
			},
			getPosts : function()
			{
				return Alloy.Collections.instance("Post").where({pod: this.id});
			},
			getTags : function()
			{
				return Alloy.Collections.instance("Tag").where({pod: this.id});
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
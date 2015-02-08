exports.definition = {
	config: {
		columns: {
			"author": "string",
			"icon" : "icon",
			"date" : "string",
			"text" : "string",
			"html" : "string",
			"image" : "string",
			"bigImage" : "string"
		},
		defaults: {
			"date" : "",
			"image" : "",
			"bigImage" : ""
		},
		adapter: {
			type: "properties",
			collection_name: "Post"
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
			populate : function(text, owner)
			{
				var entries = JSON.parse(text);
				// var lid = Ti.App.Properties.getString("lastPost");

				for (var i = 0; i < entries.length; ++i) {
					
					var entry = entries[i];
					var hasPhoto = entry.photos.length > 0;
					var hasLikes = entry.interactions.likes.length > 0;
					var text = String(entry.text).replace(/<(?:.|\n)*?>/gm, '');
					var html = Alloy.Globals.replaceText(text);
					var post = Alloy.createModel("Post", {
						"owner": owner, // Used for multiuser cases, mostly testing
						"date" : Alloy.Globals.formatDate(entry.created_at),
						"image" : (hasPhoto)? entry.photos[0].small : "",
						"bigImage" : (hasPhoto)? entry.photos[0].large : "",
						"myFav" : hasLikes, 
						"favID" : (hasLikes)? entry.interactions.likes[0].id : 0, 
						"isPublic" : entry["public"], 
						"author" : entry.author.name, 
						"comment_count" : String(entry.interactions.comments_count), 
						"text" : text, 
						"html" : html,
						"icon" : entry.author.avatar.small, 
						"id" : entry.id, 
						"like_count" : String(entry.interactions.likes_count),
						"timestamp" : entry.created_at
						});
					this.add(post);
				}
			}
		});

		return Collection;
	}
};
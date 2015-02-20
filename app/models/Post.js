exports.definition = {
	config: {
		columns: {
			"poster": "int", // The poster's Profile id
			"text" : "string", // The content of the post
			"date" : "string" // The date string
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
			getPoster : function() {
				return Alloy.Collections.instance("Profile").get(this.get("poster"));
			},
			// Retrieves a collection of comments related to this post
			getComments : function() {
				return Alloy.Collections.instance("Comment").where({post: this.id });
			},
			// Retrieves a collection of profiles that have liked this post
			getLikes : function() {
				return Alloy.Collections.instance("Like").where({post: this.id });
			},
			// Retrieves a collection of hashtags associated to this post
			getTags : function() {
				return Alloy.Collections.instance("PostTag").where({link: this.get("id")});
			}
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
			},
			retrieveToken : function(session)
			{
				var req = Alloy.createModel("Request", 
					{localId: "token", foreignId: "basic:stream"});
				req.prepareRequest(this, sesssion);
				session.retrieveBasic("/stream", "stream");
				this.on("success:basic:stream");
			},
			retrieve : function(session)
			{
				var req = Alloy.createModel("Request", 
					{localId : "retrieve", foreignId : "stream"});
				req.prepareRequest(this, session);
				session.retrieveHttpPage(
					"GET",
					"/" + this.get("stream"),
					{
						"Accept" : "application/json, text/javascript, */*; q=0.01",
						"X-Requested-With" : "XMLHttpRequest",
						"X-CSRF-Token" : this.get("token")
					},
					null,
					"stream"
					);
				this.on("success:stream");
			}
		});

		return Collection;
	}
};
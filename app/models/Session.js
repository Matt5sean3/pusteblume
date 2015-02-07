/** 
 * This model is primarily used as a singleton for controlling user session data
 * and as the model for the login and logout process.
 * A better name might have been "Session.js"
 */
// TODO rewrite functions as argument bindings where possible

exports.definition = {
	config: {
		columns: {
			"token" : "string",
			"pod" : "string",
			"cookie_session" : "string",
			"username" : "string",
			"localUsername" : "string", // The portion of the username before the @ symbol
			"loggedIn" : "boolean", // whether the user is logged in
			"lock" : "boolean" // Used to prevent changes
		},
		defaults: {
			"token" : "",
			"cookie_session" : "",
			"cookie_user" : "",
			"username" : "",
			"localUsername" : "",
			"pod" : "",
			"loggedIn" : false,
			"lock" : false // Used for enforcing temporary immutability
		},
		adapter: {
			type: "properties",
			collection_name: "Session"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			initialize : function()
			{
				this.set("lock", false);
				Ti.App.addEventListener("resume", this.resume.bind(this));
				
				this.on("http_load:basic:login", this.loginTokenSuccess, this);
				this.on("http_error:basic:login", this.loginTokenError, this);
				
				this.on("http_load:post:login", this.loginSuccess, this);
				this.on("http_error:post:login", this.loginError, this);
				
				this.on("http_load:basic:stream", this.streamTokenSuccess, this);
				this.on("http_error:basic:stream", this.streamTokenError, this);
				
				this.on("http_load:stream", this.streamSuccess, this);
				this.on("http_error:stream", this.streamError, this);
				
				this.on("http_load:post:logout", this.logoutSuccess, this);
				this.on("http_error:post:logout", this.logoutError, this);
				
				this.on("http_load:basic:user_info", this.userInfoSuccess, this);
				this.on("http_error:basic:user_info", this.userInfoError, this);

				this.on("http_load:basic:aspects", this.aspectsSuccess, this);
				this.on("http_error:basic:aspects", this.aspectsError, this);
				
				this.on("login_success", this.retrieveAspects, this);
				
				this.on("error", function(model, error){alert(error);}, this);
			},
			validate : function(attrs)
			{
				// Cannot change while locked
				// TODO add localization for locking errors
				for(key in attrs)
				{
					var value = attrs[key];
					/*
					switch(key)
					{
					case "username":
						if(value == "")
							return L("fieldEmpty");
    					if (value.indexOf("@") <= 0)
        					return L("setUsername");
						break;
					case "password":
						if(value == "")
							return L("fieldEmpty");
						break;
					default:
						break;
					}
					*/
				}
			},
			resume : function()
			{
				// Update information immediately after resume
			},
			canLogin : function()
			{
    			return this.get("username").indexOf("@") > 0 && this.get("password") != "";
			},
			// --- START NETWORK FUNCTIONS ---
			retrieveHttpPage : function(method, uri, headers, data, id)
			{
				Ti.API.info(this.get("pod") + uri);
				var req = Ti.Network.createHTTPClient();
				this.trigger("http_start");
				this.trigger("http_start:" + id);
				req.onload = (function(target, e){
					this.trigger("http_load", target, e, id);
					this.trigger("http_load:" + id, target, e, id);
					var cookie = target.getResponseHeader("Set-Cookie");
            		if (cookie != "")
                		this.set("cookie_session", cookie);
				}).bind(this, req);
				
				req.onerror = (function(target, e){
					this.trigger("http_error", target, e, id);
					this.trigger("http_error:" + id, target, e, id);
				}).bind(this, req);
				
				req.ondatastream = (function(target, e){
					this.trigger("http_data_stream", target, e, id);
					this.trigger("http_data_stream:" + id, target, e, id);
				}).bind(this, req);
				
				req.onsendstream = (function(target, e){
					this.trigger("http_send_stream", target, e, id);
					this.trigger("http_send_stream:" + id, target, e, id);
				}).bind(this, req);
				
				// Cookie is controlled automatically
				var cookie = this.get("cookie_session");
				if(cookie)
					req.setRequestHeader("Cookie", cookie);
				
				var header;
				for(header in headers)
				{
					req.setRequestHeader(header, headers[header]);
				}
				
				req.open(method, this.get("pod") + uri);
				req.send(data);
			},
			retrieveBasic : function(uri, id)
			{
				this.retrieveHttpPage(
					"GET",
					uri,
					{
						"Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
					},
					null,
					"basic:" + id
					);
			},
			// Dispatches a post request with form encoded data
			retrievePostForm : function(uri, inputs, id)
			{
				this.retrieveHttpPage(
					"POST",
					uri,
					{
						"Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
						"Content-Type" : "application/x-www-form-urlencoded",
						// "Content-length" : (String(inputs)).length)
					},
					inputs,
					"post:" + id
					);
			},
			// --- END NETWORK FUNCTIONS ---
			
			// --- START LOGIN FUNCTIONS ---
			// extended functions and properties go here
			retrieveLoginToken : function()
			{
				this.set("lock", true);
				// username and password values should be set by mapping to the login controller
    			var username = this.get("username");
    			var usernameParts = this.get("username").split("@");
    			this.set("localUsername", usernameParts[0]);
    			this.set("pod", "https://" + usernameParts[1]);
    			// The pod value is derived of the parts of the username
				this.trigger("login_token_start");
				this.retrieveBasic("/users/sign_in", "login");
			},
			loginTokenSuccess : function(target, e)
			{
				// Record the login token
    			var m = /.*authenticity_token.*value=\"(.*)\"/;
    			var res = String(target.responseText).match(m);
				this.set("lock", false);
    			this.set("token", res[1]);
				this.trigger("login_token_success", target, e);
				// Immediately proceed to login
				this.retrieveLogin();
			},
			loginTokenError : function(target, e)
			{
				this.set("lock", false);
				this.trigger("login_token_error", target.responseText);
			},
			
			retrieveLogin : function()
			{
				this.set("lock", true);
				this.trigger("login_start");
        		var parameters = {
           			"utf8" : "✓", 
            		"user[username]" : this.get("localUsername"), 
            		"user[password]" : this.get("password"), 
            		"commit" : "Sign in", 
            		"user[remember_me]" : 1, 
            		"authenticity_token" : this.get("token")
        			};
				this.retrievePostForm("/users/sign_in", parameters, "login");
			},
			loginSuccess : function(target, e)
			{
				this.set("lock", false);
				this.set("loggedIn", true);
    			// Retrieving detailed user info occurs immediately after the login
				this.trigger("login_success", target, e);
			},
			loginError : function(target, e)
			{
				this.set("lock", false);
				this.set("loggedIn", false);
				this.trigger("login_error", target, e);
			},
			// --- END LOGIN FUNCTIONS ---
			
			// --- START LOGOUT FUNCTIONS ---
			retrieveLogout : function()
			{
				this.set("lock", true);
				this.trigger("logout_start");
				var parameters = {
					"_method" : "delete", 
					"authenticity_token" : this.get("token")
					};
				this.retrievePostForm("/users/sign_out", parameters, "logout");
			},
			logoutSuccess : function(target, e)
			{
				this.set("lock", false);
				this.set("cookie_session", "");
				this.set("token", "");
				this.set("loggedIn", false);
				this.trigger("logout_success", target, e);
			},
			logoutError : function(target, e)
			{
				this.set("lock", false);
				this.trigger("logout_error", target, e);
			},
			// --- END LOGOUT FUNCTIONS ---
			
			// --- START USERINFO FUNCTIONS ---
			retrieveUserInfo : function()
			{
				this.trigger("user_info_start");
				this.retrieveBasic("/bookmarklet", "user_info");
				// Should provide a Profile Model object to the user_info_success event
			},
			userInfoSuccess : function(target, e)
			{
				// Should construct a user profile object
				var res = String(target.responseText).match(/gon.user=(.[^}][^;]+});/i);
				var profile = Alloy.createModel("Profile", JSON.parse(res[1]));
				this.trigger("user_info_success", target, e, profile);
			},
			userInfoError : function(target, e)
			{
				this.trigger("user_info_error", target, e);
			},
			// --- END USERINFO FUNCTIONS ---
			
			// --- START ASPECTS FUNCTIONS ---
			retrieveAspects : function()
			{
				this.trigger("aspects_start");
				this.retrieveBasic("/bookmarklet", "aspects");
			},
			aspectsSuccess : function(target, e)
			{
				var res = String(target.responseText).match(/gon.user=(.[^}][^;]+});/i);
				// Update the aspects singleton
				var aspectCollection = Alloy.Collections.instance("Aspect");
				// add the array of aspects
				var aspects = JSON.parse(res[1]).aspects;
				alert("Got " + aspects.length + " aspects");
				aspectCollection.add(aspects);
				this.trigger("aspects_success", target, e);
			},
			aspectsError : function(target, e)
			{
				this.trigger("aspects_error", target, e);
			},
			// --- END ASPECTS FUNCTIONS ---
			
			// --- START STREAM FUNCTIONS ---
			retrieveStreamToken : function()
			{
				this.trigger("stream_token_start");
				this.retrieveBasic("/stream", "stream");
			},
			streamTokenSuccess : function(target, e)
			{
				this.trigger("stream_token_success", target, e);
				var m = /.*authenticity_token.*value=\"(.*)\"/;
				var res = String(target.responseText).match(m);
				this.set("token", res[1]);
			},
			streamTokenError : function(target, e)
			{
				this.trigger("stream_token_error", target, e);
			},
			retrieveStream : function()
			{
				this.trigger("stream_start");
				this.retrieveHttpPage(
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
			},
			streamSuccess : function(target, e)
			{
				// Update the Post collection singleton
				Alloy.Collections.instance("Post").populate(target.responseText);
				this.trigger("stream_success", target, e);
			},
			streamError : function(target, e)
			{
				this.trigger("stream_error", target, e);
			},
			// --- END STREAM FUNCTIONS ---
			
			// --- START SUBMISSION FUNCTIONS
			retrieveSubmit : function()
			{
				this.trigger("submit_start");
			},
			submitSuccess : function(target, e)
			{
				this.retrieveHttpPage(
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
		        /* With Image
		        require("/api").createAPI({
		            type : "POST", 
		            timeout : 20000, 
		            isBinary : true, 
		            token : true, 
		            filename : blob.file.name, 
		            url : "/photos?photo[pending]=true&photo[aspect_ids][0]=" + Ti.App.Properties.getString("aspectID") + "&set_profile_image=&qqfile=" + blob.file.name, 
		            success : this.submitPhotoSuccess.bind(this), 
		            error : this.submitPhotoError.bind(this), 
		            parameter : {
		                data : blob
		                }
		        	});*/
	        	/* No Image
	            require("/api").createAPI({
	                type : "POST", 
	                postJSON : true, 
	                token : true, 
	                url : "/status_messages", 
	                success : this.submitSuccess.bind(this), 
	                error : this.submitError.bind(this), 
	                parameter : {
	                    "location_coords" : "", 
	                    "aspect_ids" : Ti.App.Properties.getString("aspectID"), 
	                    "status_message" : {
	                        "text" : txt
		                    }
		                }
	            	});*/
	            /* Image from photoID
	            require("/api").createAPI({
	                type : "POST", 
	                postJSON : true, 
	                token : true, 
	                url : "/status_messages", 
	                success : this.submitSuccess.bind(this), 
	                error : this.submitError.bind(this), 
	                parameter : {
	                    "location_coords" : "", 
	                    "aspect_ids" : Ti.App.Properties.getString("aspectID"), 
	                    "status_message" : {
	                        "text" : txt
	                    }, 
	                    "photos" : String(e.photoID)
	                }
	            });*/
			},
			submitError : function(target, e)
			{
				
			}
			// --- END SUBMISSION FUNCTIONS
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
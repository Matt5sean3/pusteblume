var args = arguments[0] || {};

var blob = null;
var service = null;
var data = [];
var aspects = null;
var userinfo = null;
var newPosts = 0;
var lastID = 0;

// Global Property Initialization
// should be moved to a model
var initialProperties = {
    token: "",
    invitelink: "",
    lastNotification: "0",
    lastPost: "0",
    stream: "stream",
    aspect: "public",
    aspectID: "public",
    pod: "https://joindiaspora.com",
    cookie_session: "",
    cookie_user: "",
    username: "",
    fullName: "",
    userThumbnail: ""
};
var updatedProperties = {
    lastDate: new Date().getTime()/1000
};
function updateProperties(initialProperties, updatedProperties)
{
    for(property in initialProperties)
    {
        if(!Ti.App.Properties.hasProperty(property))
            Ti.App.Properties.setString(property, initialProperties[property]);
    }
    for(property in updatedProperties)
    {
        Ti.App.Properties.setString(property, updatedProperties[property]);
    }
}
updateProperties(initialProperties, updatedProperties);
// End Global Property Initialization

function PusteBlumeApp(args, window, contentContainer, aspectButton, logoutButton, submitButton, writeButton, photoButton, refreshButton, aspectsView, streamButton, streamLabel, text, waiting)
{
	// TODO add in better place holders for userImage and username, also make these global information
	
    this.contentContainer = contentContainer;
    this.content = Alloy.createWidget("list", "widget", {
        getStream : this.getStream.bind(this), 
        click : true, 
        showImage : this.showImage.bind(this), 
        getMore: this.getMore.bind(this)
        });
    this.contentContainer.add(this.content.getView());
    // caches result for some reason
    this.lastID = Ti.App.Properties.getString("lastPost");
    this.aspectButton = aspectButton;
    this.aspectButton.title = Ti.App.Properties.getString("aspect");

    this.logoutButton = logoutButton;
    this.submitButton = submitButton;
    this.writeButton = writeButton;
    this.photoButton = photoButton;
    this.refreshButton = refreshButton;
    this.aspectsView = aspectsView;
    this.streamButton = streamButton;
    this.streamLabel = streamLabel;
    this.text = text;
    this.waiting = waiting;
    // events
    //

    Ti.App.addEventListener("resume", this.resume.bind(this));
    this.aspectButton.addEventListener("click", this.showAspects.bind(this));
    this.logoutButton.addEventListener("click", this.attemptLogout.bind(this));
    this.submitButton.addEventListener("click", this.attemptSubmit.bind(this));
    this.photoButton.addEventListener("click", this.showPhoto.bind(this));
    this.writeButton.addEventListener("click", this.onClickWrite.bind(this));
    this.refreshButton.addEventListener("click", this.refresh.bind(this));
    this.streamButton.addEventListener("click", this.openStreamActivityMenu.bind(this));
    
    this.logoutButton.addEventListener("touchstart", this.highlight.bind(this));
    this.writeButton.addEventListener("touchstart", this.highlight.bind(this));
    this.refreshButton.addEventListener("touchstart", this.highlight.bind(this));

    this.logoutButton.addEventListener("touchend", this.lowlight.bind(this));
    this.writeButton.addEventListener("touchend", this.lowlight.bind(this));
    this.refreshButton.addEventListener("touchend", this.lowlight.bind(this));
    this.window = window;
    this.window.open();
    if (Ti.App.Properties.getString("cookie_session") === "" || 
        !Ti.App.Properties.getBool("loggedIn")) {
        this.openLoginController();
    }
    Ti.App.addEventListener('checkNotifications', function(data) {
        checkNotification();
    });
    if (Ti.App.Properties.getString("cookie_session") !== "" && Ti.App.Properties.getBool("loggedIn")) {
        this.getStream();
        this.getUserInfo();
    }
}

PusteBlumeApp.prototype.openLoginController = function()
{
    Alloy.createController("login", {
            getStream : this.getStream.bind(this), 
            getToken : this.getToken.bind(this), 
            getUserInfo : this.getUserInfo.bind(this)
            });
};

PusteBlumeApp.prototype.tokenSuccess = function(e)
{
    // extract token
    //
    var m = /.*authenticity_token.*value=\"(.*)\"/;
    var res = String(e).match(m);
    Ti.App.Properties.setString("token", res[1]);
};

PusteBlumeApp.prototype.tokenError = function(e)
{
    Ti.API.error("no token");    
};

PusteBlumeApp.prototype.getToken = function(e)
{
    // get new token after login
    Ti.API.info("get login token");

    require("/api").createAPI({
        type : "GET", 
        url : "/stream", 
        success : this.tokenSuccess.bind(this), 
        error : this.tokenError.bind(this), 
        noJSON : true
    });
};

PusteBlumeApp.prototype.getStream = function()
{
    this.waiting.message = " " + L("getStream");
    this.waiting.show();

    require("/api").createAPI({
        type : "GET", url : "/" + Ti.App.Properties.getString("stream"), 
        success : this.streamSuccess.bind(this), 
        token : true, 
        error : this.streamError.bind(this)
    });
};

PusteBlumeApp.prototype.chooseAspect = function(e)
{
    this.aspectsView.hide();
    Ti.App.Properties.setString("aspectID", e.source.id);
    Ti.App.Properties.setString("aspect", e.source.title);
    this.aspectButton.title = e.source.title;
};

PusteBlumeApp.prototype.showAspects = function(e)
{
    this.aspectsView.show();
};

PusteBlumeApp.prototype.streamSuccess = function(e)
{
    data = [];
    newPosts = 0;
    var lid = Ti.App.Properties.getString("lastPost");

    for (var i = 0; i < e.length; ++i) {

        var txt = String(e[i].text).replace(/<(?:.|\n)*?>/gm, '');
        var myFav = false;
        var favID = 0;
        var photo = "";
        var photoBig = "";

        if (e[i].interactions.likes.length > 0) {
            myFav = true;
            favID = e[i].interactions.likes[0].id;
        }

        if (e[i].photos.length > 0) {
            photo = e[i].photos[0].sizes.small;
            photoBig = e[i].photos[0].sizes.large;
        }

        var d = new Date(e[i].created_at);


        data.push({
            photo : photo, 
            photoBig : photoBig, 
            date : Alloy.Globals.formatDate(e[i].created_at), 
            myFav : myFav, 
            favID : favID, 
            isPublic : e[i]["public"], 
            author : e[i].author.name, 
            comment_count : String(e[i].interactions.comments_count), 
            text : txt, icon : e[i].author.avatar.small, 
            id : e[i].id, 
            like_count : String(e[i].interactions.likes_count)
        });
        txt = null;
        myFav = null;
        favID = null;
        photo = null;
        photoBig = null;
        if (lastID < e[i].id) {
            newPosts++;
            if (lid < e[i].id)
                lid = e[i].id;
        }

        if (d.getTime()/1000 < Ti.App.Properties.getString("lastDate")) {
            Ti.App.Properties.setString("lastDate", d.getTime()/1000);
        }
        d=null;
    }

    if (newPosts > 0) {
        this.showNotification(newPosts);
        newPostss = 0;
    }
    lastID = lid;
    Ti.App.Properties.setString("lastPost", lastID);
    lid = null;
    this.content.setData(data);
    this.waiting.hide();
    
};

PusteBlumeApp.prototype.streamError = function(e)
{
    this.waiting.hide();
};

PusteBlumeApp.prototype.openStreamActivityMenu = function(e)
{
	Alloy.createController("stream_activity_menu",
	    {
	    	streamLabel: this.streamLabel,
	    	getStream: this.getStream.bind(this)
	    });
};

PusteBlumeApp.prototype.logoutSuccess = function(e)
{
    Ti.App.Properties.setString("cookie_session", "");
    Ti.App.Properties.setString("token", "");
    Ti.App.Properties.setBool("loggedIn", false);
    this.waiting.hide();
    this.text.value = "";
    this.openLoginController();

    blob = null;
    this.photoButton.backgroundColor = "#373937";
};

PusteBlumeApp.prototype.logoutError = function(e)
{
    this.waiting.hide();
    Ti.App.Properties.setString("cookie_session", "");
    Ti.App.Properties.setString("token", "");
    Ti.App.Properties.setBool("loggedIn", false);
    this.text.value = "";
    // 
    this.openLoginController();
};

PusteBlumeApp.prototype.attemptLogout = function(e)
{
    this.waiting.show();

    require("/api").createAPI({
        type : "POST", 
        url : "/users/sign_out", 
        success : this.logoutSuccess.bind(this), 
        error : this.logoutError.bind(this), 
        parameter : {
            "_method" : "delete", 
            "authenticity_token" : Ti.App.Properties.getString("token")
        }
    });
};

PusteBlumeApp.prototype.notificationSuccess = function(e)
{
    var count = 0;
    var lastSaved = new Date(Ti.App.Properties.getString("lastNotification"));
    var last = 0;

    
    for ( i = 0; i < e.length; ++i) {
        for (var obj in e[i]) {
            // check for unread stuff
            if (e[i][obj].unread === true) {

                if (new Date(e[i][obj].created_at) > lastSaved) {
                    // only count new stuff since last check - so we can keep the status in web

                    if (new Date(e[i][obj].created_at) > new Date(last))
                        last = e[i][obj].created_at;
                    count++;
                }
            }

        }
    }
    if (last === 0) {
        last = lastSaved;
    }
    Ti.App.Properties.setString("lastNotification", last);

    if (count > 0) {
        this.showNotification(count);
    }
};

PusteBlumeApp.prototype.showNotification = function(count)
{
    /* Cancelling notifications to find vibration error */
    // create notification
    var intent = Ti.Android.createIntent({
        flags : Ti.Android.FLAG_ACTIVITY_CLEAR_TOP | Ti.Android.FLAG_ACTIVITY_NEW_TASK, className : 'com.miga.pusteblume.PusteblumeActivity'
    });
    intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);

    var pending = Ti.Android.createPendingIntent({
        intent : intent, flags : Ti.Android.FLAG_UPDATE_CURRENT
    });

    var notification = Ti.Android.createNotification({
        icon : Ti.App.Android.R.drawable.appicon, 
        contentTitle : 'Pusteblume', 
        contentText : count + " " + L("somethingNew"), 
        contentIntent : pending, 
        defaults : Titanium.Android.DEFAULT_ALL, 
        flags : Titanium.Android.ACTION_DEFAULT | 
            Titanium.Android.FLAG_AUTO_CANCEL | 
            Titanium.Android.FLAG_SHOW_LIGHTS
    });
    // Send the notification.
    Ti.Android.NotificationManager.notify(1, notification);    
};

PusteBlumeApp.prototype.notificationError = function(e)
{
    // do nothing
};

PusteBlumeApp.prototype.checkNotification = function(e)
{
    require("/api").createAPI({
        type : "GET", url : "/notifications", 
        success : this.notificationSuccess.bind(this), 
        error : this.notificationError.bind(this), 
        parameter : {
        }
    });
};

PusteBlumeApp.prototype.submitSuccess = function(e)
{
    this.text.value = "";
    this.text.blur();
    blob = null;
    this.photoButton.backgroundColor = "#373937";
    this.getStream();
};

PusteBlumeApp.prototype.submitError = function(e)
{
    this.waiting.hide();
};

PusteBlumeApp.prototype.onClickCancel = function(e)
{
    $.view_post.hide();
};

PusteBlumeApp.prototype.submitPhotoSuccess = function(e)
{
    blob = null;
    this.text.blur();
    this.photoButton.backgroundColor = "#373937";
    // photo uploaded now submit post

    attemptSubmit({
        photoID : e.data.photo.id
    });
};

PusteBlumeApp.prototype.submitPhotoError = function(e)
{
    this.waiting.hide();
};

PusteBlumeApp.prototype.attemptSubmit = function(e)
{
    this.waiting.message = " " + L("posting") + "...";
    this.waiting.show();
    this.text.blur();
    if (blob !== null) {
        // In the case that you're trying to submit a photo
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
        });
    } else {
        // In the case that you're not trying to submit a photo via a blob
        match = /\n/ig;

        txt = String(this.text.value).replace(match, "\\r\\n");


        if (e.photoID === null) {
            require("/api").createAPI({
                type : "POST", 
                postJSON : true, 
                token : true, 
                url : "/status_messages", 
                success : this.submitSuccess.bind(this), 
                error : this.submitError.bind(this), 
                parameter : {
                    "location_coords" : "", "aspect_ids" : Ti.App.Properties.getString("aspectID"), "status_message" : {
                        "text" : txt
                    }
                }
            });
        } else {
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
            });
        }
    }
};

PusteBlumeApp.prototype.resume = function(e)
{
    if (Ti.App.Properties.getString("cookie_session") !== "") {
        this.getStream();
        this.getUserInfo();
    }
};

PusteBlumeApp.prototype.onSelectPhoto = function(e)
{
    blob = e.media;
    this.photoButton.backgroundColor = "#5597C9";
};

PusteBlumeApp.prototype.showPhoto = function(e)
{
    if (blob === null) {
        Ti.Media.openPhotoGallery({
            success : onSelectPhoto, 
            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
        });
    } else {
        blob = null;
        this.photoButton.backgroundColor = "#373937";
    }
};

PusteBlumeApp.prototype.onClickWrite = function(e)
{
    if (this.contentContainer.bottom <= 10) {
        this.contentContainer.bottom = 120;
        $.view_post.show();
    } else {
        this.contentContainer.bottom = 0;
        $.view_post.hide();
    }
};

PusteBlumeApp.prototype.refresh = function(e)
{
    this.getStream();
    //checkNotification();
    Ti.App.Properties.setString("lastNotification", "0");
};

PusteBlumeApp.prototype.showImage = function(url)
{
    Alloy.createController("image_display", {
        url: url
        });
};

PusteBlumeApp.prototype.userInfoSuccess = function(e)
{
    res = String(e).match(/gon.user=(.[^}][^;]+});/i);
    userinfo = JSON.parse(res[1]);
    aspects = userinfo.aspects;
    res = null;
    
	Ti.App.Properties.setString("fullName", userinfo.name);
	Ti.App.Properties.setString("userThumbnail", userinfo.avatar.small);

    // set aspects
    this.aspectsView.removeAllChildren();

    var btn = Ti.UI.createButton({
        title : "public", 
        id : "public", 
        width : 200, 
        top : 5
    });
    btn.addEventListener("click", this.chooseAspect.bind(this));
    this.aspectsView.add(btn);

    for (var i = 0; i < aspects.length; ++i) {

        btn = Ti.UI.createButton({
            title : aspects[i].name, 
            id : aspects[i].id, 
            width : 200, bottom : 5
        });
        btn.addEventListener("click", this.chooseAspect.bind(this));
        this.aspectsView.add(btn);
    }
    
};

PusteBlumeApp.prototype.userInfoError = function(e)
{
    // does nothing
};

PusteBlumeApp.prototype.getUserInfo = function()
{
    Ti.API.info("get user info");
    require("/api").createAPI({
        type : "GET", 
        url : "/bookmarklet", 
        success : this.userInfoSuccess.bind(this), 
        error : this.userInfoError.bind(this), 
        noJSON : true
    });
};

PusteBlumeApp.prototype.highlight = function(e)
{
    e.source.color = "#fff";
};

PusteBlumeApp.prototype.lowlight = function(e)
{
    e.source.color = "#bbb";
};

PusteBlumeApp.prototype.streamRefreshSuccess = function(e)
{
    // get more items
    data = [];
    newPosts = 0;



    var lid = Ti.App.Properties.getString("lastPost");

    for (var i = 0; i < e.length; ++i) {

        var txt = String(e[i].text).replace(/<(?:.|\n)*?>/gm, '');
        var myFav = false;
        var favID = 0;
        var photo = "";
        var photoBig = "";

        if (e[i].interactions.likes.length > 0) {
            myFav = true;
            favID = e[i].interactions.likes[0].id;
        }

        if (e[i].photos.length > 0) {
            photo = e[i].photos[0].sizes.small;
            photoBig = e[i].photos[0].sizes.large;
        }

        data.push({
            photo : photo, 
            photoBig : photoBig, 
            date : Alloy.Globals.formatDate(e[i].created_at), 
            myFav : myFav, favID : favID, 
            isPublic : e[i]["public"], 
            author : e[i].author.name, 
            comment_count : String(e[i].interactions.comments_count), 
            text : txt, 
            icon : e[i].author.avatar.small, 
            id : e[i].id, 
            like_count : String(e[i].interactions.likes_count)
        });
        txt = null;
        myFav = null;
        favID = null;
        photo = null;
        photoBig = null;

        if (lastID < e[i].id) {
            newPosts++;
            if (lid < e[i].id)
                lid = e[i].id;
        }

        var d = new Date(e[i].created_at);


        if (d.getTime()/1000 < Ti.App.Properties.getString("lastDate")) {
            Ti.App.Properties.setString("lastDate", d.getTime()/1000);
        }
        d=null;
    }

    if (newPosts > 0) {
        this.showNotification(newPosts);
        newPostss = 0;
    }
    lastID = lid;
    Ti.App.Properties.setString("lastPost", lastID);
    lid = null;
    if (data.length>0){
        this.content.appendData(data);
    }

    this.waiting.hide();
};

PusteBlumeApp.prototype.getMore = function(e)
{
    // load more items
    this.waiting.message = " " + L("getStream");
    this.waiting.show();

    require("/api").createAPI({
        type : "GET", 
        url : "/" + Ti.App.Properties.getString("stream")+"?max_time="+Ti.App.Properties.getString("lastDate"), 
        success : this.streamRefreshSuccess.bind(this), 
        token : true, 
        error : this.streamError.bind(this)
    });
};
var app = new PusteBlumeApp(args, $.window, $.content, $.btn_aspect, $.btn_logout, $.btn_submit, $.btn_write, $.btn_photo, $.btn_refresh, $.view_aspects, $.view_stream, $.lbl_stream, $.text, $.waiting);

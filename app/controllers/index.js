var args = arguments[0] || {};

function PusteBlumeApp(args, window, session, contentContainer, aspectButton, logoutButton, submitButton, writeButton, photoButton, refreshButton, streamButton, streamLabel, text, waiting)
{
	// TODO add in better place holders for userImage and username, also make these global information
	this.session = session;
	
    this.contentContainer = contentContainer;
    this.content = Alloy.createWidget("list", "widget", {
        getStream : this.getStream.bind(this), 
        click : true, 
        showImage : this.showImage.bind(this), 
        getMore: this.getMore.bind(this)
        });
    this.contentContainer.add(this.content.getView());
    // caches result for some reason
    this.aspectButton = aspectButton;

    this.logoutButton = logoutButton;
    this.submitButton = submitButton;
    this.writeButton = writeButton;
    this.photoButton = photoButton;
    this.refreshButton = refreshButton;
    this.streamButton = streamButton;
    this.streamLabel = streamLabel;
    this.text = text;
    this.waiting = waiting;
    // events
    //

    this.aspectButton.addEventListener("click", this.showAspects.bind(this));
    this.logoutButton.addEventListener("click", this.attemptLogout.bind(this));
    this.submitButton.addEventListener("click", this.attemptSubmit.bind(this));
    this.photoButton.addEventListener("click", this.showPhoto.bind(this));
//    this.writeButton.addEventListener("click", this.onClickWrite.bind(this));
//    this.refreshButton.addEventListener("click", this.refresh.bind(this));
//    this.streamButton.addEventListener("click", Alloy.createController.bind(Alloy, "stream_activity_menu"));

    this.logoutButton.addEventListener("touchstart", this.highlight.bind(this));
    this.writeButton.addEventListener("touchstart", this.highlight.bind(this));
    this.refreshButton.addEventListener("touchstart", this.highlight.bind(this));

    this.logoutButton.addEventListener("touchend", this.lowlight.bind(this));
    this.writeButton.addEventListener("touchend", this.lowlight.bind(this));
    this.refreshButton.addEventListener("touchend", this.lowlight.bind(this));
    
    this.window = window;
    this.window.addEventListener("open", this.open.bind(this));
    this.window.addEventListener("close", this.close.bind(this));
    this.window.open();
    if(this.session.get("cookie_session") == "" ||
    	!this.session.get("loggedIn"))
    	Alloy.createController("login");
    
    if(this.session.get("cookie_session") != "" && this.session.get("loggedIn"))
    {
    	this.getStream();
    	this.getUserInfo();
    }
    
    // TODO keep this functionality here or move it to a model file?
    Ti.App.addEventListener('checkNotifications', function(data) {
        this.checkNotification();
    });
}

PusteBlumeApp.prototype.open = function()
{
    // Setup event listeners on the session
};

PusteBlumeApp.prototype.close = function()
{
	this.session.off(null, null, this);
};

PusteBlumeApp.prototype.showAspects = function(e)
{
    $.view_aspects.show();
};

PusteBlumeApp.prototype.openStreamActivityMenu = function(e)
{
	Alloy.createController("stream_activity_menu");
};

PusteBlumeApp.prototype.attemptLogout = function(e)
{
	this.session.retrieveLogout();
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

PusteBlumeApp.prototype.highlight = function(e)
{
    e.source.color = "#fff";
};

PusteBlumeApp.prototype.lowlight = function(e)
{
    e.source.color = "#bbb";
};

var app = new PusteBlumeApp(args, $.window, Alloy.Models.Session, $.content, $.btn_aspect, $.btn_logout, $.btn_submit, $.btn_write, $.btn_photo, $.btn_refresh, $.view_stream, $.lbl_stream, $.text, $.waiting);

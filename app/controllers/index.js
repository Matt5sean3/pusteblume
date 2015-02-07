var args = arguments[0] || {};

function PusteBlumeApp(args, window, session, logoutButton, writeButton, refreshButton, waiting)
{
	this.session = session;
	
    this.logoutButton = logoutButton;
    this.writeButton = writeButton;
    this.refreshButton = refreshButton;
    this.waiting = waiting;
    
    // events
    //
    this.logoutButton.addEventListener("click", this.session.retrieveLogout.bind(this.session));

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
    // TODO restore notification functionality
}

PusteBlumeApp.prototype.open = function()
{
    this.session.on("change:lock", this.updateWaiting, this);

    // Setup event listeners on the session
    this.session.on("logout_start", this.waiting.setMessage.bind(this.waiting, "Logging Out"), this);
    // TODO localization: this.session.on("logout_start", this.waiting.setMessage.bind(this.waiting, L("loggingOut")));
    this.session.on("logout_success", Alloy.createController.bind(Alloy, "login"), this);
    // TODO localization: this.session.on("logout_error", alert.bind(null, L("logoutError")), this);
    this.session.on("logout_error", alert.bind(null, "Failed to Logout"), this);
    
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

PusteBlumeApp.prototype.highlight = function(e)
{
    e.source.color = "#fff";
};

PusteBlumeApp.prototype.lowlight = function(e)
{
    e.source.color = "#bbb";
};

PusteBlumeApp.prototype.updateWaiting = function()
{
	// Reveal waiting while the username and password are disabled
	if(this.session.get("lock"))
        this.waiting.show();
    else
        this.waiting.hide();
};

var app = new PusteBlumeApp(args, $.window, Alloy.Models.Session, $.btn_logout, $.btn_write, $.btn_refresh, $.waiting);

var args = arguments[0] || {};

var session = Alloy.Models.Session;

// Keeping things minimal now
var openPostWriter = Alloy.createController.bind(Alloy, "post_submission");
var refresh = function(){};
var logout = session.retrieveLogout.bind(session);
var openActivities = Alloy.createController.bind(Alloy, "stream_activity_menu");

$.window.addEventListener("open", open.bind($.window, session, $.waiting));
$.window.addEventListener("close", close.bind($.window, session, $.waiting));
$.window.open();

if(session.get("cookie_session") == "" || !session.get("loggedIn"))
    Alloy.createController("login");

// Hoisted functions
function open(session, indicator)
{
	this.activity.invalidateOptionsMenu();
    // Setup event listeners on the session
    session.on("change:lock", updateWaiting.bind(this, session, indicator), this);
    session.on("logout_start", indicator.setMessage.bind(indicator, "Logging Out"), this);
    // TODO localization: session.on("logout_start", indicator.setMessage.bind(indicator, L("loggingOut")));
    
    session.on("logout_success", Alloy.createController.bind(Alloy, "login"), this);

    session.on("logout_error", alert.bind(null, "Failed to Logout"), this);
    // TODO localization: session.on("logout_error", alert.bind(null, L("logoutError")), this);
};

function close(session, indicator)
{
	session.off(null, null, this);
}

function updateWaiting(session, indicator)
{
	if(session.get("lock"))
        indicator.show();
    else
        indicator.hide();
}

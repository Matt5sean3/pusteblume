var args = arguments[0] || {};

var session = Alloy.Models.Session;

// Keeping things minimal now
var openPostWriter = Alloy.createController.bind(Alloy, "post_submission");
var refresh = function(){};
var logout = session.retrieveLogout.bind(session);

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
    // TODO localization: session.on("logout_start", indicator.setMessage.bind(indicator, L("loggingOut")), this);
    session.on("stream_token_start", indicator.setMessage.bind(indicator, "Retrieving Stream Token"), this);
    // TODO localization: session.on("stream_token_start", indicator.setMessage.bind(indicator, L("RetrievingStreamToken")), this);
    session.on("stream_start", indicator.setMessage.bind(indicator, "Retrieving Stream"), this);
    
    session.on("logout_success", Alloy.createController.bind(Alloy, "login"), this);
    session.on("logout_error", alert.bind(null, "Failed to Logout"), this);
    // TODO localization: session.on("logout_error", alert.bind(null, L("logoutError")), this);
    
};

function close(session, indicator)
{
	session.off(null, null, this);
}

function postFilter(collection)
{
	return collection.where({owner: Alloy.Models.Session.get("username")});
}

function updateWaiting(session, indicator)
{
	if(session.get("lock"))
        indicator.show();
    else
        indicator.hide();
}

function settings()
{
	Alloy.createController("settings");
}

function chooseStream()
{
    Ti.App.Properties.setString("stream", "stream");
    L("txt_stream");
    getStream();
}

function chooseActivity()
{
    Ti.App.Properties.setString("stream", "activity");
	L("txt_activity");
    getStream();
}

function chooseMentions()
{
    Ti.App.Properties.setString("stream", "mentions");
    L("txt_mentions");
    getStream();
}

function chooseFollowedTags()
{
    Ti.App.Properties.setString("stream", "followed_tags");
    L("txt_followedtags");
    getStream();
}

function inviteSuccess(e)
{
    var m = /id=\"invite_code\".*value=\"(.*)\".[^>]/i;
    var res = String(e).match(m);

    Ti.App.Properties.setString("invitelink", res[1]);
    sendMail();
};

function inviteError(e)
{
    // do nothing
};

function invite(e)
{
    if (Ti.App.Properties.getString("invitelink") === "") {
        require("/api").createAPI({
            type : "GET", 
            url : "/users/invitations", 
            success : inviteSuccess, 
            error : inviteError, 
            noJSON : true
        });
    }
    // https://joindiaspora.com/users/invitations
};

function sendMail()
{
    var emailDialog = Ti.UI.createEmailDialog();
    emailDialog.subject = "Hello from Diaspora";
    emailDialog.messageBody = L("txt_invite_email") + " " + Ti.App.Properties.getString("invitelink");
    emailDialog.open();
};

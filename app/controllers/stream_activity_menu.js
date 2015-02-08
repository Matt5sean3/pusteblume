var args = arguments[0] || {};

function StreamActivityMenu(args, window, container, usernameLabel, userImage, viewOptionLabels, inviteLabel, settingsButton, closeButton)
{
    this.window = window;
	this.userImage = userImage;
	this.userImage.image = Ti.App.Properties.getString("userThumbnail");
	this.getStream = args.getStream;
	this.streamLabel = args.streamLabel;
	
	this.usernameLabel = usernameLabel;
	this.usernameLabel.text = Ti.App.Properties.getString("fullName");
	
	this.container = container;
	this.viewOptions = viewOptionLabels;
	this.inviteLabel = inviteLabel;
	this.settingsButton = settingsButton;
	this.closeButton = closeButton;
	
    for(var c = 0; c < this.viewOptions.length; c++)
    {
        this.viewOptions[c].addEventListener("click", this.chooseStream.bind(this));
    }
    this.inviteLabel.addEventListener("click", this.invite.bind(this));
    this.settingsButton.addEventListener("click", this.openSettingsController.bind(this));
    this.closeButton.addEventListener("click", this.animateExit.bind(this));
    this.window.open();
    this.animateEnter();
}

StreamActivityMenu.prototype.animateEnter = function(e)
{
    var ani = Ti.UI.createAnimation();
    // show menu
    ani.left = 0;
    ani.duration = 200;
    this.container.animate(ani);
};

StreamActivityMenu.prototype.animateExit = function(e)
{
    var ani = Ti.UI.createAnimation();
    // hide menu
    ani.left = -200;
    ani.duration = 200;
    this.container.animate(ani);
    ani.addEventListener("complete", this.window.close.bind(this.window));
};

StreamActivityMenu.prototype.chooseStream = function(e)
{
    var txt = "stream";
    if (e.source.optionID === 0) {
        txt = "stream";
        this.streamLabel.text = L("txt_stream");
    } else if (e.source.optionID == 1) {
        txt = "activity";
        this.streamLabel.text = L("txt_activity");
    } else if (e.source.optionID == 2) {
        txt = "mentions";
        this.streamLabel.text = L("txt_mentions");
    } else if (e.source.optionID == 3) {
        txt = "followed_tags";
        this.streamLabel.text = L("txt_followedtags");
    }

    Ti.App.Properties.setString("stream", txt);

    // get new stuff
    this.getStream();
    txt = null;

    // hide menu
    this.animateExit();
};

StreamActivityMenu.prototype.inviteSuccess = function(e)
{
    var m = /id=\"invite_code\".*value=\"(.*)\".[^>]/i;
    var res = String(e).match(m);

    Ti.App.Properties.setString("invitelink", res[1]);
    this.sendMail();
};

StreamActivityMenu.prototype.inviteError = function(e)
{
    // do nothing
};

StreamActivityMenu.prototype.invite = function(e)
{
    if (Ti.App.Properties.getString("invitelink") === "") {
        require("/api").createAPI({
            type : "GET", 
            url : "/users/invitations", 
            success : this.inviteSuccess.bind(this), 
            error : this.inviteError.bind(this), 
            noJSON : true
        });
    } else {
        // send mail
        this.sendMail();
    }

    // https://joindiaspora.com/users/invitations
};

StreamActivityMenu.prototype.sendMail = function()
{
    var emailDialog = Ti.UI.createEmailDialog();
    emailDialog.subject = "Hello from Diaspora";
    emailDialog.messageBody = L("txt_invite_email") + " " + Ti.App.Properties.getString("invitelink");
    emailDialog.open();
};


StreamActivityMenu.prototype.openSettingsController = function(e)
{
    Alloy.createController("settings");
};

var menu = new StreamActivityMenu(args, $.window, $.view_menu_stream, $.lbl_me, $.img_me, [$.lbl_option1, $.lbl_option2, $.lbl_option3, $.lbl_option4], $.lbl_invite, $.btn_settings, $.btn_close);

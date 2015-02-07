var args = arguments[0] || {};
var data = [];

function LoginPage(window, session, username_input, password_input, login_button, register_button, waiting_label)
{
    this.window = window;
	this.session = session;
    this.username = username_input;
    this.password = password_input;
    this.waiting = waiting_label;
    this.btn_login = login_button;
    this.btn_register = register_button;
    
    this.bindTextField(this.session, "username", username_input);
    this.bindTextField(this.session, "password", password_input);
    // After updating to the default values, check validity
    this.updateValidity();
	// The amount of code in the controller file should be majorly reduced
    this.btn_login.addEventListener("click", this.login.bind(this));
    if(this.btn_register)
      this.btn_register.addEventListener("click", this.openRegisterController.bind(this));
    this.window.addEventListener("open", this.open.bind(this));
    this.window.addEventListener("close", this.close.bind(this));
    this.window.open();
}

LoginPage.prototype.bindTextField = function(model, parameter, field)
{
	// Set the pre-existing value
	var onBlur, onChange;
	field.setValue(model.get(parameter));
	onBlur = function(e)
	{
		// Shouldn't cause an infinite loop anyway but just making sure.
		model.off("change:" + parameter, onChange, this);
		model.set(parameter, e.value);
		model.on("change:" + parameter, onChange, this);
	};
	onChange = function()
	{
		field.setValue(model.get(parameter));
	};
	field.addEventListener("blur", onBlur);
	model.on("change:" + parameter, onChange, this);
};
// Used to bind event listeners for this view to the user object
LoginPage.prototype.open = function(e)
{
    // Need a corresponding action in the window's destructor
    this.session.on("change", this.updateReady, this);
    this.session.on("change:lock", this.updateWaiting, this);
    
    this.session.on("login_token_start", this.waiting.setMessage.bind(this.waiting, L("getToken")), this);
    this.session.on("login_token_error", alert.bind(null, L("noToken")), this);
    this.session.on("login_start", this.waiting.setMessage.bind(this.waiting, L("login")), this);
    this.session.on("login_success", this.window.close.bind(this.window), this);
    this.session.on("login_error", alert.bind(null, L("error")), this);
	// TODO add more specific localizations and change naming
    //this.session.on("login_token_start", this.waiting.setMessage.bind(this.waiting, L("login_token_start")), this);
    //this.session.on("login_token_success", this.waiting.setMesssage.bind(this.waiting, L("login_token_success")), this);
    //this.session.on("login_token_error", alert.bind(null, L("login_token_error")), this);
    //this.session.on("login_error", alert.bind(null, L("login_error")), this);
    //this.session.on("login_start", this.waiting.setMessage.bind(this.waiting, L("login_start")), this);
    this.updateWaiting();
};
// Used to remove all the event listeners for this view from the user object
LoginPage.prototype.close = function(e)
{
	this.session.off(null, null, this);
};
// Initiates the login process given the conditions are okay
LoginPage.prototype.login = function()
{
	// Start down the path toward retrieving the token
	if(this.session.isValid())
	    this.session.retrieveLoginToken();
};
// Update the view based on whether logging in can start
LoginPage.prototype.updateReady = function()
{
	this.loginButton.setTouchEnabled(this.session.isValid());
};
// Update the view based on whether waiting for requests to complete
LoginPage.prototype.updateWaiting = function()
{
	var lockStatus = this.session.get("lock");
	this.username.blur();
	this.username.setTouchEnabled(!lockStatus);
	this.password.blur();
	this.password.setTouchEnabled(!lockStatus);
	// Reveal waiting while the username and password are disabled
	if(lockStatus)
        this.waiting.show();
    else
        this.waiting.hide();
};
// Opens the registration page
LoginPage.prototype.openRegisterController = function()
{
    var win = Alloy.createController("register", {
        username : this.username
    }).getView();
    win.open();
};

var page = new LoginPage($.window, Alloy.Models.Session, $.username, $.password, $.btn_login, null, $.waiting);
// Brought the login page down to 113 LOC.


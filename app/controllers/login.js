var args = arguments[0] || {};
var data = [];

function LoginPage(window, username_input, password_input, login_button, register_button, waiting_label)
{
    this.window = window;
    this.username = username_input;
    this.password = password_input;
    this.waiting = waiting_label;
    this.btn_login = login_button;
    this.btn_register = register_button;

    if(this.username)
      this.username.value = Ti.App.Properties.getString("username");
    if(this.btn_login)
      this.btn_login.addEventListener("click", this.attemptLogin.bind(this));
    if(this.btn_register)
      this.btn_register.addEventListener("click", this.openRegisterController.bind(this));
//    this.window.open();
}

LoginPage.prototype.getToken = function()
{
    // get token
    //
    require("/api").createAPI({
        type : "GET", 
        url : "/users/sign_in", 
        success : this.tokenSuccess.bind(this), 
        error : this.tokenError.bind(this), 
        noJSON : true
    });
};

LoginPage.prototype.tokenSuccess = function(e)
{
    // extract token
    //
    var m = /.*authenticity_token.*value=\"(.*)\"/;
    var res = String(e).match(m);
    Ti.App.Properties.setString("token", res[1]);

    this.waiting.message = L("login");
    require("/api").createAPI({
        type : "POST", 
        url : "/users/sign_in", 
        success : this.loginSuccess.bind(this), 
        error : this.loginError.bind(this), 
        login : true, 
        noJSON : true, 
        parameter : {
            "utf8" : "✓", 
            "user[username]" : this.username.value.split("@")[0], 
            "user[password]" : this.password.value, 
            "commit" : "Sign in", 
            "user[remember_me]" : 1, 
            "authenticity_token" : Ti.App.Properties.getString("token")
        }
    });
};

LoginPage.prototype.tokenError = function()
{
    alert(L("noToken"));
    this.waiting.hide();
    this.btn_login.enabled = true;
};

LoginPage.prototype.attemptLogin = function()
{
    if (this.username.value == "" || this.password.value == "")
    {
        alert(L("fieldEmpty"));
        return;
    }
    if (String(this.username.value).indexOf("@") <= 0)
    {
        alert(L("setUsername"));
        return;
    }

    Ti.App.Properties.setString("pod", "https://" + this.username.value.split("@")[1]);

    this.getToken();
    this.waiting.message = L("getToken");
    this.waiting.show();
    this.password.blur();
    this.username.blur();
    this.btn_login.enabled = false;
};

LoginPage.prototype.loginSuccess = function()
{
    this.waiting.hide();
    Ti.App.Properties.setString("username", this.username.value);
    Ti.App.Properties.setBool("loggedIn", true);
    args.getToken();
    args.getStream();
    args.getUserInfo();
    this.window.close();
    this.btn_login.enabled = true;
};

LoginPage.prototype.loginError = function()
{
    this.waiting.hide();
    this.btn_login.enabled = true;
    Ti.App.Properties.setBool("loggedIn", false);
    alert(L("error"));
};

LoginPage.prototype.openRegisterController = function()
{
    var win = Alloy.createController("register", {
        username : this.username
    }).getView();
    win.open();
};

var page = new LoginPage($.window, $.username, $.password, $.btn_login, null, $.waiting);

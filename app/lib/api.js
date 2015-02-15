// API file
//
// handles all REST connections and returns json or webpages
//

exports.createAPI = function(opt) {
    return new API(opt);
};

function API(opt) {
    var url = opt.url;
    var type = opt.type;
    var success = (opt.success) ? opt.success : null;
    var error = (opt.error) ? opt.error : null;
    var parameter = {};
    for (var obj in opt.parameter) {
        parameter[obj] = opt.parameter[obj];
    };
    var para = parameter;
    var timeout = (opt.timeout) || 8000;
    var xhr = Ti.Network.createHTTPClient({
        onreadystatechange: function(e) {
            // log output
            try {
                //Ti.API.info(JSON.stringify(e));
            } catch (e) {}

        },
        onerror: function(e) {
            // error message
            try {
                var obj = JSON.parse(this.responseText);
                if (obj.error != "") {
                    alert(obj.error);
                } else {
                    alert("error");
                }
            } catch (e) {

            }

            //Ti.API.info(this.responseText);
            if (error)
                error(this.responseText);

        },
        onload: function(e) {
            // webpage loaded
            //
            if (this.readyState === 4) {
                // download done
                try {
                    //Ti.API.info(JSON.stringify(e));
                } catch (e) {}
                if (this.getResponseHeader("Set-Cookie") != "") {
                    Ti.App.Properties.setString("cookie_session", this.getResponseHeader("Set-Cookie"));
                } else {
                    // Ti.API.info("empty cookie");
                }
                if (opt.noJSON) {
                    // return plain text
                    data = this.responseText;
                } else {
                    // return json
                    data = JSON.parse(this.responseText);
                }
                if (success)
                    success(data);
            }
        },
        timeout: timeout
    });

    xhr.autoEncodeUrl = false;
    xhr.validatesSecureCertificate = false;
    xhr.autoRedirect = true;

    if (Ti.Network.online) {

        Ti.API.info(Ti.App.Properties.getString("pod") + url);
        xhr.open(type, Ti.App.Properties.getString("pod") + url);

        // generate header
        //
        if (!opt.noJSON) {
            xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
        } else {
            xhr.setRequestHeader("Accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        }
        if (opt.isBinary) {
            // binary upload
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.setRequestHeader('X-File-Name', opt.filename);
            para = opt.parameter.data;
        }

        if (opt.login) {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Content-length', (String(JSON.stringify(para)).length));
        }

        // set cookie
        if (Ti.App.Properties.getString("cookie_session") != "") {
            xhr.setRequestHeader('Cookie', Ti.App.Properties.getString("cookie_session"));
        }

        if (opt.token) {
            xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
            xhr.setRequestHeader('X-CSRF-Token', Ti.App.Properties.getString("token"));
        }

        if (opt.postJSON) {
            // use plain json as parameter
            xhr.setRequestHeader('Content-Type', "application/json; charset=UTF-8");
            para = JSON.stringify(opt.parameter);
            var str = String(para).replace(/\\/gi, "");
            xhr.setRequestHeader('Content-length', String(str).length);
            para = str;
        }

        xhr.send(para);

    }
}

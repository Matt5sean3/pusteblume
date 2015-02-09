// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

Alloy.Globals.formatDate = function(date) {
    // formate date and return it
    //
    var dat = new Date(date);

    var h = dat.getHours();
    var m = dat.getMinutes();
    var d = dat.getDate();
    var mon = dat.getMonth() + 1;
    if (h < 10)
        h = "0" + h;
    if (m < 10)
        m = "0" + m;
    if (d < 10)
        d = "0" + d;
    if (mon < 10)
        mon = "0" + mon;

    return h + ":" + m + " - " + d + "." + mon + "." + String(dat.getFullYear()).substr(2);
};

Alloy.Globals.replaceText = function(txt) {
    // replace names
    var match = /@{(.[^;]*);(.[^}]*)}/ig;
    txt = txt.replace(match, "$1");

    //replace links
    match = /!{0,1}\[(.[^\]]*)\]\((.[^\)]*)\)/ig;
    txt = txt.replace(match, "<a href='$2'>$1</a>");

    // headlines 1
    match = /(\n|^)#{3} (.[^\n]+)\n/ig;
    txt = txt.replace(match, "<h3>$2</h3>");

    // headlines 2
    match = /(\n|^)#{2} (.[^\n]+)\n/ig;
    txt = txt.replace(match, "<h2>$2</h2>");

    // headlines 3
    match = /(\n|^)#{1} (.[^\n]+)\n/ig;
    txt = txt.replace(match, "<h1>$2</h1>");

    // bold italic
    match = /(\n|^|\s)\*{3}(.[^\s\*]+)\*{3}\s/ig;
    txt = txt.replace(match, " <b><i>$2</i></b> ");
    match = /(\n|^|\s)_{3}(.[^\s_]+)_{3}\s/ig;
    txt = txt.replace(match, " <b><i>$2</i></b> ");

    // italic
    match = /(\n|^|\s)\*(.[^\s\*]+)\*\s/ig;
    txt = txt.replace(match, " <i>$2</i> ");
    match = /(\n|^|\s)_(.[^\s_]+)_\s/ig;
    txt = txt.replace(match, " <i>$2</i> ");

    // bold
    match = /(\n|^|\s)\*{2}(.[^\s\*]+)\*{2}\s/ig;
    txt = txt.replace(match, " <b>$2</b> ");
    match = /(\n|^|\s)_{2}(.[^\s]+)_{2}\s/ig;
    txt = txt.replace(match, " <b>$2</b> ");


    //replace hashtags
    /*
    match = /#([\u00C0-\u1FFF\u2C00-\uD7FF\w&]+)/ig;
    txt = txt.replace(match, "<a href='$1'>#$1</a>");*/

    //replace headline tags
    match = /(#+ )/ig;
    txt = txt.replace(match, "");

    match = /&quot;/ig;
    txt = txt.replace(match, "\"");

    match = /\n\n/ig;
    txt = txt.replace(match, "\n");




    match = /\n/ig;
    txt = txt.replace(match, "<br/>");


    match = /\(C\)/ig;
    txt = txt.replace(match, "©");
    match = /->/ig;
    txt = txt.replace(match, "→");
    match = /\:\)/ig;
    txt = txt.replace(match, "☺");
    match = /;\)/ig;
    txt = txt.replace(match, "😉");
    match = /\:\(/ig;
    txt = txt.replace(match, "😞");
    match = /\:D/ig;
    txt = txt.replace(match, "😃");
    match = /\(c\)/ig;
    txt = txt.replace(match, "©");
    match = /\(r\)/ig;
    txt = txt.replace(match, "®");
    match = /\(tm\)/ig;
    txt = txt.replace(match, "™");

    match = /<3/ig;
    txt = txt.replace(match, "❤");
    return txt;

};

function registerService() {
    // register service
    var intent = Titanium.Android.createServiceIntent({
        url : 'service_fetch.js'
    });

    var t = 10;
    if (parseFloat($.tf_interval.value) > 0) {
        t = parseFloat($.tf_interval.value);
    }
    intent.putExtra('interval', t * 60 * 1000);
    secs = null;

    if (Ti.Android.isServiceRunning(Ti.Android.createServiceIntent({
        url : "service_fetch.js"
    }))) {
        Ti.API.info("service running");
    } else {
        Ti.API.info("service NOT running");
        Titanium.Android.startService(intent);
        Ti.API.info("service started");

    }
}

function deleteService() {
    // remove service
    var intent = Ti.Android.createServiceIntent({
        url : "service_fetch.js"
    });
    Ti.Android.stopService(intent);
}

function onClickServiceStart(e) {
    Ti.API.info("register");
    registerService();
    $.lbl_service.text = L("stopservice");
    $.lbl_service.removeEventListener("click", onClickServiceStart);
    $.lbl_service.addEventListener("click", onClickServiceStop);
}

function onClickServiceStop(e) {
    Ti.API.info("remove");
    deleteService();
    $.lbl_service.text = L("startservice");
    $.lbl_service.addEventListener("click", onClickServiceStart);
    $.lbl_service.removeEventListener("click", onClickServiceStop);
}

function onClickClose(e) {
    $.settings.close();
}

if (Ti.Android.isServiceRunning(Ti.Android.createServiceIntent({
    url : "service_fetch.js"
}))) {
    $.lbl_service.text = L("stopservice");
    $.lbl_service.addEventListener("click", onClickServiceStop);
} else {
    $.lbl_service.text = L("startservice");
    $.lbl_service.addEventListener("click", onClickServiceStart);
}

function onTouchStart(e) {
    e.source.color = "#fff";
}

function onTouchEnd(e) {
    e.source.color = "#bbb";
}

$.btn_close.addEventListener("click", onClickClose);

$.btn_close.addEventListener("touchstart", onTouchStart);
$.btn_close.addEventListener("touchend", onTouchEnd);

$.settings.open();

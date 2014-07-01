/*
 * Revel Systems Online Ordering Application
 *
 *  Copyright (C) 2014 by Revel Systems
 *
 * This file is part of Revel Systems Online Ordering open source application.
 *
 * Revel Systems Online Ordering open source application is free software: you
 * can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Revel Systems Online Ordering open source application is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Revel Systems Online Ordering Application.
 * If not, see <http://www.gnu.org/licenses/>.
 */

/*
* Constants
*/

var array_day_of_week = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");

var array_month = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

var MonthByStr = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12};

// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
var EMAIL_VALIDATION_REGEXP = /^[^\s@;]+@[^\s@;]+$/; ///^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

var ERROR = {},
    MSG = {};

//write errors here
ERROR.STORE_IS_CLOSED = "Error: Store is closed";
ERROR.BLOCK_STORE_IS_CLOSED = "We're sorry, your order cannot be processed because the store is closed";
ERROR.FORCED_MODIFIER = "Please select at least one modifier in: ";
ERROR.SELECT_SIZE_MODIFIER = "Select a size please";
ERROR.SELECT_PRODUCT_ATTRIBUTES = "Please select all attributes";
ERROR.BLOCK_WEIGHT_IS_NOT_VALID = "The product weight is not set or zero";

//write messages here
MSG.ERROR_STORE_IS_CLOSED = "We're sorry, your order cannot be processed because the store is closed for selected pickup day/time";
MSG.ERROR_GEOLOCATION = [ "There was an error while retrieving your location.",
                          "Your current location retrieval is disallowed. Reset location settings if you want to allow it.",
                          "The browser was unable to determine your location.",
                          "The browser timed out while retrieving your location." ];
MSG.ERROR_GEOLOCATION_NOAPI = "Geolocation API is not supported in your browser.";
MSG.ERROR_SUBMIT_ORDER = "Failed to submit an order. Please try again.";
MSG.ERROR_ORDERS_PICKUPTIME_LIMIT = "Maximum number of orders for this pickup time exceeded. Please select different pickup time.";
MSG.ERROR_INSUFFICIENT_STOCK = "Some products have insufficient stock.";
MSG.ERROR_OCCURRED = "Error occurred: ";
MSG.ERROR_MIN_ITEMS_LIMIT = "Please select at least %s items to place an order.";
MSG.ERROR_INCORRECT_AJAX_DATA = "Incorrect data in server responce.";
MSG.ERROR_SERVER_UNREACHED = 'The server cannot be reached at this time.';
MSG.ERROR_DELIVERY_ADDRESS_INPUT = "The following necessary fields are blank: %s";
MSG.ERROR_DELIVERY_EXCEEDED = "Exceeded maximum delivery distance";
MSG.ERROR_DELIVERY_ADDRESS = "Couldn't verify delivery address";
MSG.ERROR_CATEGORY_LOAD = 'Unable to get the menu from backend. Now the page is reloaded';
MSG.ERROR_MODIFIERS_LOAD = 'Unable to get the list modifiers of product from backend. Now the page is reloaded.';
MSG.ERROR_RECENT_LOAD = 'Unable to get a list of recent orders.';
MSG.ERROR_PRODUCTS_LOAD = 'Unable to get the list products of menu from backend. Now the page is reloaded.';
MSG.ERROR_STORES_LOAD = 'Unable to get the list of stores.';
MSG.DELIVERY_ITEM = 'Delivery Charge';
MSG.BAG_CHARGE_ITEM = 'Bag Charge';
MSG.REPEAT_ORDER_NOTIFICATION = "Some items have changed or no longer available. Please review items before placing your order.";
MSG.REWARD_CARD_UNDEFINED = "Invalid Reward Card Number.";
MSG.ADD_MORE_FOR_DELIVERY = "Please add %s more for delivery";
MSG.ERROR_PRODUCT_NOT_SELECTED = "You have not selected any product";
MSG.ERROR_EMPTY_NOT_VALID_DATA = "Following required fields are blank or contain incorrect data: %s";
MSG.ERROR_GRATUITY_EXCEEDS = "Gratuity amount can't exceed the receipt amount";
MSG.ERROR_CARD_EXP = "Exp. Date less then current date";
MSG.ERROR_FORCED_MODIFIER = "This modifier is required";
MSG.ERROR_CHROME_CRASH = "This version of Chrome is unstable and unsupported. Please update to the latest version or use different browser.";
MSG.ERROR_UNSUPPORTED_BROWSER = "The current browser version is not supported. Please update it to the latest release.";
MSG.PAY_AT_STORE = "Pay at Store";
MSG.PAY_AT_DELIVERY = "Pay at Delivery";
MSG.ERROR_GET_CHILD_PRODUCTS = "Unable to get the information about the product from backend. Now the page is reloaded.";

// Dining options
var DINING_OPTION = {
        DINING_OPTION_TOGO : 0,
        DINING_OPTION_EATIN : 1,
        DINING_OPTION_DELIVERY : 2,
        DINING_OPTION_CATERING : 3,
        DINING_OPTION_DRIVETHROUGH : 4,
        DINING_OPTION_ONLINE : 5,
        DINING_OPTION_OTHER : 6,
        DINING_OPTION_DELIVERY_SEAT: 0
    };

/**
*  format message by formatting string and params.
*  example: msgFrm("Message text param1 = %s, param2 = %s", 10, 20) returns the string "Message text param1 = 10, param2 = 20"
*/
function msgFrm(msg_format) {
    var args = arguments,
        newStr, index = 1;

    newStr = msg_format.replace(/(%s)/g, function(str, p1){
        return str.replace(p1, args[index++] );
    });

    return newStr;
}

/**
 * Get GET-parameters from address line.
 */
function parse_get_params() {
    var $_GET = {};
    var __GET = window.location.search.substring(1).split("&");
    for (var i = 0; i < __GET.length; i++) {
        var get_var = __GET[i].split("=");
        $_GET[get_var[0]] = typeof(get_var[1]) == "undefined" ? "" : get_var[1];
    }
    return $_GET;
}
/**
 * Load styles and scripts.
 */
function load_styles_and_scripts() {
    var i, scripts,
        skin = App.Data.settings.get("skin"),
        styles = App.Data.settings.get("settings_skin").styles;
    for (i = 0; i < styles.length; i++) {
        $('head').append('<link rel="stylesheet" href="skins/' + skin + "/" + styles[i] + '" type="text/css" />');
    }
    scripts = App.Data.settings.get("settings_skin").scripts;
    for (i = 0; i < scripts.length; i++) {
        $.ajax({
           dataType : 'script',
           url : "skins/" + skin + '/' + scripts[i],
           success : function() {
           }
        });
    }
}
/**
 * Check object (empty or not empty).
 */
function empty_object(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}

// returns cookie if it exists or undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
/**
 * Formatting a date in the format "YYYY-MM-DDTHH:MM:SS".
 */
function format_date_1(date) {
    return (new Date(date)).toISOString().replace(/\..*$/, '');
}
/**
 * Formatting a date in the format "MM/DD/YYYY HH:MM(am/pm)".
 */
function format_date_2(date) {
    var js_date = new Date(date);
    var current_date_year = js_date.getFullYear();
    var current_date_month = js_date.getMonth() + 1;
    if (current_date_month < 10) current_date_month = "0" + current_date_month;
    var current_date_day = js_date.getDate();
    if (current_date_day < 10) current_date_day = "0" + current_date_day;
    var current_date_hours = js_date.getHours();
    var am_pm = current_date_hours > 11 ? "pm" : "am";
    current_date_hours = current_date_hours > 12 ? current_date_hours - 12 : current_date_hours;
    if (current_date_hours == 0) {
       current_date_hours = 12;
    }
    var current_date_minutes = js_date.getMinutes();
    if (current_date_minutes < 10) current_date_minutes = "0" + current_date_minutes;
    var result = current_date_month + "/" + current_date_day + "/" + current_date_year + " " + current_date_hours + ":" + current_date_minutes + am_pm;
    return result;
}
/**
 * Formatting a date in the format "(Yesterday/Today/Tomorrow) at HH:MM(am/pm) | MONTH DD(st/nd/rd/th) at HH:MM(am/pm)".
 */
function format_date_3(date) {
    var result = "";
    var now = App.Data.timetables.base();
    var date_1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var js_date = new Date(date);
    var date_2 = new Date(js_date.getFullYear(), js_date.getMonth(), js_date.getDate());
    var seconds_in_day = 86400000;
    var time_difference = date_2 - date_1;
    if (time_difference == 0) {
        result += "Today";
    }
    else if (time_difference == -seconds_in_day) {
        result += "Yesterday";
    }
    else if (time_difference == seconds_in_day) {
        result += "Tomorrow";
    }
    else {
        var array_month = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
        var current_date_month = js_date.getMonth() + 1;
        var current_date_day = js_date.getDate();
        result += array_month[current_date_month-1] + " " + current_date_day;
        switch (current_date_day) {
            case 1:
                result += "st";
                break;
            case 2:
                result += "nd";
                break;
            case 3:
                result += "rd";
                break;
            default:
                result += "th";
                break;
        }
    }
    var current_date_hours = js_date.getHours();
    var am_pm = current_date_hours > 11 ? "pm" : "am";
    current_date_hours = current_date_hours > 12 ? current_date_hours - 12 : current_date_hours;
    if (current_date_hours == 0) {
       current_date_hours = 12;
    }
    var current_date_minutes = js_date.getMinutes();
    if (current_date_minutes < 10) current_date_minutes = "0" + current_date_minutes;
    result += " at " + current_date_hours + ":" + current_date_minutes + am_pm;
    return result;
}
/**
 * Load data from storage (cookie, sessionStorage, localStorage).
 */
function getData(name, local) {
     var data;

     switch (App.Data.settings.get('storage_data')) {
        case 1:
            if(local && localStorage instanceof Object && localStorage[name])
                data = JSON.parse(localStorage[name]);
            else if (sessionStorage instanceof Object && sessionStorage[name])
                data = JSON.parse(sessionStorage[name]);
            else
                data = undefined;
            break;
        case 2:
            if (getCookie(name)) {
                data = JSON.parse(getCookie(name));
            }
            else {
                data = undefined;
            }
            break;
    }
    return data;
}
/**
 * save data to storage (coockie or sessionStorage)
 * Return true if successfully saved
 */
function setData(name, data, local) {
    switch (App.Data.settings.get('storage_data')) {
        case 1:
            if(local && localStorage instanceof Object)
                localStorage[name] = JSON.stringify(data.toJSON());
            else
                if (sessionStorage instanceof Object)
                    sessionStorage[name] = JSON.stringify(data.toJSON());
            break;
        case 2:
            document.cookie += name + '=' + JSON.stringify(data.toJSON());
            break;
    }
    return true;
}
/**
 * Helper of template.
 */
function template_helper(name,mod) {
    var id;
    if(mod) {
        id = "#" + name + "_" + mod + "-template";
    }
    else {
        id = "#" + name + "-template";
    }
    return _.template($(id).html());
}
/**
 * Helper of template for paypal.
 */
function template_helper2(name) {
    return _.template($('#' + name).html());
}
/**
 * User notification.
 * options: {
 *     message - alert message
 *     reload_page - if true - reload page after press button
 *     is_confirm - true if confirm message
 *     confirm - object with confirm messages (two button): {
 *         ok - text in ok button,
 *         cancel - text in cancel button,
 *         cancel_hide - hide cancel button
 *     callback - callback for confirm messages
 */
function jq_alert_message(options) {
    if (options.is_confirm) {
        var confirm = options.confirm || {};
        jConfirm(options.message, confirm.ok || 'OK', confirm.cancel || 'Cancel', options.callback);
        confirm.cancel_hide && $('#popup_cancel').hide();
    } else {
        jAlert(options.message, "OK");
    }
    var wnd_width = $( window ).width(),
        wnd_height =  $( window ).height(),
        alert = $("#popup_container"),
        border_width = alert.outerWidth() - alert.width(),
        min_width = wnd_height > wnd_width ? wnd_width : wnd_height;

    min_width -= border_width;

    if (alert.width() < min_width) {
        alert.css("min-width", alert.width());
    } else {
        alert.css("min-width", min_width);
    }

    position_alert();

    $("#popup_panel input").click(function() {
        $( window ).off("resize", position_alert );
        if (options.reload_page) {
            location.reload();
        }
    });

    $( window ).on("resize", position_alert );
}

function position_alert() {
    var wnd = $( window ),
        alert = $("#popup_container"),
        alert_content = $('#popup_content'),
        left = ( wnd.width() / 2 ) - ( alert.outerWidth() / 2 ),
        top;

    if(/iPad;.*CPU.*OS 7_\d/i.test(window.navigator.userAgent)) {
        top = ( window.innerHeight / 2 ) - ( alert_content.outerHeight(true) / 2 ) - (window.outerHeight - window.innerHeight) / 2;
    } else {
        top = ( wnd.height() / 2 ) - ( alert_content.outerHeight(true) / 2 );
    }

    top = top > 0 ? top : 0;
    left = left > 0 ? left : 0;

    alert.css( {
      'left': left,
      'top': top,
      'right': left,
      'bottom': top
    });
}

function alert_message(options) {
    if (App.Data.settings.get && App.Data.settings.get("skin") == "weborder") {
        tmpl_alert_message(options);
    } else {
        jq_alert_message(options);
    }
}

/**
 * User customized alerts for weborder skin.
 * options: {
 *     message - alert message
 *     reload_page - if true - reload page after press button
 *     is_confirm - true if confirm message
 *     confirm - object with confirm messages (two button): {
 *         ok - text in ok button,
 *         cancel - text in cancel button,
 *         cancel_hide - hide cancel button
 *     callback - callback for confirm messages
 */
function tmpl_alert_message(options) {
    var alert = $('#alert'),
        confirm = options.confirm || {};

    if ($("#alert-template").length == 0) {
        jq_alert_message(options);
    }
    if (alert.length == 0) {
        alert = $("<div id='alert'></div>").appendTo("body");
    }

    var data = {
        btnText1: confirm.ok || "OK",
        btnText2: confirm.cancel || "Cancel",
        icon_type: options.is_confirm ? "warning" : options.type || "info",
        message: options.message || "No alert message",
        is_confirm: options.is_confirm
    };

    var tmpl = template_helper2("alert-template");
    alert.html(tmpl(data));
    alert.addClass('ui-visible');
    $(".alert_block").addClass("alert-background");

    $(".btnOk,.btnCancel,.cancel", alert).on("click", function() {
        $(".alert_block").removeClass("alert-background");
        alert.removeClass('ui-visible');
        if (options.reload_page) {
            location.reload();
        }
    });
    if (options.is_confirm === true) {
        $(".btnOk", alert).on("click", function() {
            if(options.callback)
                options.callback(true);
        });
        $(".btnCancel,.cancel", alert).on("click", function() {
            if(options.callback)
                options.callback(false);
        });
        confirm.cancel_hide && $(".btnCancel", alert).hide();
    }
}
/**
 * Generate the random number.
 */
function generate_random_number(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = rand ^ 0;
    return rand;
}
/**
 * Rounding monetary currency.
 */
function round_monetary_currency(value, precision, up) {
    precision = precision || 2;
    var val = Math.floor(value * Math.pow(10, precision)) / Math.pow(10, precision),
        delta = value * Math.pow(10, precision + 2) - val * Math.pow(10, precision + 2),
        result;
    if(delta > 49 || (delta === 49 && up)) {
        result = val + 1 / Math.pow(10, precision);
    } else {
        result = val;
    }
    return result.toFixed(2);
}


/**
 *  Sync load template
 */

function loadTemplate2(name,file) {
    if (!App.Data.loadModelTemplate) {
        App.Data.loadModelTemplate = {};
    }
    if (!App.Data.loadModelTemplate.count) {
        App.Data.loadModelTemplate.count = 0;
    }
    if (loadTemplate2[file] === undefined) {
        App.Data.loadModelTemplate.dfd = $.Deferred();
        App.Data.loadModelTemplate.count++;
        $.ajax({
            url: App.Data.settings.get('skinPath') + "/template/" + file + ".html",
            dataType: "html",
            success : function(data) {
                $("head").append(data);
                App.Data.loadModelTemplate.count--;
                if (App.Data.loadModelTemplate.count === 0) {
                    App.Data.loadModelTemplate.dfd.resolve();
                }
            }
        });
    }
    loadTemplate2[file] = true;
}
/**
 * load template
 */
function loadTemplate(name,file) {
    var dfd = $.Deferred();
    if ($("#" + name).length === 0) {
        $.ajax({
            url: App.Data.settings.get('skinPath') + "/template/" + file + ".html",
            dataType: "html",
            success: function(data) {
                $("head").append(data);
                dfd.resolve();
            }
        });
    }  else {
        dfd.resolve();
    }
    return dfd;
}

/**
 * Calls callback after template is loaded
 */
function processTemplate(templateLoad, callback) {
    if (templateLoad) {
        templateLoad.then(callback);
    } else {
        callback();
    }
}

/**
 * Include CSS file
 */
function loadCSS(name) {
    if ($('link[href="' + name + '.css"]').length === 0) {
        $('head').append('<link rel="stylesheet" href="' + name + '.css" type="text/css" />');
    }
}

/**
 * Include common CSS file
 */
function loadCommonCSS(name) {
    if ($('link[href="' + name + '.css"]').length === 0) {
        $('head').append('<link rel="stylesheet" href="' + name + '.css" type="text/css" />');
    }
}

/**
 * Set page title
 */
function pageTitle(title) {
    $("head title").html(title);
}

function isNumber(num) {
    return typeof(num) === 'number' || num instanceof Number;
}

/*
*  TimeFrm 'class'.
*  This class is created for time strings convertation from 24-hour format to USA format and back.
*  The internal state value is minutes. You can update the minutes (set_minutes func.) and get updated time strings in desired format.
*  Please use/modify time_TimeFrm.html(js) file to test the class when new modifications is applied.
*/

function TimeFrm(hour, min, frm_type){
    var def = {
        minutes: 0,
        frm_type: '24hour' // or usa
    };

    $.extend(this, def);

    if ( isNumber(hour) && isNumber(min) ) {
        this.minutes = hour * 60 + min;
    }

    if (typeof(frm_type) === 'string') {

       this.frm_type = frm_type;
    }
}

/*
*  Function: load_from_str
*
*/
TimeFrm.prototype.load_from_str = function(time_str) {
    if (typeof this.load_from_str_ft[ this.frm_type ] === 'function' && typeof time_str === 'string')
    {
        this.load_from_str_ft[ this.frm_type ].call(this, time_str);
    }
    return this;
};

/* private functions load_from_str_ft */
TimeFrm.prototype.load_from_str_ft = { };

TimeFrm.prototype.load_from_str_ft['24hour'] = function(time_str) {
    var time, hour, min;

    time = time_str.split(":");

    hour = 1 * time[0].match(/\d{1,2}$/);
    if (hour > 23) {
        return this;
    }

    min = 1 * time[1].match(/^\d{1,2}/);
    if (min > 59) {
        return this;
    }

    this.minutes = hour * 60 + min;

    return this;
};

//this is for future, not tested yet:
TimeFrm.prototype.load_from_str_ft['usa'] = function(time_str) {
    var time, hour, min, am_pm,
        hour_from_midnight;

    time = time_str.split(":");

    hour = parseInt(time[0].match(/\d{1,2}$/));
    if (isNaN(hour) || hour > 12 || hour === 0) {
        return this;
    }

    min = parseInt(time[1].match(/^\d{2}/));
    if (isNaN(min) || min > 59) {
        return this;
    }

    am_pm = time[1].match(/^\d{2}\s*(.{2})\s*/)[1];
    am_pm = am_pm.toUpperCase();

    if (am_pm === 'PM') {
        hour_from_midnight = (hour === 12) ? hour : hour + 12;
    } else if (am_pm === 'AM') {
        hour_from_midnight = (hour === 12) ? 0 : hour;
    } else {
        return this;
    }

    this.minutes = hour_from_midnight * 60 + min;

    return this;
};
/**
 * Output of time in requirement format.
 */
TimeFrm.prototype.toString = function(frm_type) {
    if (typeof frm_type === 'undefined') {
        frm_type = this.frm_type;
    }
    if (typeof this.toString_ft[ frm_type ] === 'function')
    {
        return this.toString_ft[ frm_type ].call(this);
    }
    return '';
};

/* private functions toString_ft */
TimeFrm.prototype.toString_ft = { };

TimeFrm.prototype.toString_ft['usa'] = function() {
    /* it outputs the time in format 10:01am or 12:45pm */

    var hour = parseInt( this.minutes / 60 ),
        minutes = this.minutes % 60;
        hour = hour - parseInt( hour / 24) * 24;

    var am_pm = hour > 11 ? "pm" : "am";

    if (hour > 12) {
        hour = hour - 12;
    }
    else {
        if (hour === 0) {
            hour = 12;
            am_pm = "am";
        }
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var thetime = hour + ":" + minutes + am_pm;
    return thetime;
};

TimeFrm.prototype.toString_ft['24hour'] = function() {

    var hour = parseInt( this.minutes / 60 ),
        minutes = this.minutes % 60;
        hour = hour - parseInt( hour / 24) * 24;

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var thetime = hour + ":" + minutes;
    return thetime;
};

TimeFrm.prototype.get_minutes = function() {
    return this.minutes;
};

TimeFrm.prototype.set_minutes = function(minutes) {
    this.minutes = parseInt(minutes);
    return this;
};
/**
 * Checking version OS Android (old version is Android <= 4.2.1).
 */
function check_android_old_version(version) {
    var old_version = false;
    var android_version = version.split(".");
    if (android_version[0] <= 4) {
        if (android_version[0] == 4) {
            if (android_version[1] && android_version[1] <= 2) {
                if (android_version[1] == 2) {
                    if ((android_version[2] && android_version[2] < 2) || (!android_version[2])) {
                        old_version = true;
                    }
                }
                else {
                    old_version = true;
                }
            }
            else if (!android_version[1]) {
                old_version = true;
            }
        }
        else {
            old_version = true;
        }
    }
    return old_version;
}

/**
 * Checking if it's Android device based on WebKit.
 */
function isAndroidWebKit() {
    return /Android/i.test(navigator.userAgent) && /WebKit/i.test(navigator.userAgent);
}

/**
 * Loading img spinner
 */
function loadSpinner(logo, anim, cb) {
    anim = typeof anim == 'undefined' ? true : anim;
    if (logo.length !== 0) {
        var src = btoa(logo.attr('src') + logo.attr('alt')),
            img, spinner;
        if(src in App.Data.images)
            return logo.replaceWith(App.Data.images[src].clone());
        spinner = $('<div class="img-spinner"></div>');
        spinner.spinner();
        logo.replaceWith(spinner);
        img = logo.clone();
        img.css('display','none');
        $('body').append(img);
        img.on('load', function() { //load method - deprecated
            spinner.replaceWith(img);
            anim ? img.fadeIn() : img.show();
            App.Data.images[btoa(img.attr('src') + img.attr('alt'))] = img.clone().css('opacity', '100');
            typeof cb == 'function' && cb(img);
        }).error(function(e) {
            logo.prop('src', App.Data.settings.get_img_default(logo.attr('data-default-index')));
            spinner.replaceWith(logo);
            App.Data.images[btoa(img.attr('src') + img.attr('alt'))] = logo.clone();
            img.remove();
            typeof cb == 'function' && cb(logo);
            App.Data.log && App.Data.log.pushImageError(e.target.src);
        });
        return spinner;
    }
}

/**
 * Check if IE mobile version
 */
function isIEMobile() {
    if (isIEMobile.retval) {
        return isIEMobile.retval;
    }
    else {
        isIEMobile.retval = (navigator.userAgent.match(/IEMobile/) ? true : false);
        return isIEMobile.retval;
    }
}

/**
 * Pickup time to string
 */
function pickupToString(date) {
    var skin = App.Data.settings.get('skin'),
        result,
        d = new Date(date),
        time = new TimeFrm(d.getHours(), d.getMinutes(), 'usa');
    //"Mon Dec 30 2013 10:30:00 GMT+0400 (Russian Standard Time)"
    switch (skin) {
        case 'weborder':
        case 'weborder_mobile':
            result = d.toString().replace(/([a-z]+) ([a-z]+) (\d{1,2}) .+/i,'$2 $3, ').concat(time.toString());
    }

    return result;
}

/**
 * deep copy. check array and object before copy
 */
function deepClone(data) {
    var i, j, obj;
    if (Array.isArray(data)) {
        obj = [];
        for (i = 0, j = data.length; i < j; i++) {
            obj.push(deepClone(data[i]));
        }
    } else if (data instanceof Object) {
        obj = {};
        for (i in data) {
            obj[i] = deepClone(data[i]);
        }
    } else {
        obj = data;
    }
    return obj;
}

/**
 * Escape special characters in RegExp string
 **/
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Replace all function
 **/
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * use mask for input field type=number
 */
function inputTypeNumberMask(el, pattern, initial) {
    if (cssua.userAgent.mobile) {
        el.attr("type", "number");
        el.numberMask({pattern: pattern });
    } else {
        var prev = initial && initial.toString() || '';
        el.on('input', function(a) {
            if (!pattern.test(a.target.value) || !a.target.value && !this.validity.valid) {
                a.target.value = prev;
            } else {
                prev = a.target.value;
            }
        });
        el.on('change', function(a) {
            prev = a.target.value;
        });
    }
}
/**
* Clear query string after return from redirect
 */
function clearQueryString(isNotHash) {
    var hash = isNotHash ? '' : location.hash,
        qStr = location.search,
        path = window.location.pathname,
        host = window.location.origin;

    qStr = qStr.replace(/&?pay=[^&]*/, '');
    //Remove PayPal params
    qStr = qStr.replace(/&?token=[^&]*/, '');
    qStr = qStr.replace(/&?PayerID=[^&]*/, '');
    //Remove USAePay params
    qStr = qStr.replace(/&?UM[^=]*=[^&]*/g, '');

    var url = host + path + qStr + hash;
    window.history.replaceState('Return','', url);
}
/**
 * save all data
 */
function saveAllData() {
    App.Data.myorder.saveOrders();
    App.Data.card && App.Data.card.saveCard();
    App.Data.customer.saveCustomer();
    App.Data.customer.saveAddresses();
    App.Data.settings.saveSettings();
}
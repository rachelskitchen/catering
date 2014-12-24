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

var TIMETABLE_WEEK_DAYS = {
    "monday": "Mon",
    "tuesday": "Tue",
    "wednesday": "Wed",
    "thursday": "Thu",
    "friday": "Fri",
    "saturday": "Sat",
    "sunday": "Sun"
};

var MonthByStr = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12};

// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
var EMAIL_VALIDATION_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

var ERROR = {},
    MSG = {};

//write errors here

ERROR.STORE_IS_CLOSED = "Error: Store is closed";
ERROR.BLOCK_STORE_IS_CLOSED = "We're sorry, your order cannot be processed because the store is closed";
ERROR.FORCED_MODIFIER = "Please select at least | %d modifier(s) in %s";
ERROR.SELECT_SIZE_MODIFIER = "Select a size please";
ERROR.SELECT_PRODUCT_ATTRIBUTES = "Please select all attributes";
ERROR.BLOCK_WEIGHT_IS_NOT_VALID = "The product weight is not set or zero";

ERROR.MAINTENANCE_CONFIGURATION = 'Can\'t get application configuration. Please check backend settings.';
ERROR.MAINTENANCE_PAYMENT = 'Please setup at least one payment option'; // for app accessed directly from browser (not via Directory app)
ERROR.MAINTENANCE_DINING = 'Please setup at least one dining option'; // for QSR
ERROR.MAINTENANCE_ORDER_TYPE = 'Please setup at least one order type (in-store pickup or shipping)'; // for Retail

var MAINTENANCE = {
    BACKEND_CONFIGURATION: 'MAINTENANCE_CONFIGURATION',
    PAYMENT_OPTION: 'MAINTENANCE_PAYMENT',
    DINING_OPTION: 'MAINTENANCE_DINING',
    ORDER_TYPE: 'MAINTENANCE_ORDER_TYPE'
};

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
MSG.ERROR_HAS_OCCURRED = "The error has occurred";
MSG.ERROR_HAS_OCCURRED_WITH_CONTACT = "The error has occurred, please contact: %email: %%phone: %";
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
MSG.ADD_MORE_FOR_SHIPPING = "Please add %s more for shipping";
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
MSG.ERROR_SHIPPING_SERVICES_NOT_FOUND = "No shipping services found";
MSG.SHIPPING_SERVICES_RETRIVE_IN_PROGRESS = "Retriving shipping services...";
MSG.SHIPPING_SERVICES_SET_ADDRESS = "Fill required address fields above";
MSG.PRODUCTS_EMPTY_RESULT = "No products found";
MSG.FILTER_SHOW_ALL = "Show All";
MSG.FREE_MODIFIERS_PRICE = "Modifiers for less than %s will be free";
MSG.FREE_MODIFIERS_QUANTITY = "First %s modifiers selected will be free";
MSG.FREE_MODIFIERS_QUANTITY1 = "First modifier selected will be free";
MSG.PRODUCTS_VALID_TIME = "Available: ";
MSG.ERROR_REVEL_EMPTY_NEW_PASSWORD = 'Please enter new password.';
MSG.ERROR_REVEL_EMPTY_OLD_PASSWORD = 'Please enter old password.';
MSG.ERROR_REVEL_NOT_MATCH_PASSWORDS = 'New Password & Repeat Password values don\'t match';
MSG.ERROR_REVEL_USER_EXISTS = 'User %s already exists.';
MSG.ERROR_REVEL_UNABLE_TO_PERFORM = 'Unable to perform action. Please ask about this problem at ask.revelsystems.com.';
MSG.ERROR_REVEL_ATTEMPTS_EXCEEDED = 'Max number of authentication attempts exceeded. Account deleted.';
MSG.ERROR_REVEL_PASSWORD_UPDATE_FAILED = 'Password update failed. Old password is invalid.';
MSG.ERROR_REVEL_AUTHENTICATION_FAILED = 'Authentication failed. Please enter valid email & password.';
MSG.ERROR_NO_MSG_FROM_SERVER = "No message about the error";
MSG.ERROR_GET_DISCOUNTS = "Failed request to get discounts";
MSG.ERROR_INCORRECT_DISCOUNT_CODE = "Type correct discount code from 4 to 16 characters";
MSG.DISCOUNT_CODE_NOT_FOUND = "The typed discount code hasn't been found. Automatic discounts can be applied only.";
// page 'Establishments' (begin)
MSG.ESTABLISHMENTS_ERROR_NOSTORE = 'No store is available for the specified brand';
MSG.ESTABLISHMENTS_CHOOSE_BRAND_DESKTOP = 'Choose which %s you are looking for:';
MSG.ESTABLISHMENTS_CHOOSE_BRAND_MOBILE = 'Choose which %s you\'re looking for:';
MSG.ESTABLISHMENTS_PROCEED_BUTTON = 'Proceed';
MSG.ESTABLISHMENTS_BACK_BUTTON = 'Go Back';
MSG.ESTABLISHMENTS_ALERT_MESSAGE_DESKTOP = 'If you choose a different store location, your order will be canceled. Cancel Order?';
MSG.ESTABLISHMENTS_ALERT_MESSAGE_TITLE_MOBILE = 'Warning';
MSG.ESTABLISHMENTS_ALERT_MESSAGE_MOBILE = 'If you switch stores, your order will be discarded.';
MSG.ESTABLISHMENTS_ALERT_MESSAGE_QUESTION_MOBILE = 'Continue?';
MSG.ESTABLISHMENTS_ALERT_PROCEED_BUTTON_DESKTOP = 'Proceed';
MSG.ESTABLISHMENTS_ALERT_PROCEED_BUTTON_MOBILE = 'Ok';
MSG.ESTABLISHMENTS_ALERT_BACK_BUTTON_DESKTOP = 'Go Back';
MSG.ESTABLISHMENTS_ALERT_BACK_BUTTON_MOBILE = 'Back';
// page 'Establishments' (end)

var PAYMENT_TYPE = {
    PAYPAL_MOBILE: 1,
    CREDIT: 2,
    PAYPAL: 3,
    NO_PAYMENT: 4,
    GIFT: 5
};

// Dining options
var DINING_OPTION = {
        DINING_OPTION_TOGO : 0,
        DINING_OPTION_EATIN : 1,
        DINING_OPTION_DELIVERY : 2,
        DINING_OPTION_CATERING : 3,
        DINING_OPTION_DRIVETHROUGH : 4,
        DINING_OPTION_ONLINE : 5,
        DINING_OPTION_OTHER : 6,
        DINING_OPTION_DELIVERY_SEAT: 6
    };

var ServiceType = {
    TABLE_SERVICE : 0,
    QUICK_SERVICE : 1,
    RETAIL : 2,
    GROCERY : 3,
    REVELLITE_QSR : 4,
    REVELLITE_RETAIL : 5,
    DONATION : 6
};


var MONERIS_RETURN_CODE = {
    DECLINE: 50
};


var MERCURY_RETURN_CODE = {
    SUCCESS : 0,
    AUTH_FAIL : 100,
    CARD_DECLINED : 101,
    CANCEL : 102,
    SESSION_TIMEOUT : 103,
    MAINTENANCE_MODE : 104,
    SAVE_CARD_INFO_FAIL : 206,
    LOAD_CARD_INFO_FAIL : 207,
    PROCESS_CARD_INFO_FAIL : 208,
    VALIDATION_CC_FAIL : 301,
    VALIDATION_SERVER_SIDE_FAILURE :302,
    VALIDATE_NAME_FAIL : 302
};

var MERCURY_RETURN_MESSAGE = {};
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.SUCCESS] = "Success";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.AUTH_FAIL] = "Auth Fail";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.CARD_DECLINED] = "Card Declined";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.CANCEL] = "Payment Canceled";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.SESSION_TIMEOUT] = "Session Timeout";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.MAINTENANCE_MODE] = "Maintenance Mode";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.SAVE_CARD_INFO_FAIL] = "Save Card Info Fail";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.LOAD_CARD_INFO_FAIL] = "Load Card Info Fail";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.PROCESS_CARD_INFO_FAIL] = "Process Card Info Fail";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.VALIDATION_CC_FAIL] = "Credit Card failed Mod10 check multiple times";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.VALIDATION_SERVER_SIDE_FAILURE] = "Possible tampering suspected";
MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.VALIDATE_NAME_FAIL] = "Invalid data entered in cardholder name field";
MERCURY_RETURN_MESSAGE_DEFAULT = "Unknown error";

var MONERIS_RETURN_MESSAGE = {
    50: "Decline",
    51: "Expired Card",
    52: "PIN retries exceeded",
    53: "No sharing",
    54: "No security module",
    55: "Invalid transaction",
    56: "Card not supported",
    57: "Lost or stolen card",
    58: "Card use limited",
    59: "Restricted Card",
    60: "No Chequing account"
};
MONERIS_RETURN_MESSAGE_DEFAULT = "Unknown error";

var MONERIS_PARAMS = {
    PAY: 'rvarPay',
    RESPONSE_ORDER_ID: 'response_order_id',
    TRANSACTION_ID: 'txn_num'
};

function getMercuryErrorMessage(returnCode) {
	var msg = MERCURY_RETURN_MESSAGE[returnCode];
	if (!msg) {
		msg = MERCURY_RETURN_MESSAGE_DEFAULT;
	}
	return msg;
}

function getMonerisErrorMessage(returnCode) {
	var msg = MONERIS_RETURN_MESSAGE[returnCode];
	if (!msg) {
		msg = MONERIS_RETURN_MESSAGE_DEFAULT;
	}
	return msg;
}

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
    if (window.$_GET) {
        return window.$_GET;
    }
    $_GET = {};
    // Mercury return url is not xml-decoded
    var search = window.location.search.replace(/&amp;/g, '&');
    var __GET = search.substring(1).split("&");
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
    if (typeof data.toJSON == 'function')
        data = data.toJSON();

    switch (App.Data.settings.get('storage_data')) {
        case 1:
            if(local && localStorage instanceof Object)
                localStorage[name] = JSON.stringify(data);
            else
                if (sessionStorage instanceof Object)
                    sessionStorage[name] = JSON.stringify(data);
            break;
        case 2:
            document.cookie += name + '=' + JSON.stringify(data);
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

    if (App.Data.settings.get && (App.skin == App.Skins.WEBORDER || App.skin == App.Skins.RETAIL)) {
        return tmpl_alert_message(options);
    } else {
        jq_alert_message(options);
    }
}

/**
 * User customized alerts for weborder skin.
 * options: {
 *     template - template ID
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

    var template = options.template ? options.template : 'alert';

    if ($('#' + template + '-template').length == 0) {
        jq_alert_message(options);
        return;
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

    var tmpl = template_helper2(template + '-template'); // helper of template for PayPal
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

    return alert;
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

function loadTemplate2(name, file, isCore) {
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
            url: isCore ? 'template/' + file + '.html' : App.Data.settings.get('skinPath') + '/template/' + file + '.html',
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
function loadSpinner(logo, anim_params, cb) {
    var show_spinner = true,
        anim = typeof anim_params == 'undefined' ? true : anim_params;
    if (anim_params instanceof Object) {
        //anim_params is params like {spinner: false, anim: false}
        anim = typeof anim_params.anim == 'undefined' ? true : anim_params.anim;
        show_spinner = typeof anim_params.spinner == 'undefined' ? true : anim_params.spinner;
    }
    var s;
    logo.each(function() {
        var logo = $(this),
            parent = logo.parent(),
            defImage = App.Data.settings.get_img_default(logo.attr('data-default-index')),
            hash = makeImageName(logo),
            img, spinner;
        if(hash in App.Data.images) {
            if (App.Data.images[hash].attr('src') == defImage)
                parent.addClass('no-photo');
            logo.replaceWith(App.Data.images[hash].clone())
        }
        spinner = $('<div class="img-spinner"></div>');

        if (show_spinner)
            spinner.spinner();

        logo.replaceWith(spinner);
        img = logo.clone();
        img.css('display','none');
        $('body').append(img);
        img.on('load', function() { //load method - deprecated
            spinner.replaceWith(img);
            anim ? img.fadeIn() : img.show();
            App.Data.images[makeImageName(logo)] = img.clone().css('opacity', '100');
            typeof cb == 'function' && cb(img);
        }).error(function(e) {
            logo.prop('src', defImage);
            spinner.replaceWith(logo);
            parent.addClass('no-photo');
            App.Data.images[makeImageName(logo)] = logo.clone();
            img.remove();
            typeof cb == 'function' && cb(logo);
            App.Data.log && App.Data.log.pushImageError(e.target.src);
        });
        if (s == undefined) {
            s = $(spinner);
        } else {
            s.add(spinner);
        }
    });
    return s;
}

function makeImageName(image) {
	return encodeStr(image.attr('src') + image.attr('alt'));
}

function encodeStr(str) {
    return btoa(encodeURIComponent(str));
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
 * Check if iPad device
 */
function iPad() {
    if (iPad.retval) {
        return iPad.retval;
    }
    else {
        iPad.retval = /ipad/i.test(window.navigator.userAgent) ? true : false;
        return iPad.retval;
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
 * use mask for input field type is a string
 */
function inputTypeStringMask(el, pattern, initial) {
    inputTypeNumberMask(el, pattern, initial, true);
}

/**
 * use mask for input field type=number
 */
function inputTypeNumberMask(el, pattern, initial, dontChangeType) {
    if (cssua.userAgent.mobile && !dontChangeType) {
        el.attr("type", "number");
        el.numberMask({pattern: pattern });
    } else {
        var prev = initial && initial.toString() || '';
        el.on('input', function(a) {
            if (!pattern.test(a.target.value) || !a.target.value && !this.validity.valid) {
                a.target.value = prev;
                el.off('blur', change); // `change` event is not emitted after this case
                el.one('blur', change); // need reproduce it
            } else {
                prev = a.target.value;
            }
        });
        el.on('change', function(a) {
            prev = a.target.value;
        });
    }
    function change() {
        el.trigger('change');
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
    //Remove Mercury params
    //Mercury replaces "&" in original url with "&amp;"
    qStr = qStr.replace(/&amp;/g, '&');
    qStr = qStr.replace(/&&/g, '&');
    qStr = qStr.replace(/&?PaymentID=[^&]*/, '');
    qStr = qStr.replace(/&?ReturnCode=[^&]*/, '');
    //Remove Moneris params
    qStr = qStr.replace(/&?response_order_id=[^&]*/, '');
    qStr = qStr.replace(/&?date_stamp=[^&]*/, '');
    qStr = qStr.replace(/&?time_stamp=[^&]*/, '');
    qStr = qStr.replace(/&?bank_transaction_id=[^&]*/, '');
    qStr = qStr.replace(/&?charge_total=[^&]*/, '');
    qStr = qStr.replace(/&?bank_approval_code=[^&]*/, '');
    qStr = qStr.replace(/&?response_code=[^&]*/, '');
    qStr = qStr.replace(/&?iso_code=[^&]*/, '');
    qStr = qStr.replace(/&?txn_num=[^&]*/, '');
    qStr = qStr.replace(/&?message=[^&]*/, '');
    qStr = qStr.replace(/&?trans_name=[^&]*/, '');
    qStr = qStr.replace(/&?cardholder=[^&]*/, '');
    qStr = qStr.replace(/&?f4l4=[^&]*/, '');
    qStr = qStr.replace(/&?card=[^&]*/, '');
    qStr = qStr.replace(/&?expiry_date=[^&]*/, '');
    qStr = qStr.replace(/&?result=[^&]*/, '');
    qStr = qStr.replace(/&?rvarPay=[^&]*/, '');
    qStr = qStr.replace(/rvarSkin=/, 'skin=');
    qStr = qStr.replace(/rvarEstablishment=/, 'establishment=');
    qStr = qStr.replace(/\?&/, '?');


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
/*
*  Transfor the first text letter to upper case
*/
function fistLetterToUpperCase(text) {
    return text.replace(/(^[a-z])|\s([a-z])/g, function(m, g1, g2){
        return g1 ? g1.toUpperCase() : ' ' + g2.toUpperCase();
    });
}

/*
*  trace function:
*/
function trace() {
    return console.log.apply(console, arguments);
}

function format_time(time) {
    time = time.split(":")
    return new TimeFrm(time[0] * 1, time[1] * 1, "usa").toString();
}

function format_days(days, day_time) {
    var str = "";
    if (days.length > 1 && days.length < 7) {
        str = TIMETABLE_WEEK_DAYS[days[0]] + ' - ' + TIMETABLE_WEEK_DAYS[days[days.length - 1]] + ' ';
    } else if (days.length == 1) {
        str = TIMETABLE_WEEK_DAYS[days[0]] + ' ';
    }
    str += day_time;
    return str;
}

function format_times(times, separator) {
    if (!times) {
        return null;
    }

    var res = []

    times.forEach(function (time) {
        res.push(format_time(time['from']) + ' - ' + format_time(time['to']));
    });

    if (separator == undefined) {
        separator = ', ';
    }

    return res.join(separator);
}

function format_timetables(timetables, separator) {
    if (!timetables) {
        return null;
    }
    var res = [];
    var always = false;

    timetables.forEach(function (timetable) {
        var timetable_data = timetable.timetable_data
        if (!timetable_data || $.isEmptyObject(timetable_data)) {
            always = true;
            return;
        }
        var prev_day_time = null;
        var days = [];

        for(day in TIMETABLE_WEEK_DAYS) {
            var day_time = null;
            if (timetable_data[day] && timetable_data[day].length > 0) {
                day_time = format_times(timetable_data[day])
            }

            if (prev_day_time &&
                (!day_time || prev_day_time != day_time)) {
                res.push(format_days(days, prev_day_time));
                days = [];
            }
            if (day_time) {
                prev_day_time = day_time;
                days.push(day);
            } else {
                prev_day_time = null;
                days = [];
            }
        }

        if (prev_day_time) {
            res.push(format_days(days, prev_day_time));
        }
    });
    if (always) {
        return null;
    }
    if (separator == undefined) {
        separator = ', ';
    }
    return res.join(separator);
}

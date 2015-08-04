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

var MonthByStr = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12},
    EN_ARRAY_MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
var EMAIL_VALIDATION_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

//write errors here

var MAINTENANCE = {
    BACKEND_CONFIGURATION: 'MAINTENANCE_CONFIGURATION',
    PAYMENT_OPTION: 'MAINTENANCE_PAYMENT',
    DINING_OPTION: 'MAINTENANCE_DINING',
    ORDER_TYPE: 'MAINTENANCE_ORDER_TYPE'
};
var RESOURCES = {
    CSS: 'RESOURCES_CSS',
    TEMPLATES: 'RESOURCES_TEMPLATES'
}

var ERROR = {},
    MSG = {},
    _loc; ; //locale strings

// Should be set before language pack loading
ERROR.WEBSTORAGES_ARE_DISABLED = 'Web storages are disabled or not supported in your browser';
ERROR.LOAD_LANGUAGE_PACK = 'Unable to load a language pack. Now the page is reloaded.';

var PAYMENT_TYPE = {
    PAYPAL_MOBILE: 1,
    CREDIT: 2,
    PAYPAL: 3,
    NO_PAYMENT: 4,
    GIFT: 5,
    STANFORD: 6
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
        DINING_OPTION_SHIPPING: 7
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

var EVENT = {
    START:     "Start",
    NAVIGATE:  "Navigate",
    SEARCH:    "Search"
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

Date.prototype.format = function(date_format) {
    date_format = date_format || App.Data.settings.get('settings_system').date_format || "mm/dd/yyyy";
    var month = _loc.ARRAY_MONTH[this.getMonth()];
    var wday = _loc.DAYS_OF_WEEK[Object.keys(_loc.DAYS_OF_WEEK)[(this.getDay() + 6) % 7]];
    var wday_short = _loc.DAYS_OF_WEEK_SHORT[Object.keys(_loc.DAYS_OF_WEEK_SHORT)[(this.getDay() + 6) % 7]];
    var map = { //1 Dec 2014: new Date(2014, 11, 1).format("yyyy yy MMM Mmm MM Mm mm DDD Ddd DD Dd dd d")
        'yyyy': this.getFullYear(), //2014
        'yy': String(this.getFullYear()).substr(2, 2), //14
        'MMM': month.substr(0, 3).toUpperCase(), //DEC
        'Mmm': month.substr(0, 3), //Dec
        'MM': month.toUpperCase(), //DECEMBER
        'Mm': month, //December
        'mm': ('0' + (this.getMonth() + 1)).slice(-2), //12
        'DDD': wday_short.toUpperCase(), //MON
        'Ddd': wday_short, //Mon
        'DD': wday.toUpperCase(), //MONDAY
        'Dd': wday, //Monday
        'dd': ('0' + this.getDate()).slice(-2), //01
        'd': this.getDate() //1
    };

    var re = new RegExp(Object.keys(map).join("|"), "gi");
    date_format = date_format.replace(re, function(matched) {
        return map[matched];
    });

    return date_format;
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
    return js_date.format() + ' '  + new TimeFrm(js_date.getHours(), js_date.getMinutes());
}
/**
 * Formatting a date in the format "(Yesterday/Today/Tomorrow) at HH:MM(am/pm) | MONTH DD(st/nd/rd/th) at HH:MM(am/pm)".
 */
function format_date_3(date) {
    var SECONDS_IN_DAY = 86400000;
    var days = _loc['DAYS'],
        time_prefix = _loc['TIME_PREFIXES'],
        result = '',
        now = App.Data.timetables.base(),
        date_1 = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        js_date = new Date(date),
        date_2 = new Date(js_date.getFullYear(), js_date.getMonth(), js_date.getDate()),
        time_difference = date_2 - date_1;
    if (time_difference == 0) {
        result += days['TODAY'];
    } else if (time_difference == -SECONDS_IN_DAY) {
        result += days['YESTERDAY'];
    } else if (time_difference == SECONDS_IN_DAY) {
        result += days['TOMORROW'];
    } else {
        var current_date_month = js_date.getMonth() + 1;
        var current_date_day = js_date.getDate();
        result += _loc.ARRAY_MONTH[current_date_month - 1] + ' ' + current_date_day;
        switch (current_date_day) {
            case 1:
                result += time_prefix['FIRST_DAY_OF_MONTH'];
                break;
            case 2:
                result += time_prefix['SECOND_DAY_OF_MONTH'];
                break;
            case 3:
                result += time_prefix['THIRD_DAY_OF_MONTH'];
                break;
            default:
                result += time_prefix['OTHER_DAY_OF_MONTH'];
                break;
        }
    }
    result += ' ' + time_prefix['TIME_AT'] + ' ' + new TimeFrm(js_date.getHours(), js_date.getMinutes());
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
 * Save data to storage (cookie, sessionStorage, localStorage).
 * Return true if successfully saved
 */
function setData(name, data, local) {
    if (typeof data.toJSON == 'function')
        data = data.toJSON();

    switch (App.Data.settings.get('storage_data')) {
        case 1:
            if(local && localStorage instanceof Object)
                localStorage[name] = JSON.stringify(data);
            else if (sessionStorage instanceof Object)
                sessionStorage[name] = JSON.stringify(data);
            break;
        case 2:
            document.cookie += name + '=' + JSON.stringify(data) + ';';
            break;
    }
    return true;
}
/**
 * remove data from storage (coockie or sessionStorage)
 */
function removeData(name, local) {
    switch (App.Data.settings.get('storage_data')) {
        case 1:
            if(local && localStorage instanceof Object)
                localStorage.removeItem(name);
            else if(sessionStorage instanceof Object)
                sessionStorage.removeItem(name);
            break;
        case 2:
            // TODO ;
            break;
    }
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
//alias for round_monetary_currency function:
var round_money = round_monetary_currency;

/**
 *  Sync load template
 */

function loadTemplate2(name, file, isCore, loadModelTemplate) {
    var id = name ? name + '_' + file : file;

    /**
     * Resolve current CSS file.
     */
    var resolve = function() {
        loadModelTemplate.count--;
        if (loadModelTemplate.count === 0) loadModelTemplate.dfd.resolve();
    }

    if (loadTemplate2[id] === undefined) {
        var version = is_minimized_version ? '?ver=' + autoVersion : '';
        $.ajax({
            url: isCore ? 'template/' + file + '.html' : App.Data.settings.get('skinPath') + '/template/' + file + '.html' + version,
            dataType: "html",
            success : function(data) {
                var tmplEl = $(data);

                // add template node to DOM tree and cache it
                $("head").append(tmplEl);
                loadTemplate2[id] = tmplEl;

                resolve(); // resolve current CSS file
            },
            error: function(xhr) {
                App.Data.errors.alert(ERROR[RESOURCES.TEMPLATES], true); // user notification
            }
        });
    } else if(loadTemplate2[id] instanceof $) {
        $("head").append(loadTemplate2[id]);
        resolve(); // resolve current CSS file
    }
}
/**
 * load template
 */
function loadTemplate(name,file) {
    var dfd = $.Deferred();
    if ($("#" + name).length === 0) {
        var version = is_minimized_version ? '?ver=' + autoVersion : '';
        $.ajax({
            url: App.Data.settings.get('skinPath') + "/template/" + file + ".html" + version,
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
function loadCSS(name, loadModelCSS) {
    // cache is used after a return to previous establishment
    if(!(loadCSS.cache instanceof Object)) {
        loadCSS.cache = {};
    }

    var id = typeof btoa == 'function' ? btoa(name) : encodeURIComponent(name),
        elem;

    // Detect 'load' event of link element is supported by browser or not.
    // The result is kept in localStorage to skip this process in further app starts.
    loadCSS.linkLoadEventSupported = loadCSS.linkLoadEventSupported || getData('linkLoadEventSupported', true);

    /**
     * Resolve current CSS file.
     */
    var resolve = function() {
        loadModelCSS.count--;
        if (loadModelCSS.count === 0) loadModelCSS.dfd.resolve();
    }
    var cache = false,
        version = is_minimized_version ? '?ver=' + autoVersion : '';

    if(loadCSS.cache[id] instanceof $) {
        cache = true;
        elem = loadCSS.cache[id];
    } else {
        elem = loadCSS.cache[id] = $('<link rel="stylesheet" href="' + name + '.css' + version + '" type="text/css" />');
        // bug #18285 - no timeout for app assets
        /**
         * User notification.
         */
        var error = function() {
            App.Data.errors.alert(ERROR[RESOURCES.CSS], true, true); // user notification
        };
        var timer = window.setTimeout(error, App.Data.settings.get('timeout'));

        elem.on('load', function() {
            onCSSLoaded(true, resolve);
        });
        elem.on('error', function() {
            onCSSLoaded(true, error);
        });
    }

    if($('link[href="' + name + '.css"]').length === 0) {
        $('head').append(elem);
        if (cache) {
            detectLinkLoadEvent(elem.get(0), loadCSS.linkLoadEventSupported); // detect when CSS is applied to DOM
        } else if(!loadCSS.linkLoadEventSupported) {
            detectLinkLoadEvent(elem.get(0), false); // detect when CSS is applied to DOM
        }
    } else {
        resolve(); // resolve current CSS file
    }

    // Some browsers don't support 'load' event for link element. Need to detect the 'load' event via JavaScript.
    //     *) Safari at least 5.1.7 (the latest version for Windows OS): Safari/534.57.2;
    //     *) Samsung tablet GT-P5210 with Android 4.4.2: Safari/534.30;
    //     *) Other browsers which browser installed with version less Safari/536.25 (Safari 6).
    //     *) PayPal android app on Samsung Galaxy S3.
    //
    // More information:
    //     1) https://bugs.webkit.org/show_bug.cgi?id=38995 - the bug in WebKit Bugzilla;
    //     2) http://trac.webkit.org/changeset/108809 - the changeset #108809.
    //     3) http://en.wikipedia.org/wiki/Safari_version_history - Safari version history.
    //
    // Link href should be in the same domain as the page host. Otherwise Browser Security Policy disallows to check it and timeout will be running forever.
    // (This restriction is acceptable for CSS links passed to loadCSS())
    function detectLinkLoadEvent(el, linkLoadEventSupported) {
        // this method is discussed in http://stackoverflow.com/questions/2635814/javascript-capturing-load-event-on-link
        try {
            var isLoaded = (el.sheet && el.sheet.cssRules.length > 0)
                || (el.styleSheet && el.styleSheet.cssText.length > 0)
                || (el.innerHTML && el.innerHTML.length > 0);

            // if loading CSS just been applied to DOM need to call a resolve() and stop detectLinkLoadEvent.timer
            if(isLoaded) {
                return onCSSLoaded(linkLoadEventSupported, resolve);
            }
        } catch(e) {}

        detectLinkLoadEvent.timer = setTimeout(detectLinkLoadEvent.bind(window, el, linkLoadEventSupported), 100);
    }

    function onCSSLoaded(linkLoadEventSupported, cb) {
        clearTimeout(timer);
        clearTimeout(detectLinkLoadEvent.timer);
        loadCSS.linkLoadEventSupported = linkLoadEventSupported;
        setData('linkLoadEventSupported', linkLoadEventSupported, true);
        typeof cb == 'function' && cb();
    }

    return elem;
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
        frm_type: '24 hour' // or 12 hour
    };

    $.extend(this, def);

    if ( isNumber(hour) && isNumber(min) ) {
        this.minutes = hour * 60 + min;
    }

    frm_type = frm_type || App.Data.settings.get('settings_system').time_format;
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

TimeFrm.prototype.load_from_str_ft['24 hour'] = function(time_str) {
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
TimeFrm.prototype.load_from_str_ft['12 hour'] = function(time_str) {
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

TimeFrm.prototype.toString_ft['12 hour'] = function() {
    /* it outputs the time in format 10:01am or 12:45pm */

    var time_prefix = _loc['TIME_PREFIXES'],
        hour = parseInt( this.minutes / 60 ),
        minutes = this.minutes % 60;

    hour = hour - parseInt( hour / 24) * 24;
    var am_pm = (hour > 11) ? time_prefix['TIME_PM'] : time_prefix['TIME_AM'];

    if (hour > 12) {
        hour = hour - 12;
    }
    else {
        if (hour === 0) {
            hour = 12;
            am_pm = time_prefix['TIME_AM'];
        }
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var thetime = hour + ":" + minutes + am_pm;
    return thetime;
};

TimeFrm.prototype.toString_ft['24 hour'] = function() {

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
            App.Data.images[makeImageName(logo)] = img.clone().css('opacity', '1');
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
 * Check if is iOS device
 */
function isIOS() {
    if (iPad.retval) {
        return iPad.retval;
    }
    else {
        iPad.retval = /iPad|iPod|iPhone/.test(window.navigator.userAgent);
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
        time = new TimeFrm(d.getHours(), d.getMinutes());
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
 * use mask for input field
 * type can be 'integer', (number keyboard for numbers like 100)
 *             'float', (number or tel keyboard for floats like 5.25)
 *             'numeric' (number or tel keyboard for strings of digits "000123456" (zero can be in front of it)
 *             'text', (for general text keyboard)
 *             'tel' (for phones)
 */
function inputTypeMask(el, pattern, initial, type) {
    if (cssua.userAgent.mobile) { //change the type only for mobile devices, desktop browsers add the arrows up/down for number keyboard
        if (type == 'integer') {
            el.attr("type", "number");
        }
        else if (type == 'float') { //for float numbers (1.23)
            if (parseFloat(cssua.userAgent.android) >= 5 || cssua.userAgent.ios)
                el.attr("type", "number");
            else
                el.attr("type", "tel");
                // Some devices have problem with numeric (type='number') keypad - don't have '.', ',' symbols (Bug 11032)
        }
        else if (type == 'numeric') { //for numeric text (e.g 000123456)
            if (parseFloat(cssua.userAgent.android) >= 4.3 || parseFloat(cssua.userAgent.ios) >= 7)
                el.attr("type", "number");
            else {
                el.attr("type", "tel"); // Bug 13910 - Android: CVV > the 1st digit zero is removed from the field (for 'number' keyboard)
                //Android and iOS devices (ver <= 6) removes automatically '0' digit in 'number' fields if it's the first digit
            }
        }
        else if (type == 'text') {
            el.attr("type", "text");
        } else {
            //don't change type if type=undefined, it should be for <input type=text(tel) ..> only
        }
    }

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

    function change() {
        el.trigger('change');
    }
}
/**
 * save all data
 */
function saveAllData() {
    var settings = App.Data.settings,
        ests = App.Data.establishments;
    App.Data.myorder.saveOrders();
    App.Data.card && App.Data.card.saveCard();
    App.Data.customer.saveCustomer();
    App.Data.customer.saveAddresses();
    App.Data.stanfordCard && App.Data.stanfordCard.saveCard();
    settings.saveSettings();
    ests && ests.saveEstablishment(settings.get('establishment'));
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
    return new TimeFrm(time[0] * 1, time[1] * 1).toString();
}

function format_days(days, day_time) {
    var str = "";
    if (days.length > 1 && days.length < 7) {
        str = _loc.DAYS_OF_WEEK_SHORT[days[0]] + ' - ' + _loc.DAYS_OF_WEEK_SHORT[days[days.length - 1]] + ' ';
    } else if (days.length == 1) {
        str = _loc.DAYS_OF_WEEK_SHORT[days[0]] + ' ';
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

        for(day in _loc.DAYS_OF_WEEK_SHORT) {
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
// End of timetable functions

var PaymentProcessor = {
    clearQueryString: function(payment_type, isNotHash) {
        var hash = isNotHash ? '' : location.hash,
            qStr = location.search,
            path = window.location.pathname,
            host = window.location.origin;

        qStr = qStr.replace(/&?pay=[^&]*/, '');
        qStr = this.getPaymentProcessor(payment_type).clearQueryString(qStr);

        var url = host + path + qStr + hash;
        window.history.replaceState('Return','', url);
    },
    getConfig: function(processors, skin) {
        var creditCardPaymentProcessor = this.getCreditCardPaymentProcessor();
        var credit_card_button = creditCardPaymentProcessor != null;

        if ((skin == App.Skins.WEBORDER || skin == App.Skins.WEBORDER_MOBILE || skin == App.Skins.RETAIL)
            && !credit_card_button && !processors.paypal && !processors.cash && !processors.gift_card && !processors.stanford) {
            return undefined;
        }

        var credit_card_dialog = credit_card_button && creditCardPaymentProcessor.showCreditCardDialog();
        var payment_count = 0;
        credit_card_button && payment_count++;
        processors.paypal && payment_count++;
        processors.cash && payment_count++;
        processors.gift_card && payment_count++;
        processors.stanford && payment_count++;

        return {
            payment_count: payment_count,
            credit_card_button: credit_card_button,
            credit_card_dialog: credit_card_dialog
        };
    },
    processPaymentType: function(payment_type, myorder) {
        var get_parameters = App.Data.get_parameters,
            payment_info = {},
            pay_get_parameter = get_parameters.pay;

        // Clear pay flag, it should not affect next payments
        delete get_parameters.pay;

        if (payment_type == PAYMENT_TYPE.CREDIT) {
            var card = App.Data.card && App.Data.card.toJSON()
            var address = null;
            if (card.street) {
                address = {
                    street: card.street,
                    city: card.city,
                    state: card.state,
                    zip: card.zip
                };
            }

            var cardNumber = $.trim(card.cardNumber);
            payment_info.cardInfo = {
                firstDigits: cardNumber.substring(0, 4),
                lastDigits: cardNumber.substring(cardNumber.length - 4),
                firstName: card.firstName,
                lastName: card.secondName,
                address: address
            };
        }

        payment_info = this.getPaymentProcessor(payment_type).processPayment(myorder, payment_info, pay_get_parameter);
        this.clearQueryString(payment_type);

        return payment_info;
    },
    handleRedirect: function(payment_type, myorder, data) {
        var processor = this.getPaymentProcessor(payment_type);
        if (processor.handleRedirect) {
            processor.handleRedirect(myorder, data);
        }

        myorder.checkout.set('payment_type', payment_type);
        myorder.checkout.saveCheckout();

        // Put flag pay=false to storage to handle a return from another site via history.back() method.
        this.saveDefaultState();

        // Start payment transaction. It will be completed when payment capture phase is processed.
        this.startTransaction();

        function doFormRedirect(action, query) {
            var newForm= $('<form>', {
                'action': action,
                'method': 'post'
            });
            for(var i in query) {
                newForm.append($('<input>', {
                    name: i,
                    value: processValue(query[i]),
                    type: 'hidden'
                }));
            }

          newForm.appendTo(document.body).submit();
        }

        function processValue(value) {
            var card = App.Data.card && App.Data.card.toJSON();
            var map = {
                '$cardNumber': card.cardNumber,
                '$expMonth': card.expMonth,
                '$expDate': card.expDate,
                '$expYYYY': card.expDate,
                '$expYY': card.expDate ? card.expDate.substring(2) : undefined,
                '$securityCode': card.securityCode
            };

            for(var key in map) {
                if(value && (typeof value === 'string' || value instanceof String)) {
                    value = replaceAll(key, map[key], value);
                }
            }

            return value;
        }

        if (data.data.url) {
            window.location = data.data.url;
        } else if (data.data.action && data.data.query) {
            doFormRedirect(data.data.action, data.data.query);
        }
        return;
    },
    handlePaymentDataRequest: function(payment_type, myorder, data) {
        var processor = this.getPaymentProcessor(payment_type);
        if (processor.handlePaymentDataRequest) {
            processor.handlePaymentDataRequest(myorder, data);
        }
    },
    getPaymentProcessor: function(payment_type) {
        var payment_processor = null;
        switch (payment_type) {
            case PAYMENT_TYPE.CREDIT:
                payment_processor = this.getCreditCardPaymentProcessor()
                break;
            case PAYMENT_TYPE.PAYPAL:
                payment_processor = PayPalPaymentProcessor;
                break;
            case PAYMENT_TYPE.PAYPAL_MOBILE:
                payment_processor = PayPalMobilePaymentProcessor;
                break;
            case PAYMENT_TYPE.GIFT:
                payment_processor = GiftCardPaymentProcessor;
                break;
            case PAYMENT_TYPE.STANFORD:
                payment_processor = StanfordCardPaymentProcessor;
                break;
            case PAYMENT_TYPE.NO_PAYMENT:
                payment_processor = NoPaymentPaymentProcessor;
                break;
        }
        return payment_processor;
    },
    getCreditCardPaymentProcessor: function() {
        var payment_processor = null;
        var payment = App.Settings.payment_processor;
        if (payment.usaepay) {
            payment_processor = USAePayPaymentProcessor;
        } else if (payment.mercury) {
            payment_processor = MercuryPaymentProcessor;
        } else if (payment.moneris) {
            payment_processor = MonerisPaymentProcessor;
        } else if (payment.quickbooks) {
            payment_processor = QuickBooksPaymentProcessor;
        } else if (payment.adyen) {
            payment_processor = AdyenPaymentProcessor;
        } else if (payment.worldpay) {
            payment_processor = WorldPayPaymentProcessor;
        } else if (payment.freedompay) {
            payment_processor = FreedomPayPaymentProcessor;
        }
        return payment_processor;
    },
    /**
     * Save default state of payment (string 'false') of app in storage before redirect to another page.
     */
    saveDefaultState: function() {
        if(App.Data.router) {
            setData(App.Data.router.getUID() + '.pay', 'false');
        }
    },
    /**
     * Restore default state for app if exists and remove it from storage.
     */
    loadDefaultState: function() {
        var key = App.Data.router.getUID() + '.pay',
            result;
        if(App.Data.router) {
            result = getData(key);
        }
        removeData(key);
        return result;
    },
    /**
     * Method adds a flag for app which means redirection to another site has been performed.
     * Put {'<App UID>.isTransactionInProcess': true} record to a storage.
     *
     * App.Routers.MainRouter.prototype.getUID() method is used to define App UID.
     * So if App.Data.router is undefined this method cannot be executed.
     */
    startTransaction: function() {
        if(!App.Data.router) {
            return;
        }
        setData(App.Data.router.getUID() + '.isTransactionInProcess', true);
    },
    /**
     * Method returns value of '<App UID>.isTransactionInProcess' record in a storage.
     *
     * App.Routers.MainRouter.prototype.getUID() method is used to define App UID.
     * So if App.Data.router is undefined this method cannot be executed.
     */
    isTransactionInProcess: function() {
        if(!App.Data.router) {
            return;
        }
        return getData(App.Data.router.getUID() + '.isTransactionInProcess');
    },
    /**
     * Method removes '<App UID>.isTransactionInProcess' record from a storage.
     *
     * App.Routers.MainRouter.prototype.getUID() method is used to define App UID.
     * So if App.Data.router is undefined this method cannot be executed.
     */
    completeTransaction: function() {
        if(!App.Data.router) {
            return;
        }
        removeData(App.Data.router.getUID() + '.isTransactionInProcess');
    }
};

/*
* Template for any payment processor
* */
var NoPaymentPaymentProcessor = {
    /*
    *  Removes query string parameters added by payment gateway when returning back to our app
    */
    clearQueryString: function(queryString) {
        return queryString;
    },
    /*
    *  That is for credit card processors only. Defines where credit card data can be enter in
    *  our form or payment gateway hosted page.
    */
    showCreditCardDialog: function() {
        return false;
    },
    /*
    *  Implement this method to store any data to local storage before before redirect.
    */
    handleRedirect: function(myorder, data) {
    },
    /*
    *  Implement this method to make direct ajax calls to payment gateway.
    *  Gateway must support CORS.
    */
    handlePaymentDataRequest: function(myorder, data) {
    },
    /*
    *  Adds any processor specific data from get_parameters or model to payment_info.
    *  Set 'errorMsg' property for return object to trigger error
    */
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        return payment_info;
    }
};

var USAePayPaymentProcessor = {
    clearQueryString: function(queryString) {
        return queryString.replace(/&?UM[^=]*=[^&]*/g, '');
    },
    showCreditCardDialog: function() {
        return true;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        if (pay_get_parameter) {
            var get_parameters = App.Data.get_parameters;
            if(pay_get_parameter === 'true') {
                payment_info.transaction_id = get_parameters.UMrefNum;
            } else {
                payment_info.errorMsg = get_parameters.UMerror;
            }
        }
        return payment_info;
    }
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

$(window).on('LocalizationCompleted', function() {
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.SUCCESS] = MSG.MERCURY_RETURN_MESSAGE_SUCCESS;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.AUTH_FAIL] = MSG.MERCURY_RETURN_MESSAGE_AUTH_FAIL;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.CARD_DECLINED] = MSG.MERCURY_RETURN_MESSAGE_CARD_DECLINED;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.CANCEL] = MSG.MERCURY_RETURN_MESSAGE_CANCEL;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.SESSION_TIMEOUT] = MSG.MERCURY_RETURN_MESSAGE_SESSION_TIMEOUT;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.MAINTENANCE_MODE] = MSG.MERCURY_RETURN_MESSAGE_MAINTENANCE_MODE;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.SAVE_CARD_INFO_FAIL] = MSG.MERCURY_RETURN_MESSAGE_SAVE_CARD_INFO_FAIL;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.LOAD_CARD_INFO_FAIL] = MSG.MERCURY_RETURN_MESSAGE_LOAD_CARD_INFO_FAIL;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.PROCESS_CARD_INFO_FAIL] = MSG.MERCURY_RETURN_MESSAGE_PROCESS_CARD_INFO_FAIL;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.VALIDATION_CC_FAIL] = MSG.MERCURY_RETURN_MESSAGE_VALIDATION_CC_FAIL;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.VALIDATION_SERVER_SIDE_FAILURE] = MSG.MERCURY_RETURN_MESSAGE_VALIDATION_SERVER_SIDE_FAILURE;
    MERCURY_RETURN_MESSAGE[MERCURY_RETURN_CODE.VALIDATE_NAME_FAIL] = MSG.MERCURY_RETURN_MESSAGE_VALIDATE_NAME_FAIL;
    MERCURY_RETURN_MESSAGE_DEFAULT = MSG.MERCURY_RETURN_MESSAGE_DEFAULT;
});

var MercuryPaymentProcessor = {
    clearQueryString: function(queryString) {
        qStr = queryString.replace(/&amp;/g, '&');
        qStr = qStr.replace(/&&/g, '&');
        qStr = qStr.replace(/&?PaymentID=[^&]*/, '');
        qStr = qStr.replace(/&?ReturnCode=[^&]*/, '');

        return qStr;
    },
    showCreditCardDialog: function() {
        return false;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        if (pay_get_parameter) {
            var get_parameters = App.Data.get_parameters;
            var returnCode = Number(get_parameters.ReturnCode);
            if (pay_get_parameter === 'true' && returnCode == MERCURY_RETURN_CODE.SUCCESS) {
                payment_info.transaction_id = get_parameters.PaymentID;
            } else {
                payment_info.errorMsg = MERCURY_RETURN_MESSAGE[returnCode];
                if (!payment_info.errorMsg) {
                    payment_info.errorMsg = MERCURY_RETURN_MESSAGE_DEFAULT;
                }
            }
        }
        return payment_info;
    }
};

var MONERIS_RETURN_CODE = {
    DECLINE: 50
};

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

var MonerisPaymentProcessor = {
    clearQueryString: function(queryString) {
        qStr = queryString.replace(/&?response_order_id=[^&]*/, '');
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

        return qStr;
    },
    showCreditCardDialog: function() {
        return true;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        var get_parameters = App.Data.get_parameters;

        //redefine it, Moneris allow to pass custom args only having rvar prefix
        pay_get_parameter = get_parameters[MONERIS_PARAMS.PAY];
        delete get_parameters[MONERIS_PARAMS.PAY];

        if (pay_get_parameter) {
            var returnCode = Number(get_parameters.response_code);
            if(pay_get_parameter === 'true' && returnCode < MONERIS_RETURN_CODE.DECLINE) {
                payment_info.transaction_id = get_parameters[MONERIS_PARAMS.TRANSACTION_ID];
                payment_info.response_order_id = get_parameters[MONERIS_PARAMS.RESPONSE_ORDER_ID];
            } else {
                payment_info.errorMsg = MONERIS_RETURN_MESSAGE[returnCode];
                if (!payment_info.errorMsg) {
                    payment_info.errorMsg = MONERIS_RETURN_MESSAGE_DEFAULT;
                }
            }
        }
        return payment_info;
    }
};

WORLDPAY_RETURN_MESSAGE_DEFAULT = "Unknown error";
var WORLDPAY_PARAMS = {
    ORDER_ID: 'orderid',
    TRANSACTION_ID: 'transid',
    REFCODE: 'refcode',
    REASON: 'Reason'
};

var WorldPayPaymentProcessor = {
    clearQueryString: function(queryString) {

        qStr = queryString.replace(/&?Accepted=[^&]*/, '');
        qStr = qStr.replace(/&?ACCOUNTNUMBER=[^&]*/, '');
        qStr = qStr.replace(/&?authcode=[^&]*/, '');
        qStr = qStr.replace(/&?AVS_RESULT=[^&]*/, '');
        qStr = qStr.replace(/&?BALANCE=[^&]*/, '');
        qStr = qStr.replace(/&?BATCHNUMBER=[^&]*/, '');
        qStr = qStr.replace(/&?CVV2_RESULT=[^&]*/, '');
        qStr = qStr.replace(/&?DEBIT_TRACE_NUMBER=[^&]*/, '');
        qStr = qStr.replace(/&?ENTRYMETHOD=[^&]*/, '');
        qStr = qStr.replace(/&?historyid=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANT_DBA_ADDR=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANT_DBA_CITY=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANT_DBA_NAME=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANT_DBA_PHONE=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANT_DBA_STATE=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANTID=[^&]*/, '');
        qStr = qStr.replace(/&?orderid=[^&]*/, '');
        qStr = qStr.replace(/&?PAYTYPE=[^&]*/, '');
        qStr = qStr.replace(/&?PRODUCT_DESCRIPTION=[^&]*/, '');
        qStr = qStr.replace(/&?Reason=[^&]*/, '');
        qStr = qStr.replace(/&?RECEIPT_FOOTER=[^&]*/, '');
        qStr = qStr.replace(/&?recurid=[^&]*/, '');
        qStr = qStr.replace(/&?refcode=[^&]*/, '');
        qStr = qStr.replace(/&?result=[^&]*/, '');
        qStr = qStr.replace(/&?SEQUENCE_NUMBER=[^&]*/, '');
        qStr = qStr.replace(/&?Status=[^&]*/, '');
        qStr = qStr.replace(/&?SYSTEMAUDITTRACENUMBER=[^&]*/, '');
        qStr = qStr.replace(/&?TERMINALID=[^&]*/, '');
        qStr = qStr.replace(/&?TRANSGUID=[^&]*/, '');
        qStr = qStr.replace(/&?transid=[^&]*/, '');
        qStr = qStr.replace(/&?transresult=[^&]*/, '');
        qStr = qStr.replace(/&?AuthNo=[^&]*/, '');
        qStr = qStr.replace(/&?DUPLICATE=[^&]*/, '');
        qStr = qStr.replace(/&?MERCHANTORDERNUMBER=[^&]*/, '');
        qStr = qStr.replace(/&?Declined=[^&]*/, '');
        qStr = qStr.replace(/&?rcode=[^&]*/, '');
        qStr = qStr.replace(/\?&/, '?');
        qStr = qStr.replace(/&#/, '#');

        return qStr;
    },
    showCreditCardDialog: function() {
        return true;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        var get_parameters = App.Data.get_parameters;

        if (pay_get_parameter) {
            var status = get_parameters['Status']
            if(pay_get_parameter === 'true' && status === 'Accepted') {
                payment_info.transaction_id = get_parameters[WORLDPAY_PARAMS.TRANSACTION_ID];
                payment_info.order_id = get_parameters[WORLDPAY_PARAMS.ORDER_ID];
                payment_info.refcode = get_parameters[WORLDPAY_PARAMS.REFCODE];
            } else {
                payment_info.errorMsg = get_parameters[WORLDPAY_PARAMS.REASON];
                if (!payment_info.errorMsg) {
                    payment_info.errorMsg = WORLDPAY_RETURN_MESSAGE_DEFAULT;
                }
            }
        }
        return payment_info;
    }
};


var QuickBooksPaymentProcessor = {
    clearQueryString: function(queryString) {
        return queryString;
    },
    showCreditCardDialog: function() {
        return true;
    },
    handlePaymentDataRequest: function(myorder, data) {
        if(data.data && data.data.app_token && data.data.token_url) {
            $.ajax({
                type: "POST",
                beforeSend: function(xhr){xhr.setRequestHeader('Authorization', "Intuit_APIKey intuit_apikey=ipp-" + data.data.app_token);},
                url: data.data.token_url + "?apptoken=" + data.data.app_token,
                data: JSON.stringify({card: {
                        number: card.cardNumber,
                        expMonth: card.expMonth,
                        expYear: card.expDate,
                        cvc: card.securityCode}}),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    myorder.checkout.set('token', data.value);
                    myorder.submit_order_and_pay(payment_type, validationOnly, capturePhase);
                },
                error: function (data) {
                    data.errorMsg = MSG.ERROR_OCCURRED + ' ' + MSG.ERROR_DURING_TOKENIZATION;
                    myorder.paymentResponse = {status: 'error', errorMsg: data.errorMsg};
                    myorder.trigger('paymentResponse');
                }
            });
        }
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        var checkout = myorder.checkout.toJSON();
        if  (checkout.token) {
            payment_info.cardInfo.token = checkout.token;
            myorder.checkout.unset("token");
        }
        return payment_info;
    }
};

var AdyenPaymentProcessor = {
    clearQueryString: function(queryString) {
        qStr = queryString.replace(/&?merchantReference=[^&]*/, '');
        qStr = qStr.replace(/&?skinCode=[^&]*/, '');
        qStr = qStr.replace(/&?shopperLocale=[^&]*/, '');
        qStr = qStr.replace(/&?paymentMethod=[^&]*/, '');
        qStr = qStr.replace(/&?authResult=[^&]*/, '');
        qStr = qStr.replace(/&?pspReference=[^&]*/, '');
        qStr = qStr.replace(/&?merchantSig=[^&]*/, '');

        return qStr;
    },
    showCreditCardDialog: function() {
        return false;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        if (pay_get_parameter) {
            var get_parameters = App.Data.get_parameters;
            var returnCode = get_parameters.authResult;
            if(pay_get_parameter === 'true' && returnCode == 'AUTHORISED') {
                payment_info.transaction_id = get_parameters.pspReference;
                payment_info.order_id = get_parameters.merchantReference
            } else {
                payment_info.errorMsg = returnCode ? returnCode : MSG.MERCURY_RETURN_MESSAGE_CANCEL;
            }
        }
        return payment_info;
    }
};

var PayPalPaymentProcessor = {
    clearQueryString: function(queryString) {
        res = queryString.replace(/&?token=[^&]*/, '');
        res = res.replace(/&?PayerID=[^&]*/, '');
        res = res.replace(/&?paymentId=[^&]*/, '');
        return res;
    },
    handleRedirect: function(myorder, data) {
        if (data.data && data.data.payment_id) {
            myorder.checkout.set('payment_id', data.data.payment_id);
        }
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        if (pay_get_parameter) {
            if(pay_get_parameter === 'true') {
                var get_parameters = App.Data.get_parameters;
                var checkout = myorder.checkout.toJSON()
                payment_info.payer_id = get_parameters.PayerID;
                payment_info.payment_id = checkout.payment_id;
            }  else {
                payment_info.errorMsg = MSG.MERCURY_RETURN_MESSAGE_CANCEL;
            }
        }
        return payment_info;
    }
};

var PayPalMobilePaymentProcessor = {
    clearQueryString: function(queryString) {
        return queryString;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        var get_parameters = App.Data.get_parameters;
        payment_info.tabId = get_parameters.tabId;
        payment_info.locationId = get_parameters.locationId;
        payment_info.customerId = get_parameters.customerId;
        payment_info.phone = App.Data.customer.phone;
        return payment_info;
    }
};

var GiftCardPaymentProcessor = {
    clearQueryString: function(queryString) {
        return queryString;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        var giftcard = App.Data.giftcard && App.Data.giftcard.toJSON();
        payment_info.cardInfo = {
            cardNumber: $.trim(giftcard.cardNumber),
            captchaKey: giftcard.captchaKey,
            captchaValue: giftcard.captchaValue
        };
        return payment_info;
    }
};

var StanfordCardPaymentProcessor = {
    clearQueryString: function(queryString) {
        return queryString;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        var stanfordCard = App.Data.stanfordCard && App.Data.stanfordCard.toJSON();
        payment_info.cardInfo = {
            planId: $.trim(stanfordCard.planId)
        };
        return payment_info;
    }
};

var FreedomPayPaymentProcessor = {
    clearQueryString: function(queryString) {
        qStr = queryString.replace(/&?transid=[^&]*/, '');

        return qStr;
    },
    showCreditCardDialog: function() {
        return false;
    },
    processPayment: function(myorder, payment_info, pay_get_parameter) {
        if (pay_get_parameter) {
            var get_parameters = App.Data.get_parameters;
            if (pay_get_parameter === 'true') {
                payment_info.transaction_id = get_parameters.transid;
            } else {
                //TODO: better message
                payment_info.errorMsg = 'Payment failed.';
            }
        }
        return payment_info;
    }
};

/*
* removeClassRegexp: removes all classes by regular expression
*           example: removeClassRegexp($('#element_id'), "s\\d+")
*/
function removeClassRegexp(jq_elem, exp_str) {
    var regexpStr = "(\\s+)?" + exp_str + "(?=\\s|$)";
    var regexp = new RegExp(regexpStr, "g");
    jq_elem.each(function(index, elem){
       $(elem).prop('className', $(elem).prop('className').replace(regexp, ''));
    });
}

/*
*  @function implements logical AND operation on all arguments passed (it's needed for automatic binding discovering for Epoxy)
*  @returns arg1 && arg2 && arg3 ...
*/
function AND(){
    var result = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        result = result && arguments[i];
    }
    return result;
}

/*
*  @function implements logical OR operation on all arguments passed (it's needed for automatic binding discovering for Epoxy)
*  returns arg1 || arg2 || arg3 ...
*/
function OR(){
    var result = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        result = result || arguments[i];
    }
    return result;
}

/*
* Integrity simple test function (Bug 23033), it's checked from categories view.
* When the minimization done it's combined into main.js then checked from mainView.js
*/
function testA_5() {
   return 23033 + 'v1';
}

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

(function() {
    'use strict';
    if (is_browser_unsupported) {
        return;
    }

    // init `skins` object that contents all available skins
    var skins = Object.create(null, {
        set: {
            value: function(key, value, packagePath) {
                // add property that is constant
                Object.defineProperty(this, key, {
                    value: value,
                    enumerable: true
                });

                // set DEFAULT skin if it is not assigned
                if(typeof this.DEFAULT == 'undefined')
                    this.DEFAULT = value;

                // add available skin
                this.available.indexOf(value) == -1 && this.available.push(value);

                // need set package for skin
                require('app').config.packages.push({
                    name: value,
                    location: packagePath || 'skins/' + value
                });
            }
        },
        DEFAULT: {
            value: undefined,
            writable: true
        },
        available: {
            value: []
        }
    });

    window.App = {
        Collections: {},
        Data: {
            modifiers: {},
            myorder: {},
            orders: {},
            products: {},
            router: {},
            settings: {},
            taxes: {},
            paypal_iOS: /device=ios/.test(location.search),
            devMode: /dev=true/.test(location.search),
            images: {},
            log: {}
        },
        Models: {},
        Routers: {},
        Views: {},
        Skins: skins
    };

    App.Settings = {};

    // define main module
    define(['config'], function(config) {
        return {
            skins: skins,
            config: config,
            init: init,
            addSpinner: addSpinner,
            getFontSize: getFontSize,
            initSpinner: initSpinner,
            beforeInit: new Function,
            afterInit: new Function,
            loadApp: loadApp // loading application
        }
    });

    // start app
    function init() {
        var app = require('app');

        if(app.skins.available.length == 0)
            return alert('No skin is available. Please add at least one skin (need add skins.set(\'WEBORDER\', \'weborder\') in main.js).');

        if(!app.REVEL_HOST)
            return alert('REVEL_HOST is undefined. Please assign it in main.js file. (Need add app.REVEL_HOST = <url>;)');

        // set config for require
        require.config(app.config);

        require(["jquery_alerts", "cssua", "functions", "errors", "myorder", "settings", "timetable", "log", "tax", "main_router"], function() {
            // invoke beforeStart onfig
            app.beforeInit();

            // init spinner
            var spinner = app.initSpinner(app.addSpinner, app.getFontSize);

            // init errors object and check browser version
            App.Data.errors = new App.Models.Errors;

            // init log object and listen to ajax errors
            App.Data.log = new App.Models.Log({init: window.initErrors});
            $(document).ajaxError(function(e, jqxhr, settings, exception) {
                App.Data.log.pushAjaxError(settings.url, jqxhr.state(), exception.toString());
            });

            // init settings object
            App.Data.settings = new App.Models.Settings({
                supported_skins: app.skins.available
            });

            var body = document.querySelector('body');
            App.Data.settings.once('change:settings_skin', function() {
                load_styles_and_scripts(); // load styles and scripts
                App.Data.myorder = new App.Collections.Myorders;
                App.Data.timetables = new App.Models.Timetable;
                require([App.Data.settings.get("skin") + "/router"], function() {
                    App.Data.router = new App.Routers.Router;
                    // remove launch spinner
                    App.Data.router.once('started', function() {
                        if(body && Array.prototype.indexOf.call(body.childNodes, spinner) > -1) {
                            document.querySelector('body').removeChild(spinner);
                        }
                        App.Data.router.trigger('needLoadEstablishments');
                    });
                    if(App.Data.settings.get('isMaintenance')) {
                        window.location.hash = "#maintenance";
                    }
                    Backbone.history.start();

                    // invoke afterStart callback
                    app.afterInit();
                });
            });
            app.loadApp(body, spinner); // loading application
        });
    }

    // 'this' should be HTMLElement
    function addSpinner() {
        var html = '<div class="ui-spinner">';
        html += '<div class="point1 point"></div>';
        html += '<div class="point2 point"></div>';
        html += '<div class="point3 point"></div>';
        html += '<div class="point4 point"></div>';
        html += '<div class="point5 point"></div>';
        html += '<div class="point6 point"></div>';
        html += '<div class="point7 point"></div>';
        html += '<div class="point8 point"></div>';
        html += '</div>';
        if('absolute' !== this.style.position) {
            this.style.position = 'relative';
        }
        this.innerHTML += html;
    }

    // define font-size for spinner
    function getFontSize() {
        var wCoef = document.documentElement.clientWidth / 640,
            hCoef = document.documentElement.clientHeight / 700,
            baseSize = 12;

        if (wCoef > hCoef)
            return Math.round(hCoef * baseSize * 1.5);
        else
            return Math.round(wCoef * baseSize * 1.5);
    }

    // show spinner when App is initializing and init jquery `spinner` plugin
    function initSpinner(addSpinner, getFontSize) {
        var nodes = document.querySelectorAll('html, body');
        var i = 0;
        for (; i < nodes.length; i++) {
            nodes[i].style.width = '100%';
            nodes[i].style.height = '100%';
            nodes[i].style.margin = '0';
        }

        App.Data.getSpinnerSize = getFontSize;
        document.querySelector('body').innerHTML = '<div class="ui-loader-default" style="width: 100%; height: 100%; font-size:' + getFontSize() + 'px !important" id="loader"></div>';
        var loader = document.querySelector('#loader');
        addSpinner.call(loader);
        loader.style.cssText += "background-color: rgba(170, 170, 170, .8); position: fixed;";

        // jquery `spinner` plugin
        $.fn.spinner = function() {
            this.each(addSpinner);
        };

        return loader;
    }

    /**
     * Loading application.
     */
    function loadApp(body, spinner) {
        require(['establishments', 'establishments_view'], function() {
            App.Data.establishments = new App.Collections.Establishments();
            // status code = 1 (app should load view with stores list)
            App.Data.establishments.on('loadStoresList', function(storeDefined, showFooter) {
                App.Routers.MainRouter.prototype.loadViewEstablishments({
                    storeDefined: storeDefined,
                    showFooter: showFooter
                }); // load the page with stores list
            });
            // status code = 2 (app reported about error)
            App.Data.establishments.on('showError', function() {
                App.Data.errors.alert(MSG.ERROR_ESTABLISHMENTS_NOSTORE, true); // user notification
                if (body && Array.prototype.indexOf.call(body.childNodes, spinner) > -1) {
                    document.querySelector('body').removeChild(spinner);
                }
            });
            // status code = 3 (app was loaded)
            App.Data.establishments.on('changeEstablishment', function(establishmentID) {
                App.Data.settings.set('establishment', establishmentID);
            });
            var status = App.Data.establishments.getStatusCode(); // get a status code of the app load
            switch (status) {
                case 2:
                    App.Data.errors.alert(MSG.ERROR_ESTABLISHMENTS_NOSTORE, true); // user notification
                    if (body && Array.prototype.indexOf.call(body.childNodes, spinner) > -1) {
                        document.querySelector('body').removeChild(spinner);
                    }
                    break;
                case 3:
                    var establishment = App.Data.settings.get_establishment(); // get ID of current establishment
                    App.Data.establishments.trigger('changeEstablishment', establishment);
                    break;
            }
        });
    }
})();
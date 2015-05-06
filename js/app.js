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

var ERROR = {},
    MSG = {};

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
            devPath: /\/dev\//.test(location.href),
            images: {},
            log: {}
        },
        Models: {},
        lastModelViews: {},
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

        require(['cssua', 'functions', 'generator', 'errors', 'errors_view', 'myorder', 'settings', 'timetable', 'log', 'tax', 'main_router', 'locale'], function() {
            var win = Backbone.$(window);

            // invoke beforeStart onfig
            app.beforeInit();

            App.Data.spinnerStartEvents = [];
            // init spinner
            var spinner = app.initSpinner(app.addSpinner, app.getFontSize);

            App.Data.spinnerEvents = [];
            win.on('hideSpinner', function(event, data) {
                if (!data || !data.startEvent) {
                    data = {startEvent: EVENT.START};
                }
                //trace("win spinner Hide ==> ", data.startEvent);
                if (App.Data.spinnerEvents.indexOf(data.startEvent) >= 0){
                    App.Data.spinnerEvents = _.without(App.Data.spinnerEvents, data.startEvent);
                }

                if (data.isLastEvent) {
                    spinner.style.display = 'none';
                    return;
                }
                setTimeout( function() {
                    //#19303 we should wait in the case of a events series e.g. Start -> Navigate -> Search,
                    //only the last event (isLastEvent flag) should hide the spinner immediately.
                    if (App.Data.spinnerEvents.length == 0) {
                        spinner.style.display = 'none';
                    }
                }, 50);
            });
            win.on('showSpinner', function(evt, data) {
                if (!data || !data.startEvent) {
                    data = {startEvent: EVENT.START};
                }
                //trace("win spinner Show ==> ", data.startEvent);
                if (App.Data.spinnerEvents.indexOf(data.startEvent) == -1) {
                    App.Data.spinnerEvents.push(data.startEvent);
                }
                setTimeout( function() {
                    if (App.Data.spinnerEvents.indexOf(data.startEvent) >= 0) {
                        spinner.style.display = 'block';
                    }
                }, 50);
            });

            // init errors object and check browser version
            var errors = App.Data.errors = new App.Models.Errors;
            errors.on('alertMessage', App.Routers.MainRouter.prototype.alertMessage); // user notification

            // init log object and listen to ajax errors
            App.Data.log = new App.Models.Log({init: window.initErrors});
            $(document).ajaxError(function(e, jqxhr, settings, exception) {
                App.Data.log.pushAjaxError(settings.url, jqxhr.state(), exception.toString());
            });

            // init settings object
            var settings = App.Data.settings = new App.Models.Settings({
                supported_skins: app.skins.available
            }),
                locale = App.Data.locale = new App.Models.Locale,
                isNotFirstLaunch = false;

            // if `storage_data` attribute isn't the web storage need to show a message
            // that blocks further the app initialization
            if (settings.get('storage_data') !== 1) {
                return errors.alert(ERROR.WEBSTORAGES_ARE_DISABLED, true);
            }

            settings.on('change:skin', function() {
                locale.loadLanguagePack(); // load a language pack (localStorage or the backend system)
                locale.loadCompleted.done(function() {
                    _.extend(MSG, locale.get('MSG'));
                    _.extend(ERROR, locale.get('ERRORS'));
                    window.ARRAY_MONTH = locale.get('CORE')['ARRAY_MONTHS'];
                    window.TIMETABLE_WEEK_DAYS = locale.get('CORE')['DAYS_OF_WEEK_SHORTENED'];
                    window.DINING_OPTION_NAME = locale.get('CORE')['DINING_OPTIONS'];
                });
                locale.on('showError', function() {
                    errors.alert(ERROR.LOAD_LANGUAGE_PACK, true); // user notification
                });
            });

            settings.on('changeSettingsSkin', function() {
                load_styles_and_scripts(); // load styles and scripts
                var myorder = App.Data.myorder = new App.Collections.Myorders;
                App.Data.timetables = new App.Models.Timetable;
                require([settings.get('skin') + '/router'], function(module) {
                    locale.loadCompleted.done(function() {
                        if(module instanceof require('main_router')) {
                            module.initRouter();
                        }
                        var router = App.Data.router = new App.Routers.Router;
                        router.once('started', function() {
                            // hide a launch spinner & load an establishments list
                            win.trigger('hideSpinner');
                            router.trigger('needLoadEstablishments');
                        });

                        if (settings.get('isMaintenance')) {
                            location.replace('#maintenance');// need use replace to avoid entry "#" -> "#maintenance" in browser history
                        } else {
                            // TODO: shouldn't depend on the isMaintenance mode if the 'Change Store' functionality is implemented on '#maintenance' page
                            isNotFirstLaunch = true;
                        }
                        router.isNotFirstLaunch = isNotFirstLaunch;
                        Backbone.history.start();    

                        // invoke afterStart callback
                        app.afterInit();
                    });
                });
                myorder.on('reset add remove', function() {
                    var ests = App.Data.establishments;
                    if (ests) ests.needShowAlert(myorder.get_only_product_quantity() > 0);
                });
                myorder.trigger('reset'); //#21756, should be reset after est. changed 
            });
            app.loadApp(); // loading application
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
    function loadApp() {
        require(['establishments', 'establishments_view'], function() {
            /**
             * App reported about error.
             */
            function showError() {
                App.Data.errors.alert(MSG.ESTABLISHMENTS_ERROR_NOSTORE, true); // user notification
                win.trigger('hideSpinner');
            };
            var settings = App.Data.settings,
                ests = App.Data.establishments = new App.Collections.Establishments(),
                win = Backbone.$(window);
            ests.setViewVersion(settings.isMobileVersion()); // set a view version (desktop or mobile)
            ests.listenTo(settings, 'change:brand', function() {
                ests.meta('brand', settings.get('brand'));
            });
            ests.on('loadStoresList', App.Routers.MainRouter.prototype.loadViewEstablishments.bind(window)); // status code = 1 (app should load view with stores list)
            ests.on('showError', showError); // status code = 2 (app reported about error)
            ests.on('changeEstablishment', function(estID) {
                // Need stop execution if establishment id is same.
                // It's important for restoring from session history.
                if(settings.get('establishment') == estID) {
                    return;
                }

                ests.trigger('resetEstablishmentData');
                win.trigger('showSpinner');
                App.Views.GeneratorView.clearCache(); // clear cache if store was changed
                settings.set('establishment', estID);
            }); // status code = 3 (app was loaded)
            ests.checkGETParameters(settings.get_establishment());
        });
    }
})();
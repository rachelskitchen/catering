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

define(["backbone"], function(Backbone) {
    'use strict';

    // flag for maintenance mode
    var isMaintenance;

    window.DINING_OPTION_NAME = {
        DINING_OPTION_TOGO: 'Take Out',
        DINING_OPTION_EATIN: 'Eat In',
        DINING_OPTION_DELIVERY: 'Delivery',
        DINING_OPTION_CATERING : 'Catering',
        DINING_OPTION_DRIVETHROUGH: 'Drive Through',
        DINING_OPTION_ONLINE : 'Online Ordering',
        DINING_OPTION_OTHER: 'Other',
        DINING_OPTION_DELIVERY_SEAT: 'Deliver to Seat'
    };

    App.Routers.MainRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;

            // create lockedRoutes array if it hasn't been created
            if(!Array.isArray(this.lockedRoutes)) {
                this.lockedRoutes = [];
            }

             // remove Delivery option if it is necessary
            if (!App.Data.myorder.total.get('delivery').get('enable'))
                delete DINING_OPTION_NAME.DINING_OPTION_DELIVERY;

            if(App.Settings.editable_dining_options && App.Settings.editable_dining_options[0]) {
                if (DINING_OPTION_NAME['DINING_OPTION_DRIVETHROUGH']) {
                    DINING_OPTION_NAME.DINING_OPTION_DRIVETHROUGH = _.escape(App.Settings.editable_dining_options[1]);
                }
                if (DINING_OPTION_NAME['DINING_OPTION_OTHER']) {
                    DINING_OPTION_NAME.DINING_OPTION_OTHER = _.escape(App.Settings.editable_dining_options[2]);
                }
            }

            var orderFromSeat = App.Settings.order_from_seat || [];
            if(orderFromSeat[0]) {
                App.Data.orderFromSeat = {
                    enable_level: orderFromSeat[1],
                    enable_sector: orderFromSeat[2],
                    enable_row: orderFromSeat[3]
                };
            } else {
                delete DINING_OPTION_NAME.DINING_OPTION_DELIVERY_SEAT;
            }

            for (var dining_ontion_name in DINING_OPTION) {
                if (!App.Settings.dining_options || App.Settings.dining_options.indexOf(DINING_OPTION[dining_ontion_name]) == -1 || (App.Data.orderFromSeat && dining_ontion_name == 'DINING_OPTION_OTHER')) {
                    delete DINING_OPTION_NAME[dining_ontion_name];
                }
            }

            // set page title
            pageTitle(App.Data.settings.get("settings_skin").name_app);

            // extend Backbone.history.loadUrl method to add validation of route handler availability
            // loadUrl() is responsible to call a handler for current route
            // link to raw: https://github.com/jashkenas/backbone/blob/master/backbone.js#L1575
            Backbone.history.loadUrl = function(fragment) {
                fragment = this.getFragment(fragment);  // used Backbone.History.prototype.getFragment() method
                // check if current route is locked and replace it on 'index' when it is true
                if(self.lockedRoutes.indexOf(fragment) > -1) {
                    fragment = 'index';
                }
                return Backbone.History.prototype.loadUrl.call(this, fragment);
            }

            // override Backbone.history.start listen to 'initialized' event
            var start = Backbone.history.start;
            Backbone.history.start = function(opts) {
                if(!self.initialized)
                    return self.on('initialized', startHistory);

                return startHistory();

                function startHistory() {
                    return start.call(Backbone.history, opts);
                }
            };

            // listen to hash changes
            this.listenTo(this, 'route', function(route, params) {
                if(App.Data.settings.get('isMaintenance'))
                    if (location.hash.slice(1) !== 'maintenance') {
                        location.reload();
                    }

                var needGoogleMaps = false,
                    cur_hash = location.hash.slice(1);

                if (this.hashForGoogleMaps)
                this.hashForGoogleMaps.some( function(hash) {
                    if (cur_hash == hash) {
                        needGoogleMaps = true;
                        return true;
                    }
                });

                if (needGoogleMaps)
                    App.Data.settings.load_geoloc();
            });

            this.once('started', function() {
                self.started = true;
            });
        },
        navigate: function() {
            this.started && arguments[0] != location.hash.slice(1) && App.Data.mainModel.trigger('loadStarted');
            if(App.Data.settings.get('isMaintenance') && arguments[0] != 'maintenance')
                arguments[0] = 'maintenance';
            return Backbone.Router.prototype.navigate.apply(this, arguments);
        },
        change_page: function(cb) {
            App.Data.mainModel.trigger('loadCompleted');
            App.Data.mainModel.set('no_perfect_scroll', false, {silent: true}); // this is for #14024
            !this.started && this.trigger('started');
        },
        maintenance : function() {
            if (!App.Data.settings.get('isMaintenance')) {
                this.navigate('index', true);
                return;
            } else {
                isMaintenance = true;
            }
        },
        prepare: function(page, callback, dependencies) {
            if(isMaintenance && page != 'maintenance') return;

            var settings = App.Data.settings,
                skin = settings.get('skin'),
                settings_skin = settings.get('settings_skin'),
                skinPath = settings.get('skinPath'),
                basePath = settings.get('basePath'),
                scripts = page && Array.isArray(settings_skin.routing[page].js) ? settings_skin.routing[page].js : [],
                templates = page && Array.isArray(settings_skin.routing[page].templates) ? settings_skin.routing[page].templates : [],
                views = page && Array.isArray(settings_skin.routing[page].views) ? settings_skin.routing[page].views : [],
                css = page && Array.isArray(settings_skin.routing[page].css) ? settings_skin.routing[page].css : [],
                cssCore = page && Array.isArray(settings_skin.routing[page].cssCore) ? settings_skin.routing[page].cssCore : [],
                models = page && Array.isArray(settings_skin.routing[page].model) ? settings_skin.routing[page].model : [],
                core = page && Array.isArray(settings_skin.routing[page].core) ? settings_skin.routing[page].core : [],
                color_schemes = Array.isArray(settings_skin.color_schemes) ? settings_skin.color_schemes : [],
                system_settings = App.Data.settings.get('settings_system'),
                js = core,
                i, j;

            callback = typeof callback == 'function' ? callback.bind(this) : new Function;

            dependencies = Array.isArray(dependencies) ? dependencies : [];

            color_schemes.length > 0 && !this.prepare.initialized && initTheme.call(this);

            for(i = 0, j = scripts.length; i < j; i++)
                js.push(skin + "/js/" + scripts[i]);

            for(i = 0, j = templates.length; i < j; i++)
                loadTemplate2(null, templates[i]);

            for(i = 0, j = views.length; i < j; i++)
                js.push(skin + "/views/" + views[i]);

            for(i = 0, j = css.length; i < j; i++)
                loadCSS(skinPath + "/css/" + css[i]);

            for(i = 0, j = cssCore.length; i < j; i++)
                loadCSS(basePath + "/css/" + cssCore[i]);

            for(i = 0, j = models.length; i < j; i++)
                js.push(skin + "/models/" + models[i]);

            require(js, function() {
                if (App.Data.loadModelTemplate && App.Data.loadModelTemplate.dfd) {
                    dependencies.push(App.Data.loadModelTemplate.dfd);
                }
                if (App.Data.loadModules) {
                    dependencies.push(App.Data.loadModules);
                }

                $.when.apply($, dependencies).then(function() {
                    callback();
                });
            });

            function initTheme() {
                var color_scheme = typeof system_settings.color_scheme == 'string' ? system_settings.color_scheme.toLowerCase().replace(/\s/g, '_') : null;
                if(color_schemes.indexOf(color_scheme) > -1) {
                    css.push('themes/' + color_scheme + '/colors');
                } else {
                    App.Data.log.pushJSError('"' + system_settings.color_scheme + '" color scheme is not available', 'js/router/main.js', '151');
                    css.push('themes/default/colors');
                }
                this.prepare.initialized = true;
            }
        },
        pay: function() {
            this.loadData().then(function() {
                App.Data.myorder.submit_order_and_pay(App.Data.myorder.checkout.get('payment_type'), undefined, true);
            });
        },
        loadData: function() {
            var load = $.Deferred();

            this.prepare('pay', function() {
                App.Data.card = new App.Models.Card();
                App.Data.card.loadCard();
                App.Data.giftcard = new App.Models.GiftCard();
                App.Data.giftcard.loadCard();
                App.Data.customer = new App.Models.Customer();
                App.Data.customer.loadCustomer();
                App.Data.customer.loadAddresses();
                App.Data.myorder.loadOrders();
                load.resolve();
            });

            return load;
        },
        initPaymentResponseHandler: function(cb) {
            var myorder = App.Data.myorder;
            this.listenTo(myorder, 'paymentResponse', function() {
                var card = App.Data.card;

                App.Data.settings.usaepayBack = true;
                clearQueryString(true);
                App.Data.get_parameters = parse_get_params();

                if(myorder.paymentResponse.status.toLowerCase() == 'ok') {
                    myorder.clearData();
                    card && card.clearData();
                }

                typeof cb == 'function' && cb();
            }, this);
        },
        initRevelAPI: function() {
            App.Data.RevelAPI = new App.Models.RevelAPI();

            var RevelAPI = App.Data.RevelAPI,
                mainModel = App.Data.mainModel;

            if(!RevelAPI.isAvailable()) {
                return;
            }

            this.once('started', RevelAPI.run.bind(RevelAPI));

            this.listenTo(RevelAPI, 'onWelcomeShow', function() {
                mainModel.trigger('showRevelPopup', {
                    modelName: 'Revel',
                    mod: 'Welcome',
                    model: RevelAPI,
                    cacheId: 'RevelWelcomeView'
                });
            }, this);

            this.listenTo(RevelAPI, 'onWelcomeReviewed', function() {
                mainModel.trigger('hideRevelPopup', RevelAPI);
                RevelAPI.set('firstTime', false);
            }, this);

            this.listenTo(RevelAPI, 'onProfileCreate', function() {
                mainModel.trigger('showRevelPopup', {
                    modelName: 'Revel',
                    mod: 'ProfileNotification',
                    model: RevelAPI,
                    cacheId: 'ProfileNotification'
                });
            }, this);

            this.listenTo(RevelAPI, 'onProfileCreateAccepted', function() {
                mainModel.trigger('hideRevelPopup', RevelAPI);
            }, this);

            this.listenTo(RevelAPI, 'onProfileCreateDeclined', function() {
                mainModel.trigger('hideRevelPopup', RevelAPI);
            }, this);

            this.listenTo(this, 'navigateToLoyalty', function() {
                RevelAPI.checkProfile(console.log('go to loyalty')/*this.navigate.bind(this, 'loyalty', true)*/);
            }, this);
        }
    });

    App.Routers.MobileRouter = App.Routers.MainRouter.extend({
        profile: function(step, header, footer) {
            step = step <= 2 && step >= 0 ? Math.ceil(step) : 0;

            var next = this.navigate.bind(this, 'profile/' + (step + 1), true),
                prev = this.navigate.bind(this, 'profile/' + (step - 1), true),
                save = function() {},
                views;

            views = [{
                header: 'Personal Info',
                footer: {next: next, prev: null, save: null},
                content: {mod: 'ProfilePersonal'}
            }, {
                header: 'Payment Info',
                footer: {next: next, prev: prev, save: null},
                content: {mod: 'ProfilePayment'}
            }, {
                title: 'Security',
                footer: {next: null, prev: prev, save: save},
                content: {mod: 'ProfileSecurity'}
            }];

            this.prepare('profile', function() {
                var view = views[step];

                App.Data.header.set('page_title', 'Profile: ' + view.header);
                App.Data.footer.set(view.footer);
                App.Data.mainModel.set({
                    header: header,
                    footer: footer,
                    content: _.extend({modelName: 'Revel', className: 'revel-profile', model: App.Data.RevelAPI}, view.content)
                });

                this.change_page();
            });
        }
    });
});
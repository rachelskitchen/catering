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

define(["backbone", "main_router"], function(Backbone) {
    'use strict';

    var headers = {},
        carts = {};

    headers.main = {mod: 'Main', className: 'main'};
    headers.checkout = {mod: 'Checkout', className: 'checkout'};
    carts.main = {mod: 'Main', className: 'main'};
    carts.checkout = {mod: 'Checkout', className: 'checkout'};

    App.Routers.Router = App.Routers.MainRouter.extend({
        routes: {
            "": "index",
            "index": "index",
            "about": "about",
            "map": "map",
            "checkout": "checkout",
            "pay": "pay",
            "confirm": "confirm",
            "maintenance": "maintenance",
            "*other": "index"
        },
        hashForGoogleMaps: ['map', 'checkout'],//for #index we start preload api after main screen reached
        initialize: function() {
            App.Data.get_parameters = parse_get_params(); // get GET-parameters from address line
            clearQueryString();
            this.bodyElement = Backbone.$('body');
            this.bodyElement.append('<div class="main-container"></div>');

            // set locked routes if online orders are disabled
            if(!App.Settings.online_orders) {
                this.lockedRoutes = ['checkout', 'pay', 'confirm'];
            }

            // load main, header, footer necessary files
            this.prepare('main', function() {
                App.Views.Generator.enableCache = true;
                // set header, cart, main models
                App.Data.header = new App.Models.HeaderModel();
                App.Data.mainModel = new App.Models.MainModel();

                this.listenTo(App.Data.mainModel, 'change:mod', this.createMainView);
                this.listenTo(this, 'showPromoMessage', this.showPromoMessage, this);
                this.listenTo(this, 'hidePromoMessage', this.hidePromoMessage, this);
                this.listenTo(this, 'needLoadEstablishments', this.getEstablishments, this);
                this.listenToOnce(App.Data.establishments, 'resetEstablishmentData', this.resetEstablishmentData, this); // remove establishment data in case if establishment ID will change

                App.Data.mainModel.set({
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\.?/)[1],
                    model: App.Data.mainModel,
                    headerModel: App.Data.header,
                    cartCollection: App.Data.myorder
                });
                App.Data.establishments.getModelForView().set('clientName', App.Data.mainModel.get('clientName')); // get a model for the stores list view

                // listen to navigation control
                this.navigationControl();

                // check if we here from paypal payment page
                if (App.Data.get_parameters.pay || App.Data.get_parameters[MONERIS_PARAMS.PAY]) {
                    window.location.hash = "#pay";
                }

                // emit 'initialized' event
                this.trigger('initialized');
                this.initialized = true;
            });

            this.initPaymentResponseHandler(this.navigate.bind(this, 'confirm',  true));

            this.listenTo(App.Data.myorder, "paymentInProcess", function() {
                App.Data.mainModel.trigger('loadStarted');
            }, this);

            this.listenTo(App.Data.myorder, "paymentInProcessValid", function() {
                App.Data.mainModel.trigger('loadCompleted');
            }, this);

            this.listenTo(App.Data.myorder, "paymentFailed cancelPayment", function(message) {
                App.Data.mainModel.trigger('loadCompleted');
                message && App.Data.errors.alert(message);
            }, this);

            var checkout = App.Data.myorder.checkout;
                checkout.trigger("change:dining_option", checkout, checkout.get("dining_option"));

            App.Routers.MainRouter.prototype.initialize.apply(this, arguments);
        },
        createMainView: function() {
            var data = App.Data.mainModel.toJSON(),
                mainView = App.Views.GeneratorView.create('Main', data, data.mod === 'Main'),
                container = Backbone.$('body > div.main-container');

            this.mainView && this.mainView.removeFromDOMTree() || container.empty();
            container.append(mainView.el);
            this.mainView = mainView;
        },
        navigationControl: function() {
            // onCheckoutClick event occurs when 'checkout' button is clicked
            this.listenTo(App.Data.myorder, 'onCheckoutClick', this.navigate.bind(this, 'checkout', true));

            // onPay event occurs when 'Pay' button is clicked
            this.listenTo(App.Data.myorder, 'onPay', function() {
                App.Data.mainModel.set('popup', {
                    modelName: 'Checkout',
                    mod: 'Pay',
                    collection: App.Data.myorder
                });
            });

            // showSpinner event
            this.listenTo(App.Data.myorder, 'showSpinner', function() {
                App.Data.mainModel.trigger('loadStarted');
            });

            // hideSpinner event
            this.listenTo(App.Data.myorder, 'hideSpinner', function() {
                App.Data.mainModel.trigger('loadCompleted');
            });

            // onMenu event occurs when 'Menu' tab is clicked
            this.listenTo(App.Data.header, 'onMenu', this.navigate.bind(this, 'index', true));

            // onMenu event occurs when 'Return to Menu'
            this.listenTo(App.Data.mainModel, 'onMenu', this.navigate.bind(this, 'index', true));

            // onMenu event occurs when 'Return to Checkout'
            this.listenTo(App.Data.mainModel, 'onCheckout', this.navigate.bind(this, 'checkout', true));

            // onAbout event occurs when 'About' tab is clicked
            this.listenTo(App.Data.header, 'onAbout', this.navigate.bind(this, 'about', true));

            // onMap event occurs when 'Map' tab is clicked
            this.listenTo(App.Data.header, 'onMap', this.navigate.bind(this, 'map', true));

            //onBack event occurs when 'Back' buttons is clicked
            this.listenTo(App.Data.header, 'onBack', function() {
                switch (App.Data.header.get('tab_index')) {
                    case 1:
                        this.navigate('about', true);
                        break;
                    case 2:
                        this.navigate('map', true);
                        break;
                    default:
                        this.navigate('index', true);
                }
            }, this);
        },
        showPromoMessage: function() {
            App.Data.mainModel.set('isShowPromoMessage', true);
        },
        hidePromoMessage: function() {
            App.Data.mainModel.set('isShowPromoMessage', false);
        },
        /**
        * Get a stores list.
        */
        getEstablishments: function() {
            if (!App.Data.settings.get('isMaintenance') && App.Data.establishments.length === 0) {
                App.Data.establishments.getEstablishments().then(function() { // get establishments from backend
                    if (App.Data.establishments.length > 1) App.Data.mainModel.set('isShowStoreChoice', true);
                });
            }
        },
        /**
        * Remove establishment data in case if establishment ID will change.
        */
        resetEstablishmentData: function() {
            delete App.Data.router;
            delete App.Data.categories;
            delete App.Data.AboutModel;
            delete App.Data.mainModel.get('cart').collection;
            delete App.Data.mainModel.get('header').collection;
            delete App.Data.mainModel.get('header').model;
        },
        index: function() {
            this.prepare('index', function() {
                var dfd = $.Deferred(),
                    self = this;

                // load content block for categories
                if (!App.Data.categories) {
                    App.Data.categories = new App.Collections.Categories();
                    App.Data.categories.get_categories().then(function() {
                  //      self.change_page();
                        dfd.resolve();
                    });
                } else {
                    dfd.resolve();
                //    this.change_page();
                }

                App.Data.header.set('tab_index', 0);
                App.Data.mainModel.set('mod', 'Main');

                App.Data.mainModel.set({
                    header: headers.main,
                    cart: carts.main,
                    content: [
                        {
                            modelName: 'Categories',
                            collection: App.Data.categories,
                            mod: 'Slider',
                            model: App.Data.mainModel,
                            loaded: dfd
                        },
                        {
                            modelName: 'SubCategories',
                            collection: App.Data.categories,
                            mod: 'Select'
                        },
                        {
                            modelName: 'Categories',
                            collection: App.Data.categories,
                            mod: 'MainProducts'
                        }
                    ]
                });

                dfd.then(function() {
                    self.change_page();
                    //start preload google maps api:
                    App.Data.settings.load_geoloc();
                });
            });
        },
        about: function() {
            this.prepare('about', function() {
                if (!App.Data.AboutModel) {
                    App.Data.AboutModel = new App.Models.AboutModel();
                }
                App.Data.header.set('tab_index', 1);
                App.Data.mainModel.set('mod', 'Main');
                App.Data.mainModel.set({
                    header: headers.main,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.AboutModel,
                        mod: 'About',
                        className: 'about'
                    },
                    cart: carts.main
                });
                this.change_page();
            });
        },
        map: function() {
            this.prepare('map', function() {
                App.Data.header.set('tab_index', 2);
                App.Data.mainModel.set('mod', 'Main');
                App.Data.mainModel.set({
                    header: headers.main,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.timetables,
                        mod: 'Map',
                        className: 'map'
                    },
                    cart: carts.main
                });

                this.change_page();
            });
        },
        checkout: function() {
            this.prepare('checkout', function() {
                if(!App.Data.card) {
                    App.Data.card = new App.Models.Card;
                }

                if(!App.Data.giftcard) {
                    App.Data.giftcard = new App.Models.GiftCard;
                }

                if (!App.Data.customer) {
                    App.Data.customer = new App.Models.Customer();
                }

                var settings = App.Data.settings.get('settings_system');

                App.Data.mainModel.set('mod', 'Main');
                App.Data.mainModel.set({
                    header: headers.checkout,
                    cart: carts.checkout,
                    content: {
                        modelName: 'Checkout',
                        collection: App.Data.myorder,
                        mod: 'Page',
                        className: 'checkout',
                        DINING_OPTION_NAME: DINING_OPTION_NAME,
                        timetable: App.Data.timetables,
                        customer: App.Data.customer,
                        acceptTips: settings.accept_tips_online,
                        noteAllow:  App.Data.settings.get('settings_system').order_notes_allow
                    }
                });
                this.change_page();
            });
        },
        confirm: function() {
            if(!App.Data.settings.usaepayBack) {
                return this.navigate('index', true);
            }

            this.prepare('confirm', function() {
                App.Data.mainModel.set({
                    mod: 'Done'
                });
                this.change_page();
            });
        },
        maintenance: function() {
            if (App.Data.settings.get('isMaintenance')) {
                App.Data.mainModel.set({
                    mod: 'Maintenance'
                });
            }
            this.change_page();
            App.Routers.MainRouter.prototype.maintenance.apply(this, arguments);
        }
    });
});

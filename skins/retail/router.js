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

    var DINING_OPTION_NAME = {
        DINING_OPTION_TOGO: 'Take Out',
        DINING_OPTION_EATIN: 'Eat In',
        DINING_OPTION_DELIVERY: 'Delivery'
    };

    var headers = {},
        carts = {};

    headers.main = {mod: 'Main', className: 'main'};
    headers.confirm = {mod: 'Confirm', className: 'confirm'};
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
            $('body').html('<div></div>');
            this.bodyElement = $('body');

            // remove Delivery option if it is necessary
            if (!App.Data.myorder.total.get('delivery').get('enable'))
                delete DINING_OPTION_NAME.DINING_OPTION_DELIVERY;

            if (!App.Data.settings.get('settings_system').eat_in_for_online_orders) {
                delete DINING_OPTION_NAME.DINING_OPTION_EATIN;
            }

            // load main, header, footer necessary files
            this.prepare('main', function() {
                App.Views.Generator.enableCache = true;
                // set header, cart, main models
                App.Data.header = new App.Models.HeaderModel();
                App.Data.mainModel = new App.Models.MainModel();
                App.Data.categories = new App.Collections.Categories();

                this.listenTo(App.Data.mainModel, 'change:mod', this.createMainView);

                App.Data.mainModel.set({
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\./)[1],
                    model: App.Data.mainModel,
                    headerModel: App.Data.header,
                    cartCollection: App.Data.myorder,
                    categories: App.Data.categories
                });

                // listen to navigation control
                this.navigationControl();

                // check if we here from paypal payment page
                if (App.Data.get_parameters.pay) {
                    window.location.hash = "#pay";
                }

                // emit 'initialized' event
                this.trigger('initialized');
                this.initialized = true;
            });

            this.listenTo(App.Data.myorder, 'paymentResponse', function() {
                clearQueryString(true);
                App.Data.get_parameters = parse_get_params();
                this.navigate('confirm',  true);
            }, this);

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
                mainView = App.Views.GeneratorView.create('Main', data, data.mod === 'Main');

            this.mainView && this.mainView.removeFromDOMTree() || $('body > div').empty();
            $('body > div').append(mainView.el);
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

            // onShop event occurs when 'Shop' item is clicked
            this.listenTo(App.Data.header, 'onShop', this.navigate.bind(this, 'index', true));

            // onMenu event occurs when 'Return to Menu'
            this.listenTo(App.Data.mainModel, 'onMenu', this.navigate.bind(this, 'index', true));

            // onMenu event occurs when 'Return to Checkout'
            this.listenTo(App.Data.mainModel, 'onCheckout', this.navigate.bind(this, 'checkout', true));

            // onAbout event occurs when 'About' item is clicked
            this.listenTo(App.Data.header, 'onAbout', this.navigate.bind(this, 'about', true));

            // onLocations event occurs when 'Locations' item is clicked
            this.listenTo(App.Data.header, 'onLocations', this.navigate.bind(this, 'map', true));

            //onBack event occurs when 'Back' buttons is clicked
            this.listenTo(App.Data.header, 'onBack', function() {
                switch (App.Data.header.get('menu_index')) {
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
        index: function() {
            this.prepare('index', function() {
                var dfd = $.Deferred(),
                    self = this;

                // load content block for categories
                if (!App.Data.categories.receiving)
                    App.Data.categories.receiving = App.Data.categories.get_categories();

                App.Data.categories.receiving.then(function() {
                    dfd.resolve();
                });

                App.Data.header.set('menu_index', 0);
                App.Data.mainModel.set('mod', 'Main');

                App.Data.mainModel.set({
                    header: headers.main,
                    cart: carts.main,
                    content: [
                        {
                            modelName: 'Categories',
                            collection: App.Data.categories,
                            model: App.Data.mainModel,
                            mod: 'SubList',
                            className: 'subcategories'
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
                App.Data.header.set('menu_index', 1);
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
                App.Data.header.set('menu_index', 2);
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
            this.prepare('confirm', function() {
                App.Data.mainModel.set({
                    mod: 'Confirm',
                    DINING_OPTION_NAME: DINING_OPTION_NAME
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

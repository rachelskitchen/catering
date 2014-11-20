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

    window.DINING_OPTION_NAME = {
        DINING_OPTION_TOGO: 'Pick up in store',
        DINING_OPTION_DELIVERY: 'Shipping'
    };

    var headers = {},
        carts = {};

    headers.main = {mod: 'Main', className: 'main'};
    headers.confirm = {mod: 'Confirm', className: 'confirm'};
    headers.checkout = {mod: 'Checkout', className: 'checkout main'};
    carts.main = {mod: 'Main', className: 'main animation'};
    carts.checkout = {mod: 'Checkout', className: 'checkout'};

    App.Routers.Router = App.Routers.MainRouter.extend({
        routes: {
            "": "index",
            "index(/:data)": "index",
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

            // check available dining options and set default
            if(App.Settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) == -1 && App.Settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_DELIVERY) == -1) {
                App.Data.settings.set('isMaintenance', true);
            } else {
                App.Settings.default_dining_option = App.Settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) > -1 ? 'DINING_OPTION_TOGO' : 'DINING_OPTION_DELIVERY';
                App.Data.myorder.checkout.set('dining_option', App.Settings.default_dining_option);
            }

            // cancel requests to modifiers
            App.Collections.ModifierBlocks.init = function(product) {
                var a = $.Deferred();

                if(App.Data.modifiers[product] === undefined )
                    App.Data.modifiers[product] = new App.Collections.ModifierBlocks;

                a.resolve();
                return a;
            };

            // load main, header, footer necessary files
            this.prepare('main', function() {
                App.Views.Generator.enableCache = true;
                // set header, cart, main models
                App.Data.header = new App.Models.HeaderModel();
                App.Data.mainModel = new App.Models.MainModel();
                App.Data.categories = new App.Collections.Categories();
                App.Data.subCategories = new App.Collections.SubCategories();
                App.Data.search = new App.Collections.Search();
                App.Data.filter = new App.Models.Filter();

                // sync sort saving and loading with myorder saving and loading
                App.Data.myorder.saveOrders = function() {
                    this.constructor.prototype.saveOrders.apply(this, arguments);
                    App.Data.filter.saveSort();
                }

                App.Data.myorder.loadOrders = function() {
                    this.constructor.prototype.loadOrders.apply(this, arguments);
                    App.Data.filter.loadSort();
                }

                this.listenTo(App.Data.mainModel, 'change:mod', this.createMainView);
                this.listenTo(this, 'showPromoMessage', this.showPromoMessage, this);
                this.listenTo(this, 'hidePromoMessage', this.hidePromoMessage, this);

                App.Data.mainModel.set({
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\.?/)[1],
                    model: App.Data.mainModel,
                    headerModel: App.Data.header,
                    cartCollection: App.Data.myorder,
                    categories: App.Data.categories,
                    search: App.Data.search
                });

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

            this.on('route', function() {
               App.Data.mainModel.trigger('onRoute');
               App.Data.errors.hide();
            });

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
            // change:parent_selected event occurs when any category tab is clicked
            this.listenTo(App.Data.categories, 'change:parent_selected', function() {
                var categories = App.Data.categories,
                    subCategories = App.Data.subCategories,
                    parent = App.Data.categories.parent_selected,
                    subs = categories.where({parent_name: parent});
                if(!subCategories.get(parent)) {
                    subCategories.add({
                        id: parent,
                        subs: subs
                    });
                    subs.length > 1 && subCategories.get(parent).addAllSubs();
                }
                App.Data.categories.trigger('onSubs', subCategories.getSubs(parent));
            }, this);

            // change:selected event occurs when any subcategory is clicked
            this.listenTo(App.Data.categories, 'change:selected', function() {
                App.Data.mainModel.trigger('loadCompleted');

                var state = {},
                    encoded;

                if(this.state)
                    state = this.state;

                delete state.pattern;
                delete state.attribute1;

                state.parent_selected = App.Data.categories.parent_selected;
                state.selected = App.Data.categories.selected;
                encoded = this.encodeState(state);

                // can't use this.navigate() due to it invokes spinner
                Backbone.Router.prototype.navigate.call(this, 'index/' + encoded);

                // save state after initialization of views.
                // second entry in window.history (#index -> #index/<data>).
                if(encoded && this.index.initState === null)
                    this.index.initState = encoded;
            }, this);

            // onSearchStart event occurs when 'search' form is submitted
            this.listenTo(App.Data.search, 'onSearchStart', function(search) {
                App.Data.mainModel.trigger('loadStarted');
            }, this);

            // onSearchComplete event occurs when search results are ready
            this.listenTo(App.Data.search, 'onSearchComplete', function(result) {
                App.Data.mainModel.trigger('loadCompleted');

                // ingnore cases when no products found
                if(result.get('products').length == 0)
                    return;

                var state = {};

                if(this.state)
                    state = this.state;

                delete state.parent_selected;
                delete state.selected;
                state.pattern = result.get('pattern');

                // can't use this.navigate() due to it invokes spinner
                Backbone.Router.prototype.navigate.call(this, 'index/' + this.encodeState(state), true);
            });

            // listen to filter changes and encode it to hash
            this.listenTo(App.Data.filter, 'change', function(model) {
                var state = {},
                    noChanges = true,
                    i;

                if(this.state)
                    state = this.state;

                for(i in model.changed) {
                    if(state[i] == model.changed[i])
                        continue;
                    noChanges = false;
                }

                if(noChanges)
                    return;

                Object.keys(model.changed).forEach(function(key) {
                    delete state[key];
                });

                state = Backbone.$.extend(state, model.changed);

                if(state.attribute1 == 1)
                    delete state.attribute1;

                // can't use this.navigate() due to it invokes spinner
                Backbone.Router.prototype.navigate.call(this, 'index/' + this.encodeState(state));
            });

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

            // onCart event occurs when 'cart' item is clicked
            this.listenTo(App.Data.header, 'onCart', function() {
                if(App.Settings.online_orders) {
                    App.Data.myorder.trigger('showCart');
                }
            });
        },
        encodeState: function(data) {
            var enc = '';
            try {
                // encode data for hash and update this.state
                enc = JSON.stringify(data);
                this.state = data;
            } catch(e) {
                log('Unable to encode state for object ', data);
            }
            return btoa(enc);
        },
        decodeState: function(data) {
            this.state = null;
            try {
                // decode data from hash and restore
                this.state = JSON.parse(atob(data));
            } catch(e) {
                log('Unable to decode state for string "%s"', data);
            }
        },
        showPromoMessage: function() {
            App.Data.header.set('isShowPromoMessage', true);
        },
        hidePromoMessage: function() {
            App.Data.header.set('isShowPromoMessage', false);
        },
        index: function(data) {
            // init origin state for case when page is loaded without any data (#index or hash is not assigned)
            if(!data && typeof this.index.initState == 'undefined')
                this.index.initState = null;

            // restore state for first entry in window.history (#index/<data> -> #index)
            if(!data && this.index.initState)
                data = this.index.initState;

            // decode data from url
            this.decodeState(data);

            this.prepare('index', function() {
                var categories = App.Data.categories,
                    dfd = $.Deferred(),
                    self = this;

                categories.selected = 0;

                // load content block for categories
                if (!categories.receiving)
                    categories.receiving = categories.get_categories();

                categories.receiving.then(function() {
                    dfd.resolve();
                    if(self.state) {
                        self.restore = $.Deferred();
                        categories.trigger('onRestoreState', self.state);
                    }
                });

                App.Data.header.set('menu_index', 0);
                App.Data.mainModel.set('mod', 'Main');

                App.Data.mainModel.set({
                    header: headers.main,
                    cart: carts.main,
                    content: [
                        {
                            modelName: 'Categories',
                            collection: categories,
                            model: App.Data.mainModel,
                            search: App.Data.search,
                            mod: 'SubList',
                            className: 'subcategories'
                        },
                        {
                            modelName: 'Filter',
                            model: App.Data.filter,
                            categories: categories,
                            search: App.Data.search,
                            mod: 'Sort',
                            className: 'filter sort select-wrapper'
                        },
                        {
                            modelName: 'Filter',
                            model: App.Data.filter,
                            categories: categories,
                            search: App.Data.search,
                            products: App.Data.products,
                            mod: 'Attribute',
                            className: 'filter attribute select-wrapper'
                        },
                        {
                            modelName: 'Categories',
                            collection: categories,
                            search: App.Data.search,
                            filter: App.Data.filter,
                            mod: 'MainProducts',
                            className: 'content products'
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
            App.Data.header.set('menu_index', NaN);
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

                if(typeof App.Data.customer.shipping_serives == 'undefined') {
                    App.Data.customer.shipping_serives = true;
                    App.Data.myorder.listenTo(App.Data.customer, 'change:shipping_services', App.Data.myorder.addDestinationBasedTaxes, App.Data.myorder);
                }

                var settings = App.Data.settings.get('settings_system');

                App.Data.mainModel.set('mod', 'Main');
                App.Data.mainModel.set({
                    header: headers.checkout,
                    cart: carts.checkout,
                    content: {
                        isCartLeftPanel: true,
                        modelName: 'Checkout',
                        collection: App.Data.myorder,
                        mod: 'Page',
                        className: 'checkout',
                        DINING_OPTION_NAME: DINING_OPTION_NAME,
                        timetable: App.Data.timetables,
                        customer: App.Data.customer,
                        acceptTips: settings.accept_tips_online,
                        noteAllow: settings.order_notes_allow
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

    function log() {
        // IE 10: console doesn't have debug method
        typeof console.debug == 'function' && console.debug.apply(console, arguments);
    }
});

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

define(["main_router"], function(main_router) {
    'use strict';

    var headers = {},
        carts = {};

    /**
    * Default router data.
    */
    function defaultRouterData() {
        headers.main = {mod: 'Main', className: 'main'};
        headers.confirm = {mod: 'Confirm', className: 'confirm'};
        headers.checkout = {mod: 'Checkout', className: 'checkout main'};
        carts.main = {mod: 'Main', className: 'main animation'};
        carts.checkout = {mod: 'Checkout', className: 'checkout'};
    }

    var Router = App.Routers.MainRouter.extend({
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
console.log('app init state', history.length);
            var settings = App.Settings;
            App.Data.get_parameters = parse_get_params(); // get GET-parameters from address line
            this.bodyElement = Backbone.$('body');
            this.bodyElement.append('<div class="main-container"></div>');

            // set locked routes if online orders are disabled
            if (!settings.online_orders) {
                this.lockedRoutes = ['checkout', 'pay', 'confirm'];
            }

            if (settings.dining_options instanceof Array) {
                // check available dining options and set default
                if (settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) == -1 && settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_DELIVERY) == -1) {
                    App.Data.settings.set({
                        'isMaintenance': true,
                        'maintenanceMessage': ERROR[MAINTENANCE.ORDER_TYPE]
                    });
                } else {
                    settings.default_dining_option = settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) > -1 ? 'DINING_OPTION_TOGO' : 'DINING_OPTION_DELIVERY';
                    App.Data.myorder.checkout.set('dining_option', settings.default_dining_option);
                }
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
                var mainModel = App.Data.mainModel = new App.Models.MainModel({
                    goToDirectory: App.Data.dirMode ? this.navigateDirectory.bind(this) : new Function,
                    isDirMode: App.Data.dirMode
                });
                var ests = App.Data.establishments;
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

                this.listenTo(mainModel, 'change:mod', this.createMainView);
                this.listenTo(this, 'showPromoMessage', this.showPromoMessage, this);
                this.listenTo(this, 'hidePromoMessage', this.hidePromoMessage, this);
                this.listenTo(this, 'needLoadEstablishments', this.getEstablishments, this); // get a stores list
                this.listenToOnce(ests, 'resetEstablishmentData', this.resetEstablishmentData, this);
                this.listenTo(ests, 'clickButtonBack', mainModel.set.bind(mainModel, 'isBlurContent', false), this);

                mainModel.set({
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\.?/)[1],
                    model: mainModel,
                    headerModel: App.Data.header,
                    cartCollection: App.Data.myorder,
                    categories: App.Data.categories,
                    search: App.Data.search
                });
                ests.getModelForView().set('clientName', mainModel.get('clientName'));

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
                message && App.Data.errors.alert(message); // user notification
            }, this);

            var checkout = App.Data.myorder.checkout;
                checkout.trigger("change:dining_option", checkout, checkout.get("dining_option"));

            this.on('route', function() {
                // can be called when App.Data.mainModel is not initializd yet ('back' btn in browser history control)
                App.Data.mainModel && App.Data.mainModel.trigger('onRoute');
                App.Data.errors.trigger('hideAlertMessage'); // hide user notification
            });

            App.Routers.MainRouter.prototype.initialize.apply(this, arguments);
        },
        /**
         * Change page.
         */
        change_page: function(callback) {
            (callback instanceof Function && App.Data.establishments.length > 1) ? callback() : App.Data.mainModel.set('needShowStoreChoice', false);
            App.Routers.MainRouter.prototype.change_page.apply(this, arguments);
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
                App.Data.search.clearLastPattern();
                // var state = {},
                //     hashRE = /#.*$/,
                //     encoded, url;

                // if(this.state)
                //     state = this.state;

                // delete state.pattern;
                // delete state.attribute1;

                // state.parent_selected = App.Data.categories.parent_selected;
                // state.selected = App.Data.categories.selected;
                // encoded = this.encodeState(state);
                // url = hashRE.test(location.href) ? location.href.replace(hashRE, '#index/' + encoded) : location.href + '#index/' + encoded;

                // this.updateState(!this.index.initState, url);

                // // save state after initialization of views.
                // // second entry in window.history (#index -> #index/<data>).
                // if(encoded && this.index.initState === null)
                //     this.index.initState = encoded;
            }, this);

            // onSearchComplete event occurs when search results are ready
            this.listenTo(App.Data.search, 'onSearchComplete', function(result) {
                // // ingnore cases when no products found
                // if(!result.get('products') || result.get('products').length == 0)
                //     return;

                // var state = {},
                //     hashRE = /#.*$/,
                //     encoded, url;

                // if(this.state)
                //     state = this.state;

                // delete state.parent_selected;
                // delete state.selected;
                // state.pattern = result.get('pattern');
                // encoded = this.encodeState(state);
                // url = hashRE.test(location.href) ? location.href.replace(hashRE, '#index/' + encoded) : location.href + '#index/' + encoded;

                // this.updateState(!this.index.initState, url);
            });

            // listen to filter changes and encode it to hash
            this.listenTo(App.Data.filter, 'change', function(model) {
//                 var state = {},
//                     noChanges = true,
//                     hashRE = /#.*$/,
//                     i, encoded, url;

//                 if(this.state)
//                     state = this.state;

//                 for(i in model.changed) {
//                     if(state[i] == model.changed[i])
//                         continue;
//                     noChanges = false;
//                 }

//                 if(noChanges)
//                     return;

//                 Object.keys(model.changed).forEach(function(key) {
//                     delete state[key];
//                 });

//                 state = Backbone.$.extend(state, model.changed);
// console.log(model.changed)
//                 if(state.attribute1 == 1)
//                     delete state.attribute1;

//                 encoded = this.encodeState(state);
//                 url = hashRE.test(location.href) ? location.href.replace(hashRE, '#index/' + encoded) : location.href + '#index/' + encoded;

//                 this.updateState(false, url);
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
            var state = null;
            try {
                // decode data from hash and restore
                state = JSON.parse(atob(data));
            } catch(e) {
                log('Unable to decode state for string "%s"', data);
            }
            return state;
        },
        runStateTracking: function() {
            if(!App.Routers.MainRouter.prototype.runStateTracking.apply(this, arguments)) {
                return;
            }

            var filter = App.Data.filter,
                categories = App.Data.categories,
                search = App.Data.search,
                subCategoryIsNotSelected = true;

            // listen to filter change
            this.listenTo(filter, 'change', function(model, opts) {
                updateState.call(this, filter, opts);
            }, this);

            // listen to subcategory change and add entry to browser history
            this.listenTo(categories, 'change:selected', function() {
                updateState.call(this, categories, {replaceState: subCategoryIsNotSelected});
                // handle case when subcategory is selected at first time (hash changes on #index/<base64 string>)
                subCategoryIsNotSelected = false;
            }, this);

            // listen to onSearchComplete and add entry to browser history
            this.listenTo(search, 'onSearchComplete', function(result) {
                // ingnore cases when no products found
                if(!result.get('products') || result.get('products').length == 0)
                    return;
                updateState.call(this, search, {});
            }, this);

            function updateState(obj, opts) {
                if(obj.isRestoring || !(opts instanceof Object)) {
                    return;
                }

                var state = this.getState(),
                    encoded = this.encodeState(state),
                    hashRE = /#.*$/,
                    url = hashRE.test(location.href) ? location.href.replace(hashRE, '#index/' + encoded) : location.href + '#index/' + encoded;

                this.updateState(Boolean(opts.replaceState), url);
console.log('update State', /*JSON.stringify(state), */history.length);
            }
        },
        restoreState: function(event, data) {
            var filter = App.Data.filter,
                search = App.Data.search,
                categories = App.Data.categories,
                hashData = location.hash.match(/#index\/(\w+)/), // parse decoded state string from hash
                isSearchPatternPresent, state;

            if(Array.isArray(hashData) && hashData[1].length) {
                state = this.decodeState(hashData[1]);
            }

            data = data || state || App.Routers.MainRouter.prototype.restoreState.apply(this, arguments);

            if(!(data instanceof Object)) {
                return;
            }

            // define pattern is present is data or not
            isSearchPatternPresent = typeof data.searchPattern == 'string' && data.searchPattern.length;

// console.log('restore data', JSON.stringify(data));

            // If data.categories is object restore 'selected', 'parent_selected' props of App.Data.categories and set restoring mode.
            // If search pattern is present categories shouldn't be restored
            if(data.categories instanceof Object && !isSearchPatternPresent) {
                categories.isRestoring = true;
                categories.selected = data.categories.selected;
                categories.parent_selected = data.categories.parent_selected;
                categories.trigger('change:parent_selected', categories, categories.parent_selected);
                categories.trigger('change:selected', categories, categories.selected);
                // remove restoring mode
                delete categories.isRestoring;
                // restore filter
                restoreFilter();
            };

            // If data.searchPattern is string restore last searched pattern and set restoring mode
            if(isSearchPatternPresent) {
                search.isRestoring = true;
                search.lastPattern = data.searchPattern;
                // set callback on event onSearchComplete (products received)
                this.listenToOnce(search, 'onSearchComplete', function() {
                    // remove restoring mode
                    delete search.isRestoring;
                    // restore filter
                    restoreFilter();
                }, this);
                search.trigger('onRestore');
                // due to 'onRestore' handler in header view changes categories.selected, categories.parent_selected on 0
                // need override this value to avoid a selection of first category and subcategory
                // that is triggered in categories views after receiving data from server
                categories.selected = -1;
                categories.parent_selected = -1;
            }

            function restoreFilter() {
                // If data.filter is object resore App.Data.filter attributes and set restoring mode
                if(data.filter instanceof Object) {
                    filter.isRestoring = true;
                    filter.set(data.filter);
                    delete filter.isRestoring;
                };
            }
        },
        getState: function() {
            var filter = App.Data.filter.toJSON(),
                categories = App.Data.categories,
                searchPattern = App.Data.search.lastPattern,
                data = {filter: filter};

            // search pattern and categories data cannot be in one state due to views implementation
            if(searchPattern) {
                data.searchPattern = searchPattern;
            } else {
                data.categories = {
                    parent_selected: categories.parent_selected,
                    selected: categories.selected
                };
            }

            return _.extend(App.Routers.MobileRouter.prototype.getState.apply(this, arguments), data);
        },
        showPromoMessage: function() {
            // can be called when App.Data.header is not initializd yet ('back' btn in browser history control)
            App.Data.header && App.Data.header.set('isShowPromoMessage', true);
        },
        hidePromoMessage: function() {
            // can be called when App.Data.header is not initializd yet ('back' btn in browser history control)
            App.Data.header && App.Data.header.set('isShowPromoMessage', false);
        },
        /**
        * Get a stores list.
        */
        getEstablishments: function() {
            this.getEstablishmentsCallback = function() {
                if (/^(index.*)?$/i.test(Backbone.history.fragment)) App.Data.mainModel.set('needShowStoreChoice', true);
            };
            App.Routers.MainRouter.prototype.getEstablishments.apply(this, arguments);
        },
        /**
        * Remove establishment data in case if establishment ID will change.
        */
        resetEstablishmentData: function() {
            App.Routers.MainRouter.prototype.resetEstablishmentData.apply(this, arguments);
            this.index.initState = null;
        },
        /**
        * Remove HTML and CSS of current establishment in case if establishment ID will change.
        */
        removeHTMLandCSS: function() {
            App.Routers.MainRouter.prototype.removeHTMLandCSS.apply(this, arguments);
            this.bodyElement.children('.main-container').remove();
        },
        index: function(data) {
            // // init origin state for case when page is loaded without any data (#index or hash is not assigned)
            // if(!data && typeof this.index.initState == 'undefined')
            //     this.index.initState = null;

            // // restore state for first entry in window.history (#index/<data> -> #index)
            // if(!data && this.index.initState)
            //     data = this.index.initState;

            // // decode data from url
            // this.decodeState(data);

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
                    self.restore = $.Deferred();
                    self.restoreState({}); // restore with empty event
                    // categories.trigger('onRestoreState', self.state);
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
                    self.change_page(function() {
                        App.Data.mainModel.set('needShowStoreChoice', true);
                    }); // change page
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
                        noteAllow: settings.order_notes_allow,
                        discountAvailable: settings.accept_discount_code
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
            var settings = App.Data.settings;
            if (settings.get('isMaintenance')) {
                App.Data.mainModel.set({
                    mod: 'Maintenance',
                    errMsg: settings.get('maintenanceMessage')
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

    return new main_router(function() {
        window.DINING_OPTION_NAME = {
            DINING_OPTION_TOGO: 'Pick up in store',
            DINING_OPTION_DELIVERY: 'Shipping'
        };
        defaultRouterData();
        App.Routers.Router = Router;
    });
});

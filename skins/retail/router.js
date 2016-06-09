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

    var Router = App.Routers.RevelOrderingRouter.extend({
        routes: {
            "": "index",
            "index(/:data)": "index",
            "about": "about",
            "map": "map",
            "checkout": "checkout",
            "pay": "pay",
            "confirm": "confirm",
            "profile_edit": "profile_edit",
            "profile_payments": "profile_payments",
            "maintenance": "maintenance",
            "*other": "index"
        },
        hashForGoogleMaps: ['map', 'checkout'],//for #index we start preload api after main screen reached
        initialize: function() {
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
                if (settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) == -1 && settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_SHIPPING) == -1) {
                    App.Data.settings.set({
                        'isMaintenance': true,
                        'maintenanceMessage': MAINTENANCE.ORDER_TYPE
                    });
                } else {
                    settings.default_dining_option = settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) > -1 ? 'DINING_OPTION_TOGO' : 'DINING_OPTION_SHIPPING';
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
                    isDirMode: App.Data.dirMode && !App.Data.isNewWnd
                });
                var ests = App.Data.establishments;
                App.Data.categories = new App.Collections.Categories();
                App.Data.search = new App.Collections.Search();
                App.Data.filter = new App.Models.Filter();
                App.Data.cart = new Backbone.Model({visible: false});
                App.Data.categorySelection = new App.Models.CategorySelection();
                App.Data.curProductsSet = new Backbone.Model({value: new App.Models.CategoryProducts()});
                App.Data.productsSets = new App.Collections.ProductsSets();

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
                this.listenTo(this, 'needLoadEstablishments', this.getEstablishments, this); // get a stores list
                this.listenToOnce(ests, 'resetEstablishmentData', this.resetEstablishmentData, this);

                mainModel.set({
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\.?/)[1],
                    model: mainModel,
                    headerModel: App.Data.header,
                    cartCollection: App.Data.myorder,
                    cartModel: App.Data.cart,
                    categories: App.Data.categories,
                    search: App.Data.search
                });
                ests.getModelForView().set('clientName', mainModel.get('clientName'));

                // Once the route is initialized need to set profile panel
                this.listenToOnce(this, 'initialized', this.initProfilePanel.bind(this));

                // init Stanford Card model if it's turned on
                if(_.isObject(App.Settings.payment_processor) && App.Settings.payment_processor.stanford) {
                    App.Data.stanfordCard = new App.Models.StanfordCard();
                }

                // listen to navigation control
                this.navigationControl();

                // run history tracking
                this.triggerInitializedEvent();
            });

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

            App.Routers.RevelOrderingRouter.prototype.initialize.apply(this, arguments);
        },
        /**
         * Change page.
         */
        change_page: function(callback) {
            (callback instanceof Function && App.Data.establishments.length > 1) ? callback() : App.Data.mainModel.set('needShowStoreChoice', false);
            App.Routers.RevelOrderingRouter.prototype.change_page.apply(this, arguments);
        },
        createMainView: function() {
            var data = App.Data.mainModel.toJSON(),
                cacheId = data.mod === 'Main' || data.mod === 'Profile' ? data.mod : false,
                mainView = App.Views.GeneratorView.create('Main', data, cacheId),
                container = Backbone.$('body > div.main-container');

            this.mainView && this.mainView.removeFromDOMTree() || container.empty();
            container.append(mainView.el);
            this.mainView = mainView;
        },
        navigationControl: function() {
            // 'change:subCategory' event occurs when any subcategory is clicked
            this.listenTo(App.Data.categorySelection, 'change:subCategory', function(model, value) {
                this.showProducts(value);
                // App.Data.mainModel.trigger('loadCompleted');
                // App.Data.search.clearLastPattern();
            });

            // onCheckoutClick event occurs when 'checkout' button is clicked
            this.listenTo(App.Data.myorder, 'onCheckoutClick', this.navigate.bind(this, 'checkout', true));

            // show payment processors list
            function showPaymentProcessors() {
                delete showPaymentProcessors.pending;
                App.Data.mainModel.set('popup', {
                    modelName: 'Checkout',
                    mod: 'Pay',
                    collection: App.Data.myorder
                });
            }

            // onPay event occurs when 'Pay' button is clicked
            this.listenTo(App.Data.myorder, 'onPay', function() {
                var stanfordCard = App.Data.stanfordCard;

                // need to check if Stanford Card is turned on and ask a customer about student status
                if(stanfordCard && stanfordCard.get('needToAskStudentStatus') && !App.Data.myorder.checkout.isDiningOptionOnline()) {
                    showPaymentProcessors.pending = true; // assing 'pending' status to showPaymentProcessors() function
                    App.Data.mainModel.set('popup', {
                        modelName: 'StanfordCard',
                        mod: 'StudentStatus',
                        model: stanfordCard,
                        className: 'stanford-student-status'
                    });
                } else {
                    showPaymentProcessors();
                }
            });

            // onNotStudent event occurs when a customer answers 'No' on student status question.
            App.Data.stanfordCard && this.listenTo(App.Data.stanfordCard, 'onNotStudent', showPaymentProcessors);

            // onCancelStudentVerification event occurs when a customer cancels student verification.
            App.Data.stanfordCard && this.listenTo(App.Data.stanfordCard, 'onCancelStudentVerification', App.Data.mainModel.unset.bind(App.Data.mainModel, 'popup'));

            // onStudent event occurs when a customer answers 'Yes' on student status question.
            App.Data.stanfordCard && this.listenTo(App.Data.stanfordCard, 'onStudent', function() {
                App.Data.mainModel.set('popup', {
                    modelName: 'StanfordCard',
                    mod: 'Popup',
                    model: App.Data.stanfordCard,
                    myorder: App.Data.myorder,
                    className: 'stanford-student-card'
                });
            });

            // 'change:validated' event occurs after Stanford Card validation on backend.
            App.Data.stanfordCard && this.listenTo(App.Data.stanfordCard, 'change:validated', function() {
                // if showPaymentProcessors() function is waiting for stanfordCard resolution need to invoke it.
                showPaymentProcessors.pending && showPaymentProcessors();
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
            this.listenTo(App.Data.header, 'onShop', function() {
                if (location.hash.indexOf("#index") == -1) {
                    this.navigate('index', true);
                }
            });

            // onMenu event occurs when 'Return to Menu'
            this.listenTo(App.Data.mainModel, 'onMenu', this.navigate.bind(this, 'index', true));

            // onMenu event occurs when 'Return to Checkout'
            this.listenTo(App.Data.mainModel, 'onCheckout', this.navigate.bind(this, 'checkout', true));

            // onAbout event occurs when 'About' item is clicked
            this.listenTo(App.Data.header, 'onAbout', this.navigate.bind(this, 'about', true));

            // onMap event occurs when 'Map' item is clicked
            this.listenTo(App.Data.header, 'onMap', this.navigate.bind(this, 'map', true));

            // onCart event occurs when 'cart' item is clicked
            this.listenTo(App.Data.header, 'onCart', function() {
                if(App.Settings.online_orders) {
                    App.Data.myorder.trigger('showCart');
                }
            });

            // onRedemptionApplied event occurs when 'Apply Reward' btn is clicked
            this.listenTo(App.Data.myorder.rewardsCard, 'onRedemptionApplied', function() {
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.get_cart_totals().always(function() {
                    App.Data.mainModel.unset('popup');
                    App.Data.mainModel.trigger('loadCompleted');
                });
            });

            // onRewardsErrors event occurs when /weborders/rewards/ request fails
            this.listenTo(App.Data.myorder.rewardsCard, 'onRewardsErrors', function(errorMsg) {
                App.Data.errors.alert(errorMsg);
                App.Data.mainModel.trigger('loadCompleted');
            });

            // onRewardsReceived event occurs when Rewards Card data is received from server
            this.listenTo(App.Data.myorder.rewardsCard, 'onRewardsReceived', function() {
                var rewardsCard = App.Data.myorder.rewardsCard;

                if (!rewardsCard.get('rewards').length) {
                    App.Data.errors.alert(MSG.NO_REWARDS_AVAILABLE);
                } else {
                    var clone = rewardsCard.clone();

                    App.Data.mainModel.set('popup', {
                        modelName: 'Rewards',
                        mod: 'Info',
                        model: clone,
                        className: 'rewards-info',
                        collection: App.Data.myorder,
                        balance: clone.get('balance'),
                        rewards: clone.get('rewards'),
                        discounts: clone.get('discounts')
                    });
                }

                App.Data.mainModel.trigger('loadCompleted');
            });

            // onApplyRewardsCard event occurs when Rewards Card's 'Apply' button is clicked on #checkout page
            this.listenTo(App.Data.myorder.rewardsCard, 'onApplyRewardsCard', function() {
                var rewardsCard = App.Data.myorder.rewardsCard,
                    customer = App.Data.customer;
                if (!rewardsCard.get('number') && customer.isAuthorized() && customer.get('rewardCards').length) {
                    rewardsCard.set('number', customer.get('rewardCards').at(0).get('number'));
                }
                App.Data.mainModel.set('popup', {
                    modelName: 'Rewards',
                    mod: 'Card',
                    model: rewardsCard,
                    className: 'rewards-info',
                    customer: customer
                });
            });

            // onGetRewards event occurs when Rewards Card's 'Submit' button is clicked on 'Rewards Card Info' popup
            this.listenTo(App.Data.myorder.rewardsCard, 'onGetRewards', function() {
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.rewardsCard.getRewards();
            });

            // onResetData events occurs when user resets reward card
            this.listenTo(App.Data.myorder.rewardsCard, 'onResetData', function() {
                App.Data.myorder.get_cart_totals();
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
        /**
         * Enable browser history for navigation through categories, subcategories, filters and search screens.
         */
        runStateTracking: function() {
            if(!App.Routers.RevelOrderingRouter.prototype.runStateTracking.apply(this, arguments)) {
                return;
            }

            var filter = App.Data.filter,
                categorySelection = App.Data.categorySelection,
                search = App.Data.search,
                subCategoryIsNotSelected = true;

            // listen to filter change
            this.listenTo(filter, 'change', function(model, opts) {
                updateState.call(this, filter, opts);
            }, this);

            // listen to subcategory change and add entry to browser history
            this.listenTo(categorySelection, 'change:subCategory', function() {
                updateState.call(this, categorySelection, {replaceState: subCategoryIsNotSelected});
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
            /**
             * Push data changes to browser history entry.
             * @param {Object} obj - Data object (categories, filter or search model).
             * @param {Object} opts - Options object.
             */
            function updateState(obj, opts) {
                // if obj is in restoring mode we shouldn't update state
                if(obj.isRestoring || !(opts instanceof Object)) {
                    return;
                }
                var encoded = this.encodeState(this.getState()),
                    hashRE = /#.*$/,
                    url = hashRE.test(location.href) ? location.href.replace(hashRE, '#index/' + encoded) : location.href + '#index/' + encoded;
                this.updateState(Boolean(opts.replaceState), url);
            }
        },
        /**
         * Restore state data from the history.
         * @param {Object} event - PopStateEvent.
         */
        restoreState: function(event) {
            var filter = App.Data.filter,
                search = App.Data.search,
                categorySelection = App.Data.categorySelection,
                est = App.Data.settings.get('establishment'),
                hashData = location.hash.match(/^#index\/(\w+)/), // parse decoded state string from hash
                mainRouterData, isSearchPatternPresent, state, data;

            if(Array.isArray(hashData) && hashData[1].length) {
                state = this.decodeState(hashData[1]);
            }

            // set data as parsed state
            data = state;

            // need execute App.Routers.MainRouter.prototype.restoreState to handle establishment changing
            mainRouterData = event instanceof Object && event.state
                ? App.Routers.RevelOrderingRouter.prototype.restoreState.apply(this, arguments)
                : App.Routers.RevelOrderingRouter.prototype.restoreState.call(this, {state: {stateData: data}});

            data = data || mainRouterData;

            if(!(data instanceof Object) || est != data.establishment) {
                return;
            }
            // define pattern is present is data or not
            isSearchPatternPresent = typeof data.searchPattern == 'string' && data.searchPattern.length;

            // If data.filter is object resore App.Data.filter attributes and set restoring mode
            if(data.filter instanceof Object) {
                filter.isRestoring = true;
                filter.set(data.filter);
            };

            // If data.categories is object restore 'selected', 'parent_selected' props of App.Data.categories and set restoring mode.
            // If search pattern is present categories shouldn't be restored
            if(_.isObject(data.categories)) {
                categorySelection.isRestoring = true;  // ?
                categorySelection.set(data.categories);
                // remove restoring mode
                delete categorySelection.isRestoring;  // ?
                delete filter.isRestoring;      // ?
            };

            // If data.searchPattern is string restore last searched pattern and set restoring mode
            if(isSearchPatternPresent) {
                search.isRestoring = true;
                search.lastPattern = data.searchPattern;
                // set callback on event onSearchComplete (products received)
                this.listenToOnce(search, 'onSearchComplete', function() {
                    // remove restoring mode
                    delete search.isRestoring;
                    delete filter.isRestoring;
                }, this);
                search.trigger('onRestore');
                // due to 'onRestore' handler in header view changes categories.selected, categories.parent_selected on 0
                // need override this value to avoid a selection of first category and subcategory
                // that is triggered in categories views after receiving data from server
                categories.selected = -1;
                categories.parent_selected = -1;
            }
        },
        /**
         * Returns the current state data.
         * @return {Object} The object containing information about the current app state.
         */
        getState: function() {
            var filter = App.Data.filter,
                categorySelection = App.Data.categorySelection,
                search = App.Data.search,
                data = {},
                hash = location.hash,
                searchPattern;

            // if hash is present but isn't index, need to return default value
            if(hash && !/^#index/i.test(hash) || !filter || !categorySelection || !search) {
                return App.Routers.MobileRouter.prototype.getState.apply(this, arguments);
            }

            data.filter = filter.toJSON();
            searchPattern = search.lastPattern;

            // search pattern and categories data cannot be in one state due to views implementation
            if(searchPattern) {
                data.searchPattern = searchPattern;
            } else {
                data.categories = {
                    parentCategory: categorySelection.get('parentCategory'),
                    subCategory: categorySelection.get('subCategory')
                };
            }

            return _.extend(App.Routers.MobileRouter.prototype.getState.apply(this, arguments), data);
        },
        /**
        * Get a stores list.
        */
        getEstablishments: function() {
            this.getEstablishmentsCallback = function() {
                if (/^(index.*)?$/i.test(Backbone.history.fragment)) App.Data.mainModel.set('needShowStoreChoice', true);
            };
            App.Routers.RevelOrderingRouter.prototype.getEstablishments.apply(this, arguments);
        },
        /**
        * Remove establishment data in case if establishment ID will change.
        */
        resetEstablishmentData: function() {
            App.Routers.RevelOrderingRouter.prototype.resetEstablishmentData.apply(this, arguments);
            this.index.initState = null;
        },
        /**
        * Remove HTML and CSS of current establishment in case if establishment ID will change.
        */
        removeHTMLandCSS: function() {
            App.Routers.RevelOrderingRouter.prototype.removeHTMLandCSS.apply(this, arguments);
            this.bodyElement.children('.main-container').remove();
        },
        index: function(data) {
            this.prepare('index', function() {
                var categories = App.Data.categories,
                    restoreState = new Function,
                    dfd = $.Deferred(),
                    self = this;

                // load content block for categories
                // and restore state from hash
                if (!categories.receiving) {
                    categories.receiving = categories.get_categories();
                    categories.receiving.then(this.restoreState.bind(this, {}));
                }

                categories.receiving.then(function() {
                    // After restoring state an establishment may be changed.
                    // In this case need abort execution of this callback to avoid exceptions in console
                    if(!Backbone.History.started) {
                        return;
                    }
                    dfd.resolve();
                    self.restore = $.Deferred();
                });

                App.Data.header.set('menu_index', 0);
                App.Data.mainModel.set('mod', 'Main');
                App.Data.cart.set('visible', false);

                App.Data.mainModel.set({
                    header: headers.main,
                    cart: carts.main,
                    content: [
                        {
                            modelName: 'Tree',
                            collection: this.getCategoriesTree(),
                            mod: 'Categories',
                            className: 'categories-tree fl-left'
                        },
                        // {
                        //     modelName: 'Filter',
                        //     model: App.Data.filter,
                        //     categories: categories,
                        //     search: App.Data.search,
                        //     products: App.Data.products,
                        //     mod: 'Sort',
                        //     className: 'filter sort select-wrapper'
                        // },
                        // {
                        //     modelName: 'Filter',
                        //     model: App.Data.filter,
                        //     categories: categories,
                        //     search: App.Data.search,
                        //     products: App.Data.products,
                        //     attr: 2,
                        //     mod: 'Attribute',
                        //     className: 'filter attribute select-wrapper',
                        //     uniqId: '2'
                        // },
                        // {
                        //     modelName: 'Filter',
                        //     model: App.Data.filter,
                        //     categories: categories,
                        //     search: App.Data.search,
                        //     products: App.Data.products,
                        //     attr: 1,
                        //     mod: 'Attribute',
                        //     className: 'filter attribute select-wrapper',
                        //     uniqId: '1'
                        // },
                        {
                            modelName: 'Product',
                            collection: App.Data.curProductsSet,
                            filter: App.Data.filter,
                            mod: 'CategoryList',
                            className: 'products-view'
                        }
                    ]
                });

                dfd.then(function() {
                    // change page
                    self.change_page(function() {
                        App.Data.mainModel.set('needShowStoreChoice', true);
                    });
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
                var stores = this.getStoresForMap();

                App.Data.header.set('menu_index', 2);
                App.Data.mainModel.set('mod', 'Main');
                App.Data.mainModel.set({
                    header: headers.main,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.timetables,
                        collection: stores,
                        mod: 'Map',
                        className: 'map'
                    },
                    cart: carts.main
                });

                this.change_page();

                if (stores.request.state() == 'pending') {
                    App.Data.mainModel.trigger('loadStarted');
                    stores.request.then(App.Data.mainModel.trigger.bind(App.Data.mainModel, 'loadCompleted'));
                }
            });
        },
        checkout: function() {
            App.Data.header.set('menu_index', NaN);
            this.prepare('checkout', function() {
                if (!App.Data.card) {
                    App.Data.card = new App.Models.Card;
                }

                this.initGiftCard();

                if (!App.Data.customer) {
                    App.Data.customer = new App.Models.Customer();
                }

                var settings = App.Data.settings.get('settings_system'),
                    addresses = App.Data.customer.get('addresses');

                if (!addresses.isProfileAddressSelected()) {
                    // Need to specify shipping address (Bug 34676)
                    addresses.changeSelection(App.Data.myorder.checkout.get('dining_option'));
                }

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
                        DINING_OPTION_NAME: this.LOC_DINING_OPTION_NAME,
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
        /**
         * Handler for #confirm. Set `mod` attribute of App.Data.mainModel to 'Done'.
         * If App.Data.myorder.paymentResponse is null this handler isn't executed and run #index handler.
         */
        confirm: function() {
            // if App.Data.myorder.paymentResponse isn't defined navigate to #index
            if(!(App.Data.myorder.paymentResponse instanceof Object)) {
                return this.navigate('index', true);
            }
            this.prepare('confirm', function() {
                // if App.Data.customer doesn't exist (success payment -> history.back() to #checkout -> history.forward() to #confirm)
                // need to init it.
                if(!App.Data.customer) {
                    this.loadCustomer();
                }

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
                    errMsg: ERROR[settings.get('maintenanceMessage')]
                });
            }
            this.change_page();
            App.Routers.RevelOrderingRouter.prototype.maintenance.apply(this, arguments);
        },
        profile_edit: function() {
            var promises = this.setProfileEditContent();

            if (!promises.length) {
                return this.navigate('index', true);
            } else {
                Backbone.$.when.apply(Backbone.$, promises).then(this.change_page.bind(this));
            }
        },
        profile_payments: function() {
            var promises = this.setProfilePaymentsContent();

            if (!promises.length) {
                return this.navigate('index', true);
            } else {
                Backbone.$.when.apply(Backbone.$, promises).then(this.change_page.bind(this));
            }
        },
        getCategoriesTree: function() {
            var tree = new App.Collections.Tree(),
                categories = App.Data.categories,
                categorySelection = App.Data.categorySelection,
                lastSelected;

            // remember last selected subcategory to deselect it after new selection
            // and update selected 'subCategory' and 'parentCategory' values
            this.listenTo(tree, 'onItemSelected', function(model, value) {
                if (value) {
                    lastSelected && lastSelected.set('selected', false);
                    lastSelected = model;
                    categorySelection.set({
                        subCategory: model.get('id'),
                        parentCategory: model.get('parent_id')
                    });
                }
            });

            // need to update tree when 'subCategory' updates
            this.listenTo(categorySelection, 'change:subCategory', function(model, value) {
                var item = tree.getItem('id', value, true);
                item && item.set('selected', true);
            });

            // need to update tree when 'parentCategory' updates
            this.listenTo(categorySelection, 'change:parentCategory', function(model, value) {
                var item = tree.getItem('id', value);
                item && item.set('collapsed', false);
            });

            // once categories are loaded need to add them to tree collection
            categories.receiving.always(setCategoriesItems);

            return tree;

            function setCategoriesItems() {
                var selected, parent_selected, data;

                // need to abort execution in case of empty categories collection
                if (!categories.length) {
                    return;
                }

                // need to convert categories collection to array of tree items.
                data = _.toArray(_.mapObject(categories.groupBy('parent_id'), function(value, key) {
                    var data = {
                        id: Number(key),
                        name: value[0].get('name'),
                        sort: value[0].get('parent_sort'),
                        items: _.invoke(value, 'toJSON')
                    };
                    // add 'View All' category
                    value.length > 1 && data.items.unshift({
                        id: _.pluck(value, 'id'),
                        name: _loc.SUBCATEGORIES_VIEW_ALL,
                        sort: 0,
                        parent_id: value[0].get('parent_id')
                    });
                    return data;
                }));

                // and reset 'tree' collection with adding new data
                tree.reset(data);

                // need to define selected subcategory in tree.
                // 'isEqual' param is used in tree.getItem due to 'id' may be array of ids (View All category is selected)
                if (selected = tree.getItem('id', categorySelection.get('subCategory'), true)) {
                    selected.set('selected', true);
                } else {
                    categorySelection.set('subCategory', tree.at(0).get('items').at(0).get('id'));
                }

                // need to define expanded parent category in tree
                if (parent_selected = tree.getItem('id', categorySelection.get('parentCategory'))) {
                    parent_selected.set('collapsed', false);
                } else {
                    categorySelection.set('parentCategory', tree.at(0).get('id'));
                }
            }
        },
        showProducts: function(ids) {
            var self = this,
                isCached = false,
                cachedSet, key;

            ids = Array.isArray(ids) ? ids : [ids];
            key = ids.join();

            if (cachedSet = App.Data.productsSets.get(key)) {
                isCached = true;
            } else {
                cachedSet = App.Data.productsSets.add({id: key});
            }

            App.Data.curProductsSet.set('value', cachedSet);

            // get items
            !isCached && App.Collections.Products.get_slice_products(ids).then(function() {
                var products = [];
                ids.forEach(function(id) {
                    var items = App.Data.products[id],
                        last = Math.max.apply(Math, items.pluck('sort')),
                        floatNumber = Math.pow(10, String(last).length);
                    items.each(function(item) {
                        var product = item.toJSON();
                        // need to exclude 'is_combo' and 'has_upsell' product
                        if (product.is_combo || product.has_upsell) {
                            return;
                        }
                        // add product with new sort value
                        products.push(_.extend(product, {
                            sort: Number(App.Data.categories.get(id).get('sort')) + product.sort / floatNumber
                        }));
                    });
                });

                cachedSet.get('products').reset(products);
                setTimeout(cachedSet.set.bind(cachedSet, 'status', 'resolved'), 500);
            });
        }
    });

    // extends Router with Desktop mixing
    _.defaults(Router.prototype, App.Routers.DesktopMixing);

    function log() {
        // IE 10: console doesn't have debug method
        typeof console.debug == 'function' && console.debug.apply(console, arguments);
    }

    return new main_router(function() {
        defaultRouterData();
        App.Routers.Router = Router;
    });
});

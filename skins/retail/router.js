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
            "modifiers/:id_category(/:id_product)": "modifiers",
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
        use_google_captcha: true, //force to load google captcha library on startup
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
                if (settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) == -1 && settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_SHIPPING) == -1 && settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_OTHER) == -1) {
                    App.Data.settings.set({
                        'isMaintenance': true,
                        'maintenanceMessage': MAINTENANCE.ORDER_TYPE
                    });
                } else {
                    if (settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_TOGO) > -1) {
                        settings.default_dining_option = 'DINING_OPTION_TOGO';
                    }
                    else if (settings.dining_options.indexOf(DINING_OPTION.DINING_OPTION_SHIPPING) > -1) {
                        settings.default_dining_option = 'DINING_OPTION_SHIPPING';
                    }
                    else {
                        settings.default_dining_option = 'DINING_OPTION_OTHER';
                    }
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
                App.Data.searchLine = new App.Models.SearchLine({search: new App.Collections.Search()});
                App.Data.cart = new Backbone.Model({visible: false});
                App.Data.categorySelection = new App.Models.CategorySelection();
                App.Data.curProductsSet = new Backbone.Model({value: new App.Models.CategoryProducts()});
                App.Data.productsSets = new App.Collections.ProductsSets();

                // init App.Data.sortItems
                this.initSortItems();

                // sync sort saving and loading with myorder saving and loading
                App.Data.myorder.saveOrders = function() {
                    this.constructor.prototype.saveOrders.apply(this, arguments);
                    // App.Data.filter.saveSort();
                }

                App.Data.myorder.loadOrders = function() {
                    this.constructor.prototype.loadOrders.apply(this, arguments);
                    // App.Data.filter.loadSort();
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
                    searchLine: App.Data.searchLine
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
        initCustomer: function() {
            App.Routers.RevelOrderingRouter.prototype.initCustomer.apply(this, arguments);
            // Once the customer is initialized need to set profile panel
            this.initProfilePanel();
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
                // don't call this.showProducts() for default value
                if (value !== model.defaults.subCategory) {
                    this.showProducts(value);
                    App.Data.searchLine.empty_search_line();
                }
            });

            // 'searchString' event occurs when a search text field is filled out
            this.listenTo(App.Data.searchLine, 'change:searchString', function(model, value) {
                model = model;

                if (!value) {
                    return;
                }

                // to go #index
                App.Data.header.trigger('onShop');

                var key = btoa(value),
                    productSet = App.Data.productsSets.get(key),
                    searchModel, productsAttr;

                if (!productSet) {
                    productSet = App.Data.productsSets.add({
                        id: key,
                        name: _loc.SEARCH_RESULTS.replace(/%s/g, value)
                    });
                    productsAttr = productSet.get('products');
                    (searchModel = model.getSeachModel()) && searchModel.get('status').then(function() {
                        productsAttr.reset(searchModel.get('products').toJSON());
                        setTimeout(productSet.set.bind(productSet, 'status', 'resolved'), 500);
                        // Apply a sort method specified by user and listen to its further changes
                        App.Data.sortItems.sortCollection(productsAttr);
                    });
                }

                App.Data.curProductsSet.set('value', productSet);
                App.Data.categorySelection.set('subCategory', App.Data.categorySelection.defaults.subCategory, {doNotUpdateState: true});
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

            // onShop event occurs when 'Shop' item is clicked or search line is filled out
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
                    App.Data.cart.set('visible', true);
                }
            });

            // onItemEdit event occurs when cart item's 'edit' button is clicked
            this.listenTo(App.Data.myorder, 'onItemEdit', function(model) {
                var index = App.Data.myorder.indexOf(model);
                index > -1 && this.navigate('modifiers/' + index, true);
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

            // listen to sorting method change to add new entry to browser history
            this.listenTo(App.Data.sortItems, 'change:selected', function(model, value, opts) {
                value && updateStateWithHash.call(this, opts);
            });

            // listen to subcategory change to add new entry to browser history
            this.listenTo(App.Data.categorySelection, 'change:subCategory', function(model, value, opts) {
                updateStateWithHash.call(this, opts);
            }, this);

            // listen to search line change to add new entry to browser history
            this.listenTo(App.Data.searchLine, 'change:searchString', function(model, value, opts) {
                updateStateWithHash.call(this, opts);
            }, this);

            function updateStateWithHash(opts) {
                if (!_.isObject(opts) || !opts.doNotUpdateState) {
                    this.updateStateWithHash(opts.replaceState);
                }
            }

            return true;
        },
        /**
         * Push data changes to browser history entry adding current state to hash.
         * @param {boolean} replaceState - If true, replace the current state, otherwise push a new state.
         */
        updateStateWithHash: function(replaceState) {
            var encoded = this.encodeState(this.getState()),
                hashRE = /#.*$/,
                url = hashRE.test(location.href) ? location.href.replace(hashRE, '#index/' + encoded) : location.href + '#index/' + encoded;
            this.updateState(replaceState, url);
console.log('updateState', history.length, JSON.stringify(this.getState()));
        },
        /**
         * Restore state data from the history.
         * @param {Object} event - PopStateEvent.
         */
        restoreState: function(event) {
            var est = App.Data.settings.get('establishment'),
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

            if(!_.isObject(data) || est != data.establishment) {
                return;
            }
console.log('restoreState', history.length, JSON.stringify(data));

            _.isObject(data.categories) && App.Data.categorySelection.set(data.categories, {doNotUpdateState: true});
            _.isObject(data.searchLine) && App.Data.searchLine.set(data.searchLine, {doNotUpdateState: true});
            data.sort && App.Data.sortItems.checkItem('id', data.sort, {doNotUpdateState: true});
        },
        /**
         * Returns the current state data.
         * @return {Object} The object containing information about the current app state.
         */
        getState: function() {
            var categorySelection = App.Data.categorySelection,
                searchLine = App.Data.searchLine,
                sortItem = App.Data.sortItems.getCheckedItem(),
                data = {},
                hash = location.hash;

            // if hash is present but isn't index, need to return default value
            if(hash && !/^#index/i.test(hash) || !categorySelection || !searchLine) {
                return App.Routers.MobileRouter.prototype.getState.apply(this, arguments);
            }

            data.sort = sortItem.get('id');

            data.searchLine = {
                searchString: searchLine.get('searchString'),
                collapsed: searchLine.get('collapsed')
            };

            data.categories = {
                parentCategory: categorySelection.get('parentCategory'),
                subCategory: categorySelection.get('subCategory')
            };

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
            // this.index.initState = null;
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
                    dfd = $.Deferred(),
                    self = this;

                this.createCategoriesTree();

                categories.receiving.then(function() {
                    // After restoring state an establishment may be changed.
                    // In this case need abort execution of this callback to avoid exceptions in console
                    if(!Backbone.History.started) {
                        return;
                    }
                    self.updateStateWithHash(this); // update hash
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
                            modelName: 'Sidebar',
                            mod: 'Main',
                            categoriesTree: App.Data.categoriesTree,
                            curProductsSet: App.Data.curProductsSet,
                            className: 'fl-left'
                        },
                        {
                            modelName: 'Sort',
                            collection: App.Data.sortItems,
                            mod: 'Items',
                            className: 'sort-menu fl-right'
                        },
                        {
                            modelName: 'Product',
                            collection: App.Data.curProductsSet,
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
        modifiers: function(category_id, product_id) {
            var isEditMode = !product_id,
                order = new App.Models.Myorder(),
                dfd = order.add_empty(product_id * 1, category_id * 1),
                ,
                self = this;

            this.prepare('modifiers', function() {
                App.Data.header.set('menu_index', null);
                App.Data.mainModel.set('mod', 'Main');
                App.Data.cart.set('visible', false);
                dfd.then(showProductModifiers);

                function showProductModifiers() {
                    var _order = order.clone(),
                        content;

                    content = /*self.getStanfordReloadItem(order) || */{
                        modelName: 'MyOrder',
                        mod: 'ItemCustomization',
                        className: 'myorder-item-customization',
                        model: _order,
                        ui: new Backbone.Model({isAddMode: true}),
                        action: action,
                        back: cancel,
                        doNotCache: true
                    };

                    App.Data.mainModel.set({
                        header: headers.main,
                        cart: carts.main,
                        content: content
                    });

                    self.change_page();

                    function action() {
                        var check = _order.check_order();

                        if (check.status === 'OK') {
                            _order.get_product().check_gift(function() {
                                App.Data.myorder.add(_order);
                                cancel();
                            }, function(errorMsg) {
                                App.Data.errors.alert(errorMsg); // user notification
                            });
                        } else {
                            App.Data.errors.alert(check.errorMsg); // user notification
                        }
                    }

                    function cancel() {
                        window.history.back();
                    }
                }
            });
            // showModifiers: function() {
            //     var myorder = new App.Models.Myorder(),
            //         isStanfordItem = App.Data.is_stanford_mode && this.model.get('is_gift'),
            //         def = myorder.add_empty(this.model.get('id'), this.model.get('id_category'));

            //     $('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').addClass('ui-visible');
            //     def.then(function() {
            //         $('#main-spinner').removeClass('ui-visible');
            //         App.Data.mainModel.set('popup', {
            //             modelName: 'MyOrder',
            //             mod: isStanfordItem ? 'StanfordItem' : 'Matrix',
            //             className: isStanfordItem ? 'stanford-reload-item' : '',
            //             model: myorder.clone(),
            //             action: 'add'
            //         });
            //     });
            // },
            //     action: function (event) {
            //         var check = this.model.check_order(),
            //             self = this;

            //         if (check.status === 'OK') {
            //             this.model.get_product().check_gift(function() {
            //                if (self.options.action === 'add') {
            //                    App.Data.myorder.add(self.model);
            //                } else {
            //                    var index = App.Data.myorder.indexOf(self.options.real) - 1;
            //                    App.Data.myorder.add(self.model, {at: index});
            //                    App.Data.myorder.remove(self.options.real);
            //                }

            //                $('#popup .cancel').trigger('click');
            //             }, function(errorMsg) {
            //                 App.Data.errors.alert(errorMsg); // user notification
            //             });
            //         } else {
            //             App.Data.errors.alert(check.errorMsg); // user notification
            //         }
            //    }
        },
        about: function() {
            this.prepare('about', function() {
                if (!App.Data.aboutModel) {
                    App.Data.aboutModel = new App.Models.AboutModel();
                }
                App.Data.header.set('menu_index', 1);
                App.Data.mainModel.set('mod', 'Main');
                App.Data.mainModel.set({
                    header: headers.main,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.timetables,
                        mod: 'Main',
                        about: App.Data.aboutModel,
                        className: 'store-info about-box'
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
                        mod: 'MapWithStores',
                        collection: stores,
                        className: 'store-info map-box'
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
            App.Data.header.set('menu_index', null);
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
            App.Data.header.set('menu_index', null);
            App.Data.mainModel.set({
                mod: 'Main',
                header: headers.main,
                cart: carts.main
            });

            var promises = this.setProfileEditContent(true);

            if (!promises.length) {
                return this.navigate('index', true);
            } else {
                Backbone.$.when.apply(Backbone.$, promises).then(this.change_page.bind(this));
            }
        },
        profile_payments: function() {
            App.Data.header.set('menu_index', null);
            App.Data.mainModel.set({
                mod: 'Main',
                header: headers.main,
                cart: carts.main
            });

            var promises = this.setProfilePaymentsContent(true);

            if (!promises.length) {
                return this.navigate('index', true);
            } else {
                Backbone.$.when.apply(Backbone.$, promises).then(this.change_page.bind(this));
            }
        },
        createCategoriesTree: function() {
            if (App.Data.categoriesTree) {
                return;
            }

            var tree = App.Data.categoriesTree = new App.Collections.Tree(),
                categories = App.Data.categories,
                categorySelection = App.Data.categorySelection,
                searchLine = App.Data.searchLine,
                self = this,
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

            // Need to update tree when 'subCategory' updates.
            this.listenTo(categorySelection, 'change:subCategory', function(model, value) {
                var item = tree.getItem('id', value, true);
                item && item.set('selected', true);
                // clear tree item selection
                if (value === model.defaults.subCategory && lastSelected) {
                    lastSelected.set('selected', false);
                    lastSelected = undefined;
                };
            });

            // need to update tree when 'parentCategory' updates
            this.listenTo(categorySelection, 'change:parentCategory', function(model, value) {
                var item = tree.getItem('id', value);
                item && item.set('collapsed', false);
            });

            // once categories are loaded need to add them to tree collection
            categories.receiving = categories.get_categories();
            categories.receiving.always(setCategoriesItems);

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
                        name: value[0].get('parent_name'),
                        sort: value[0].get('parent_sort'),
                        items: _.invoke(value, 'toJSON')
                    };
                    // add 'View All' category
                    value.length > 1 && data.items.unshift({
                        id: _.pluck(value, 'id'),
                        name: _loc.SUBCATEGORIES_VIEW_ALL,
                        parent_name: value[0].get('parent_name'),
                        sort: 0,
                        parent_id: value[0].get('parent_id')
                    });
                    return data;
                }));

                // and reset 'tree' collection with adding new data
                tree.reset(data);
                // init state
                initState();
            }

            function initState() {
                // restore state if #index/<data> exists
                self.restoreState({});
                // if searchLine and categorySelection contain default attributes need to select first subcategory replacing state.
                if (!searchLine.get('searchString') && categorySelection.areDefaultAttrs()) {
                    categorySelection.set({
                        parentCategory: tree.at(0).get('id'),
                        subCategory: tree.at(0).get('items').at(0).get('id'),
                    }, {
                        replaceState: true
                    });
                }
            }
        },
        showProducts: function(ids) {
            var self = this,
                isCached = false,
                treeItem = App.Data.categoriesTree.getItem('id', ids, true),
                productSet, key;

            ids = Array.isArray(ids) ? ids : [ids];
            key = ids.join();

            if (treeItem) {
                name = Array.isArray(treeItem.get('id')) ? treeItem.get('parent_name') : treeItem.get('name');
            }

            if (productSet = App.Data.productsSets.get(key)) {
                isCached = true;
            } else {
                productSet = App.Data.productsSets.add({id: key});
                productSet.set('name', name);
            }

            App.Data.curProductsSet.set('value', productSet);

            // get items
            !isCached && App.Collections.Products.get_slice_products(ids).then(function() {
                var products = [],
                    productsAttr = productSet.get('products');

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
                            filterResult: true,
                            sort: Number(App.Data.categories.get(id).get('sort')) + product.sort / floatNumber
                        }));
                    });
                });

                // set products and resolve status
                productsAttr.reset(products);
                setTimeout(productSet.set.bind(productSet, 'status', 'resolved'), 500);

                // Apply a sort method specified by user and listen to its further changes
                App.Data.sortItems.sortCollection(productsAttr);
            });
        },
        /**
         * Creates App.Data.sortItem collection.
         */
        initSortItems: function() {
            var sortItems = [
                // Sort by Default
                {
                    id: 1,
                    name: _loc.SORT_BY_DEFAULT,
                    sortStrategy: 'sortNumbers',
                    sortKey: 'sort',
                    sortOrder: 'asc',
                    selected: true
                },
                // Sort by New Arrivals
                {
                    id: 2,
                    name: _loc.SORT_BY_NEW_ARRIVALS,
                    sortStrategy: 'sortNumbers',
                    sortKey: 'created_date',
                    sortOrder: 'desc'
                },
                // Sort by Price: Low to High
                {
                    id: 3,
                    name: _loc.SORT_BY_LOW_TO_HIGH,
                    sortStrategy: 'sortNumbers',
                    sortKey: 'price',
                    sortOrder: 'asc'
                },
                // Sort by Price: High to Low
                {
                    id: 4,
                    name: _loc.SORT_BY_HIGH_TO_LOW,
                    sortStrategy: 'sortNumbers',
                    sortKey: 'price',
                    sortOrder: 'desc'
               }
            ];

            App.Data.sortItems = new App.Collections.SortItems(sortItems);
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

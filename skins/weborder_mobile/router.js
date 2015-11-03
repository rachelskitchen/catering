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

    var headerModes = {};
    var footerModes = {};

    /**
    * Default router data.
    */
    function defaultRouterData() {
        headerModes.Main = {mod: 'Main', className: 'main'};
        headerModes.Modifiers = {mod: 'Modifiers', className: 'modifiers'};
        headerModes.Cart = {mod: 'Cart'};
        headerModes.None = null;
        footerModes.Main = {mod: 'Main'};
        footerModes.Promo = {modelName: 'PromoMessage', mod: 'Main', className: 'promo-message-container bg-color1'};
        footerModes.None = null;
    }

    var Router = App.Routers.RevelOrderingRouter.extend({
        routes: {
            "": "index",
            "index": "index",
            "search/:search": "search",
            "products/:ids": "products",
            "modifiers/:id_category(/:id_product)": "modifiers",
            "cart": "cart",
            "checkout" : "checkout",
            "confirm": "confirm",
            "payments": "payments",
            "card" : "card",
            "giftcard" : "gift_card",
            "stanfordcard": "stanford_card",
            "stanford_student_verification": "stanford_student_verification",
            "done": "done",
            "location": "location",
            "about": "about",
            "gallery": "gallery",
            "maintenance": "maintenance",
            "pay": "pay",
            // "profile(/:step)": "profile",
            // "loyalty": "loyalty",
            "rewards_card_submit": "rewards_card_submit",
            "rewards": "rewards",
            "*other": "index"
        },
        hashForGoogleMaps: ['location', 'map', 'checkout'],//for #index we start preload api after main screen reached
        lastHash: null,
        rewardsPageReferrerHash: null,
        initialize: function() {
            App.Data.get_parameters = parse_get_params(); // get GET-parameters from address line
            var self = this;

            // set locked routes if online orders are disabled
            if(!App.Settings.online_orders) {
                this.lockedRoutes = [];
            }

            // load main, header, footer necessary files
            this.prepare('main', function() {
                App.Views.Generator.enableCache = true;
                // set header, footer, main models
                App.Data.header = new App.Models.HeaderModel({
                    cart: this.navigate.bind(this, 'cart', true),
                    addProductCb: this.navigate.bind(this, 'index', true)
                });
                App.Data.footer = new App.Models.FooterModel();
                var mainModel = App.Data.mainModel = new App.Models.MainModel();
                var ests = App.Data.establishments;

                // init RevelAPI
                this.initRevelAPI();

                // only establishment with reward cards option enabled can show RevelAPI buttons
                App.Settings.RevelAPI = App.Settings.RevelAPI && App.Settings.enable_reward_cards_collecting;

                // init payments handlers
                !App.Data.settings.get('isMaintenance') && this.paymentsHandlers();

                this.listenTo(App.Data.myorder, 'add remove', function() {
                    App.Data.header.set('cartItemsQuantity', App.Data.myorder.get_only_product_quantity());
                });

                new App.Views.MainView.MainMainView({
                    model: mainModel,
                    el: 'body'
                });
//common
                this.listenTo(this, 'needLoadEstablishments', this.getEstablishments, this); // get a stores list
//common
                this.listenTo(ests, 'resetEstablishmentData', this.resetEstablishmentData, this);
                this.listenTo(ests, 'resetEstablishmentData', mainModel.trigger.bind(mainModel, 'showSpinnerAndHideContent'), this);
//common
                this.listenTo(ests, 'clickButtonBack', mainModel.set.bind(mainModel, 'isBlurContent', false), this);

                this.navigationControl();

                // run history tracking
                this.triggerInitializedEvent();
            });

            var checkout = App.Data.myorder.checkout;
            checkout.trigger("change:dining_option", checkout, checkout.get("dining_option"));

            this.listenTo(this, 'route', function() {
                this.lastHash = location.hash.slice(1);
            });

            App.Routers.RevelOrderingRouter.prototype.initialize.apply(this, arguments);
        },
        paymentsHandlers: function() {
            var mainModel = App.Data.mainModel,
                myorder = App.Data.myorder,
                paymentCanceled = false

            this.listenTo(myorder, 'cancelPayment', function() {
                paymentCanceled = true;
            });

            this.listenTo(myorder, "paymentFailed", function(message) {
                mainModel.trigger('loadCompleted');
                message && App.Data.errors.alert(message); // user notification
            }, this);

            /** [Credit Card] **/
            App.Data.payments = new App.Models.Payments(App.Data.settings.get_payment_process());

            // invokes when user chooses the 'Credit Card' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithCreditCard', function() {
                if(App.Settings.RevelAPI) {
                    App.Data.RevelAPI.checkCreditCard();
                } else {
                    showDefaultCardView.call(this);
                }
            }, this);

            this.listenTo(myorder, 'payWithCreditCard', function() {
                var paymentProcessor = App.Data.settings.get_payment_process();
                myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    card: paymentProcessor.credit_card_dialog
                }, sendRequest.bind(window, PAYMENT_TYPE.CREDIT));
            });

            /* Gift Card */
            App.Data.giftcard = new App.Models.GiftCard;

            // invokes when user chooses the 'Gift Card' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithGiftCard', function() {
                this.navigate('giftcard', true);
            }, this);

            this.listenTo(App.Data.giftcard, 'pay', function() {
                myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    giftcard: true
                }, sendRequest.bind(window, PAYMENT_TYPE.GIFT));
            }, this);

            /* Cash Card */
            // invokes when user chooses the 'Cash' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithCash', function() {
                myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                }, sendRequest.bind(window, PAYMENT_TYPE.NO_PAYMENT));
            }, this);

            /* PayPal */
            // invokes when user chooses the 'PayPal' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithPayPal', function() {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                }, sendRequest.bind(window, PAYMENT_TYPE.PAYPAL));
            }, this);

            /* Stanford Card */
            if(_.isObject(App.Settings.payment_processor) && App.Settings.payment_processor.stanford) {
                App.Data.stanfordCard = new App.Models.StanfordCard();

                // invokes when user chooses the 'Stanford Card' payment processor on the #payments screen
                this.listenTo(App.Data.payments, 'payWithStanfordCard', function() {
                    this.navigate('stanfordcard', true);
                }, this);

                this.listenTo(App.Data.stanfordCard, 'pay', function() {
                    myorder.check_order({
                        order: true,
                        tip: true,
                        customer: true,
                        checkout: true,
                    }, sendRequest.bind(window, PAYMENT_TYPE.STANFORD));
                });
            }

            function sendRequest(paymentType) {
                saveAllData();
                mainModel.trigger('loadStarted');
                myorder.create_order_and_pay(paymentType);
                paymentCanceled && mainModel.trigger('loadCompleted');
                paymentCanceled = false;
            }
        },
        navigationControl: function() {
            this.listenTo(App.Data.header, 'change:tab', function() {
                switch(App.Data.header.get('tab')) {
                    case 0:
                        this.navigate('index', true);
                        break;

                    case 1:
                        this.navigate('about', true);
                        break;

                    case 2:
                        this.navigate('location', true);
                        break;
                }
            }, this);

            // onApplyRewardsCard event occurs when Rewards Card's 'Apply' button is clicked on #checkout page
            this.listenTo(App.Data.myorder.rewardsCard, 'onApplyRewardsCard', this.navigate.bind(this, 'rewards_card_submit', true));

            // onGetRewards event occurs when Rewards Card's 'Submit' button is clicked on 'Rewards Card Info' popup
            this.listenTo(App.Data.myorder.rewardsCard, 'onGetRewards', function() {
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.rewardsCard.getRewards();
            });

            // onRedemptionApplied event occurs when 'Apply Reward' btn is clicked
            this.listenTo(App.Data.myorder.rewardsCard, 'onRedemptionApplied', function() {
                var self = this;
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.splitAllItemsWithPointValue();
                App.Data.myorder.get_cart_totals().always(function() {
                    App.Data.mainModel.trigger('loadCompleted');
                    self.navigate(self.rewardsPageReferrerHash, true);
                });
            }, this);

            // onRewardsErrors event occurs when /weborders/reward_cards/ request fails
            this.listenTo(App.Data.myorder.rewardsCard, 'onRewardsErrors', function(errorMsg) {
                App.Data.errors.alert(errorMsg);
                App.Data.mainModel.trigger('loadCompleted');
            });

            // onRewardsReceived event occurs when Rewards Card data is received from server
            this.listenTo(App.Data.myorder.rewardsCard, 'onRewardsReceived', function() {
                var rewardsCard = App.Data.myorder.rewardsCard;

                if(rewardsCard.get('points').isDefault() && rewardsCard.get('visits').isDefault() && rewardsCard.get('purchases').isDefault()) {
                    App.Data.errors.alert(MSG.NO_REWARDS_AVAILABLE);
                } else {
                    this.navigate('rewards', true);
                }

                App.Data.mainModel.trigger('loadCompleted');
            }, this);

            // onResetData event occurs when user resets Rewards Card
            this.listenTo(App.Data.myorder.rewardsCard, 'onResetData', function() {
                App.Data.myorder.get_cart_totals();
            });

            // onStanfordCardError event occurs when user submit invalid Stanford Card
            App.Data.stanfordCard && this.listenTo(App.Data.stanfordCard, 'onStanfordCardError', function(msg) {
                msg && App.Data.errors.alert(msg);
            });
        },
        /**
         * Navigate on #done when payment is completed.
         */
        onPayHandler: function(capturePhase) {
            this.navigate('done',  {
                trigger: true,
                replace: capturePhase
            });
        },
        /**
        * Get a stores list.
        */
        getEstablishments: function() {
            this.getEstablishmentsCallback = function() {
                var si = App.Data.storeInfo;
                if (/^(index.*)?$/i.test(Backbone.history.fragment) && si) si.set('needShowStoreChoice', true);
            };
            App.Routers.RevelOrderingRouter.prototype.getEstablishments.apply(this, arguments);
        },
        initCategories: function() {
            if (!App.Data.categories) {
                App.Data.categories = new App.Collections.Categories();
                App.Data.parentCategories = new App.Collections.SubCategories();
                App.Data.categories.loadData = App.Data.categories.get_categories();
                App.Data.categories.loadData.then(function() {
                    App.Data.parentCategories.add(App.Data.categories.getParents());
                });
            }

            return App.Data.categories.loadData;
        },
        index: function() {
            this.prepare('index', function() {
                // load categories
                this.initCategories().then(this.change_page.bind(this));

                App.Data.header.set({
                    page_title: App.Settings.business_name || '',
                    back: App.Data.dirMode ? this.navigateDirectory.bind(this) : null,
                    back_title: App.Data.dirMode ? _loc.BACK : '',
                    tab: 0
                });

                var content = [{
                    modelName: 'Categories',
                    collection: App.Data.parentCategories,
                    mod: 'Parents',
                    cacheId: true,
                    className: 'content_scrollable'
                }];

                var footerMode;
                if (App.Settings.promo_message) {
                    footerMode = footerModes.Promo;
                } else {
                    footerMode = footerModes.None;
                }

                App.Data.mainModel.set({
                    header: headerModes.Main,
                    footer: footerMode,
                    contentClass: '',
                    content: content
                });

                if(App.Data.categories.loadData.state() == 'resolved')
                    this.change_page();

                App.Data.settings.load_geoloc();
            });
        },
        search: function(search) {
            var self = this;

            this.prepare('search', function() {
                if (!App.Data.search) {
                    App.Data.search = new App.Collections.Search();
                }

                App.Data.header.set({
                    page_title: App.Settings.business_name || '',
                    back: window.history.back.bind(window.history),
                    back_title: _loc.BACK,
                    search: decodeURIComponent(search),
                    showSearch: true
                });

                App.Data.mainModel.set({
                    header: headerModes.Main,
                    footer: footerModes.None
                });

                // need to show serach result list when request is complete
                this.listenToOnce(App.Data.search, 'onSearchComplete', showResults);

                // need to stop listening search events when hash changes (it fixes case when user changes hash during request )
                this.listenToOnce(this, 'route', this.stopListening.bind(this, App.Data.search, 'onSearchComplete', showResults));

                // perform search
                App.Data.search.search(decodeURIComponent(search));

                function showResults(searchModel) {
                    var category = new App.Models.Category({
                        name: _loc.SEARCH_RESULTS + ': ' + searchModel.get('pattern'),
                        products: searchModel.get('products') || (new App.Collections.Products())
                    });

                    App.Data.mainModel.set({
                        contentClass: '',
                        content: {
                            modelName: 'Categories',
                            model: category,
                            mod: 'Item',
                            tagName: 'div',
                            cacheId: true,
                            cacheIdUniq: search
                        }
                    });

                    self.change_page();
                }
            });
        },
        products: function(ids) {
            var self = this,
                _ids = JSON.parse('[' + ids + ']'),
                fetched;

            if(typeof this.products.fetched == 'undefined') {
                this.products.fetched = {};
            }

            fetched = this.products.fetched;

            this.prepare('products', function() {
                App.Data.header.set({
                    page_title: App.Settings.business_name || '',
                    back: self.navigate.bind(self, 'index', true),
                    back_title: _loc.BACK
                });

                App.Data.mainModel.set({
                    header: headerModes.Main,
                    footer: footerModes.None
                });

                // load categories and products
                $.when(this.initCategories(), App.Collections.Products.get_slice_products(_ids)).then(function() {
                    var parentCategory = App.Data.parentCategories.findWhere({ids: ids}),
                        subs;

                    if(parentCategory) {
                        subs = parentCategory.get('subs');
                    } else {
                        return self.navigate('index', true);
                    }

                    !fetched[ids] && subs.each(function(category) {
                        var products = App.Data.products[category.get('id')];
                        category.get('products').reset(products ? products.toJSON() : []);
                    });

                    fetched[ids] = true;

                    App.Data.mainModel.set({
                        contentClass: '',
                        content: {
                            modelName: 'Categories',
                            model: parentCategory,
                            mod: 'Main',
                            cacheId: true,
                            cacheIdUniq: ids
                        }
                    });

                    self.change_page();
                });
            });
        },
        modifiers: function(id_category, id_product) {
            this.prepare('modifiers', function() {
                var self = this,
                    header = App.Data.header,
                    isEditMode = !id_product,
                    order = isEditMode ? App.Data.myorder.at(id_category) : new App.Models.Myorder(),
                    originOrder = null,
                    isOrderChanged;

                if(!order)
                    return this.navigate('index', true);

                header.set({
                    back: window.history.back.bind(window.history),
                    back_title: _loc.BACK,
                    cart: cart
                });

                App.Data.mainModel.set({
                    header: headerModes.Modifiers,
                    footer: footerModes.None
                });

                if(isEditMode) {
                    originOrder = order.clone();
                    this.listenTo(order, 'change', setHeaderToUpdate);
                    setHeaderToUpdate();
                    showProductDetails();
                    isOrderChanged = false;
                } else {
                    setHeaderToAdd();
                    order.add_empty(id_product * 1, id_category * 1).then(showProductDetails);
                }

                function showProductDetails() {
                    if(!isEditMode) {
                        order = order.clone();
                    }

                    var content = self.getStanfordReloadItem(order) || {
                        modelName: 'MyOrder',
                        model: order,
                        mod: 'Matrix',
                        cacheId: false
                    };

                    App.Data.mainModel.set({
                        contentClass: '',
                        content: content
                    });

                    self.change_page();
                }

                this.listenToOnce(this, 'route', function back() {
                    self.stopListening(order, 'change', setHeaderToUpdate);
                    if (isOrderChanged) {
                        var product = order.get_product();
                        order.update(originOrder);
                        // need to update input values otherwise current input.value overrides restored values
                        order.trigger('change:special', order, order.get('special'));
                        order.trigger('change:quantity', order, order.get('quantity'));
                        if(product.get('is_gift')) {
                            order.trigger('change:initial_price', order, order.get('initial_price'));
                            order.trigger('change:product', order, product); // for Stanford Reload Item
                            product.trigger('change:price', product, product.get('price'));
                            product.trigger('change:gift_card_number', product, product.get('gift_card_number'));
                        }
                    }
                });

                function cart() {
                    self.stopListening(order, 'change', setHeaderToUpdate);
                    header.set('cart', self.navigate.bind(self, 'cart', true), {silent: true});
                    self.navigate('cart', true);
                }

                function setHeaderToUpdate() {
                    isOrderChanged = true;
                    header.set({
                        page_title: _loc.CUSTOMIZE,
                        link_title: _loc.UPDATE,
                        link: !App.Settings.online_orders ? header.defaults.link : function() {
                            header.updateProduct(order);
                            order.set('discount', originOrder.get('discount').clone(), {silent: true});
                            App.Data.myorder.splitItemAfterQuantityUpdate(order, originOrder.get('quantity'), order.get('quantity'), true);
                            // originOrderItem.update(orderItem);
                            originOrder = order.clone();
                            isOrderChanged = false;
                        }
                    });
                }

                function setHeaderToAdd() {
                    header.set({
                        page_title: _loc.CUSTOMIZE,
                        link_title: _loc.ADD_TO_CART,
                        link: !App.Settings.online_orders ? header.defaults.link : function() {
                            header.addProduct(order).done(function () {
                                self.listenTo(order, 'change', setHeaderToUpdate);
                            });
                        }
                    });
                }
            });
        },
        cart: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_MYORDER_PT,
                back_title: _loc.MENU,
                back: this.navigate.bind(this, 'index', true),
            });

            this.prepare('cart', function() {
                App.Data.footer.set({
                    action: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Cart,
                    footer:  {
                            total: App.Data.myorder.total,
                            mod: 'Cart',
                            className: 'footer bg-color10'
                        },
                    contentClass: '',
                    content: [
                        {
                            modelName: 'MyOrder',
                            collection: App.Data.myorder,
                            mod: 'List',
                            className: 'myorderList'
                        },
                        {
                            modelName: 'MyOrder',
                            model: App.Data.myorder.checkout,
                            mod: 'Note',
                            className: 'myorderNote'
                        }
                    ]
                });

                this.change_page();
            });
        },
        checkout: function() {
            var self = this;

            App.Data.header.set({
                page_title: _loc.HEADER_CHECKOUT_PT,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'cart', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {   className: 'footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'checkout' }
            });

            this.prepare('checkout', function() {
                var RevelAPI = App.Data.RevelAPI;

                if(!App.Data.card)
                    App.Data.card = new App.Models.Card({RevelAPI: RevelAPI});

                if(!App.Data.customer) {
                    App.Data.customer =  new App.Models.Customer({RevelAPI: RevelAPI});
                    App.Data.customer.loadAddresses();
                }

                App.Data.footer.set({
                    btn_title: _loc.CONTINUE,
                    action: setAction(this.navigate.bind(this, 'confirm', true))
                });

                App.Data.mainModel.set({
                    contentClass: 'bg-color12',
                    content: [
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            collection: App.Data.myorder,
                            mod: 'OrderType',
                            DINING_OPTION_NAME: self.LOC_DINING_OPTION_NAME,
                            className: 'checkout',
                            cacheId: true
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            customer: App.Data.customer,
                            rewardsCard: App.Data.myorder.rewardsCard,
                            mod: 'Main',
                            className: 'checkout',
                            cacheId: true
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            timetable: App.Data.timetables,
                            mod: 'Pickup',
                            className: 'checkout',
                            cacheId: true
                        }
                    ]
                });

                this.change_page();
            });

            function setAction(cb) {
                return function () {
                    App.Data.myorder.check_order({
                        order: true,
                        customer: true,
                        checkout: true,
                        validationOnly: true
                    }, function() {
                        if(App.Data.stanfordCard && App.Data.stanfordCard.get('needToAskStudentStatus') && !App.Data.myorder.checkout.isDiningOptionOnline()) {
                            // App.Data.router.navigate('stanford_is_student', true);
                            showIsStudentQuestion();
                        } else {
                            cb();
                        }
                    });
                };
            }

            function showIsStudentQuestion() {
                App.Data.errors.alert('', false, false, {
                    isConfirm: true,
                    typeIcon: '',
                    confirm: {
                        ok: _loc.YES,
                        cancel: _loc.NO
                    },
                    customView: new App.Views.StanfordCardView.StanfordCardStudentStatusView({
                        model: App.Data.stanfordCard
                    }),
                    callback: function(res) {
                        if(res) {
                            self.navigate('stanford_student_verification', true);
                        } else {
                            App.Data.stanfordCard.set('needToAskStudentStatus', false);
                            self.navigate('confirm', true);
                        }
                    }
                });
            }
        },
        confirm: function() {
            var self = this,
                load = $.Deferred(),
                myorder = App.Data.myorder;

            if (myorder.length === 0) {
                load = this.loadData();
            } else {
                load.resolve();
            }

            App.Data.header.set({
                page_title: _loc.HEADER_CHECKOUT_PT,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'checkout', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('confirm', function() {
                var payments = App.Data.settings.get_payment_process(),
                    payment_count = _.isObject(payments) ? payments.payment_count : 0,
                    content = [];

                content.push({
                    modelName: 'Total',
                    model: myorder.total,
                    mod: 'Checkout',
                    collection: myorder,
                    checkout: myorder.checkout,
                    rewardsCard: myorder.rewardsCard,
                    showDiscountCode: showDiscountCode,
                    showRewards: this.navigate.bind(this, 'rewards_card_submit', true),
                    cacheId: true
                },
                {
                    modelName: 'Tips',
                    model: myorder.total.get('tip'),
                    mod: 'Line',
                    total: myorder.total,
                    cacheId: true
                });

                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                var payBtn = function() {
                    App.Data.footer.set({
                        btn_title: _loc.CONTINUE,
                        action: payment_count > 1 ? goToPayments : App.Data.payments.onPay.bind(App.Data.payments)
                    });
                }

                // Enhancement #12904
                // If grandTotal is $0 we must show "Place Order" button instead of "Pay".
                var placeOrderBtn = function() {
                    if (!Number(myorder.total.get('grandTotal'))) {
                        App.Data.payments.set('selected', 'cash');
                        App.Data.footer.set({
                            btn_title: _loc.PLACE_ORDER,
                            action: App.Data.payments.onPay.bind(App.Data.payments)
                        });
                    }
                    else {
                        payBtn();
                    }
                };

                if(payment_count > 1) {
                    placeOrderBtn();
                    this.listenTo(myorder.total, 'change:grandTotal', placeOrderBtn);
                    // unbind listener
                    this.listenToOnce(this, 'route', function() {
                        this.stopListening(myorder.total, 'change:grandTotal', placeOrderBtn);
                    });

                    App.Data.mainModel.set({
                        footer: {
                            mod: 'Main',
                            className: 'footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'confirm'
                        }
                    });
                } else {
                    payBtn();
                    App.Data.mainModel.set({
                        footer: {
                            mod: 'PaymentSelection',
                            total: myorder.total,
                            className: 'footer footer-payments bg-color10',
                            cacheId: true
                        }
                    });
                }

                App.Data.mainModel.set({
                    contentClass: 'bg-color12',
                    content: content
                });

                this.change_page();
            }, [load]);

            function goToPayments() {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true
                }, function() {
                   self.navigate('payments', true);
                });
            }

            function showDiscountCode() {
                App.Data.errors.alert('', false, false, {
                    isConfirm: true,
                    typeIcon: '',
                    confirm: {
                        ok: _loc.MYORDER_APPLY
                    },
                    customView: new App.Views.CheckoutView.CheckoutDiscountCodeView({
                        model: myorder.checkout,
                        className: 'checkout-discount-code'
                    }),
                    callback: function(res) {
                        if(!res) {
                            return;
                        }

                        if (!/^[\d\w]{1,200}$/.test(myorder.checkout.get("discount_code")) ) {
                            return App.Data.errors.alert(MSG.ERROR_INCORRECT_DISCOUNT_CODE); // user notification
                        }

                        myorder.get_cart_totals({apply_discount: true});
                    }
                });
            }
        },
        payments: function() {
            App.Data.header.set({
                page_title: _loc.PAY,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'confirm', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {
                    mod: 'PaymentSelection',
                    total: App.Data.myorder.total,
                    className: 'footer footer-payments bg-color10',
                    cacheId: true
                }
            });

            this.prepare('payments', function() {
                App.Data.footer.set({
                    action: App.Data.payments.onPay.bind(App.Data.payments)
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [
                        {
                            modelName: 'Payments',
                            model: App.Data.payments,
                            checkout: App.Data.myorder.checkout,
                            mod: 'Main',
                            collection: App.Data.myorder,
                            cacheId: true
                        }
                    ]
                });

                this.change_page();
            });
        },
        card: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_CARD_PT,
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {   mod: 'PaymentInfo',
                            total: App.Data.myorder.total,
                            className: 'footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'card' }
            });

            this.prepare('card', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.footer.set({
                    btn_title: _loc.FOOTER_PROCEED,
                    action: function() {
                        App.Data.myorder.trigger('payWithCreditCard');
                    }
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [
                        {
                            modelName: 'Card',
                            model: App.Data.card,
                            mod: 'Main',
                            cacheId: true
                        }
                    ]
                });

                this.change_page();
            });
        },
        gift_card: function() {
            // Reload captcha every time when navigated to giftcard page (Bug 29739)
            App.Data.giftcard.trigger('updateCaptcha');

            App.Data.header.set({
                page_title: _loc.HEADER_GIFT_CARD_PT,
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {   mod: 'Main',
                            className: 'footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'giftcard' }
            });

            this.prepare('giftcard', function() {
                App.Data.footer.set({
                    btn_title: _loc.FOOTER_PROCEED,
                    action: function() {
                        App.Data.giftcard.trigger('add_card');
                        App.Data.giftcard.trigger('pay');
                    }
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [
                        {
                            modelName: 'GiftCard',
                            model: App.Data.giftcard,
                            mod: 'Main',
                            cacheId: true
                        }
                    ]
                });

                this.change_page();
            });
        },
        stanford_card: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_STANFORD_CARD_PT,
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {
                        mod: 'StanfordCard',
                        submitCard: submitCard,
                        submitOrder: App.Data.stanfordCard.trigger.bind(App.Data.stanfordCard, 'pay'),
                        card: App.Data.stanfordCard,
                        className: 'footer bg-color10',
                        cacheId: true,
                        cacheIdUniq: 'stanford_card'
                }
            });

            this.prepare('stanfordcard', function() {
                App.Data.mainModel.set({
                    contentClass: '',
                    content: [{
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        mod: 'Main',
                        myorder: App.Data.myorder,
                        cacheId: true,
                        cacheIdUniq: 'stanford_card'
                    }, {
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        collection: App.Data.stanfordCard.get('plans'),
                        mod: 'Plans',
                        className: 'stanford-card-plans',
                        cacheId: true,
                        cacheIdUniq: 'stanford_card'
                    }]
                });

                this.change_page();
            });

            function submitCard() {
                var mainModel = App.Data.mainModel;
                mainModel.trigger('loadStarted');
                App.Data.stanfordCard.getPlans().then(mainModel.trigger.bind(mainModel, 'loadCompleted'));
            }
        },
        stanford_student_verification: function() {
            var self = this;

            App.Data.header.set({
                page_title: _loc.STANFORD_VERIFICATION,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'checkout', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {
                        mod: 'Card',
                        card: App.Data.stanfordCard,
                        className: 'footer bg-color10',
                        cacheId: true,
                        cacheIdUniq: 'stanford_student_verification'
                }
            });

            this.prepare('stanford_student_verification', function() {
                App.Data.footer.set({
                    btn_title: _loc.CONFIRM_SUBMIT,
                    action: verify
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [{
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        mod: 'Main',
                        myorder: App.Data.myorder,
                        cacheId: true,
                        cacheIdUniq: 'stanford_student_verification'
                    }]
                });

                this.change_page();
            });

            function verify() {
                var mainModel = App.Data.mainModel,
                    card = App.Data.stanfordCard;

                mainModel.trigger('loadStarted');
                card.getPlans().then(function() {
                    if(card.get('validated')) {
                        self.navigate('confirm', true);
                    } else {
                        mainModel.trigger('loadCompleted');
                    }
                });
            }
        },
        /**
         * Handler for #done.
         * If App.Data.myorder.paymentResponse is null this handler isn't executed and run #index handler.
         */
        done: function() {
            // if App.Data.myorder.paymentResponse isn't defined navigate to #index
            if(!(App.Data.myorder.paymentResponse instanceof Object)) {
                return this.navigate('index', true);
            }

            var success = App.Data.myorder.paymentResponse.status === 'OK';

            App.Data.header.set({
                page_title: success ? _loc.DONE_THANK_YOU + '!' : '',
                back_title: '',
                back: this.navigate.bind(this, 'index', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: footerModes.None
            });

            this.prepare('done', function() {
                // if App.Data.customer doesn't exist (success payment -> history.back() to #confirm -> history.forward() to #done)
                // need to init it.
                if(!App.Data.customer) {
                    this.loadCustomer();
                }

                App.Data.mainModel.set({
                    contentClass: 'bg-color12 done-container',
                    content: {
                        modelName: 'Main',
                        model: App.Data.mainModel,
                        payment: new Backbone.Model({success: success}),
                        mod: "Done",
                        className: 'done text-center'
                    }
                });

                this.change_page();
            });
        },
        location: function() {
            App.Data.header.set({
                page_title: App.Settings.business_name || '',
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history),
                tab: 2
            });

            App.Data.mainModel.set({
                header: headerModes.Main,
                footer: footerModes.None
            });

            this.prepare('store_info', function() {
                App.Data.mainModel.set({
                    contentClass: '',
                    content: {
                        modelName: 'StoreInfo',
                        mod: 'Map',
                        className: 'map'
                    }
                });

                this.change_page();
            });
        },
        about: function() {
            var model = new Backbone.Model({
                    hours: App.Data.timetables.get('hours')
                });

            App.Data.header.set({
                page_title: App.Settings.business_name || '',
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history),
                tab: 1
            });

            App.Data.mainModel.set({
                header: headerModes.Main,
                footer: footerModes.None
            });

            this.prepare('store_info', function() {
                App.Data.mainModel.set({
                    contentClass: '',
                    content: {
                        modelName: 'StoreInfo',
                        model: model,
                        mod: 'Main',
                        className: 'store-info',
                        cacheId: true
                    }
                });

                this.change_page();
            });
        },
        gallery: function() {
            App.Data.mainModel.set({
                header: headerModes.None,
                footer: footerModes.None,
            });

            this.prepare('store_info', function() {
                if (!App.Data.AboutModel) {
                    App.Data.AboutModel = new App.Models.AboutModel();
                }
                App.Data.mainModel.set({
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.AboutModel,
                        mod: 'Gallery',
                        className: 'gallery',
                        cacheId: true
                    }
                });

                this.change_page();
            });
        },
        maintenance : function() {
            App.Routers.RevelOrderingRouter.prototype.maintenance.apply(this, arguments);

            if(!App.Data.settings.get('isMaintenance')) {
                return;
            }

            App.Data.header.set({
                page_title: '',
                back_title: App.Data.dirMode ? _loc.BACK : '',
                back: App.Data.dirMode ? this.navigateDirectory.bind(this) : null
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: footerModes.None,
            });

            this.prepare('maintenance', function() {
                App.Data.mainModel.set({
                    contentClass: '',
                    content: {
                        modelName: 'Maintenance',
                        mod: 'Main',
                        className: 'maintenance text-center'
                    }
                });

                this.change_page();
            });
        },
        profile: function(step) {
            App.Data.header.set({
                page_title: _loc['HEADER_PROFILE_PT'],
                back_title: _loc['HEADER_PROFILE_BT'],
                back: App.Data.RevelAPI.trigger.bind( App.Data.RevelAPI, 'onProfileCancel')
            });
            return App.Routers.RevelOrderingRouter.prototype.profile.call(this, step, headerModes.Profile, footerModes.Profile);
        },
        loyalty: function() {
            return App.Routers.RevelOrderingRouter.prototype.loyalty.call(this, headerModes.Main, footerModes.Loyalty);
        },
        rewards_card_submit: function() {
            var rewardsCard = App.Data.myorder.rewardsCard;
            this.rewardsPageReferrerHash = this.lastHash;

            App.Data.header.set({
                page_title: _loc.HEADER_REWARDS_CARD_PT,
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history)
            });

            App.Data.footer.set({
                btn_title: _loc.CONFIRM_SUBMIT,
                action: rewardsCard.trigger.bind(rewardsCard, 'onGetRewards')
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {
                        card: rewardsCard,
                        mod: 'Card',
                        className: 'footer bg-color10',
                        cacheId: true,
                        cacheIdUniq: 'rewards_card'
                    }
            });

            this.prepare('rewards', function() {
                App.Data.mainModel.set({
                    contentClass: '',
                    content: [{
                        modelName: 'Rewards',
                        mod: 'Card',
                        model: rewardsCard,
                        className: 'rewards-info',
                        cacheId: true
                    }]
                });

                this.change_page();
            });
        },
        rewards: function() {
            var rewardsCard = App.Data.myorder.rewardsCard;

            App.Data.header.set({
                page_title: _loc.HEADER_REWARDS_PT,
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart,
                footer: {
                        rewardsCard: rewardsCard,
                        mod: 'RewardRedemption',
                        className: 'footer bg-color10'
                    }
            });

            App.Data.footer.set({
                btn_title: _loc.CHECKOUT_APPLY,
                action: function() {
                    rewardsCard.trigger('beforeRedemptionApplied');
                    rewardsCard.trigger('onRedemptionApplied');
                }
            });

            this.prepare('rewards', function() {
                App.Data.mainModel.set({
                    contentClass: '',
                    content: [{
                        modelName: 'Rewards',
                        mod: 'Info',
                        model: rewardsCard,
                        className: 'rewards-info',
                        collection: App.Data.myorder,
                        points: rewardsCard.get('points'),
                        visits: rewardsCard.get('visits'),
                        purchases: rewardsCard.get('purchases')
                    }]
                });

                this.change_page();
            });
        },
        getStanfordReloadItem: function(order) {
            var product = order.get_product(),
                footerStanfordReload,
                stanfordCard,
                stanfordState;

            if(App.Data.is_stanford_mode && product && product.get('is_gift')) {
                stanfordCard = order.get('stanfordCard');

                stanfordState = new Backbone.Model({
                    showPlans: hasPlans()
                });

                footerStanfordReload = {
                    mod: 'StanfordReload',
                    card: stanfordCard,
                    orderItem: order,
                    className: 'footer bg-color10'
                };

                App.Data.footer.set({
                    btn_title: _loc.NEXT,
                    action: getPlans
                });

                // listen to initial price change
                this.listenTo(order, 'change:initial_price', linkBehavior);

                // define footer behavior
                this.listenTo(stanfordCard, 'change:validated', setFooter);
                setFooter();

                // unbind stanford reload item listeners
                this.listenToOnce(this, 'route', function() {
                    this.stopListening(order, 'change:initial_price', linkBehavior);
                    this.stopListening(stanfordCard, 'change:validated', setFooter);
                    App.Data.header.set('enableLink', true); // restore default value
                });

                return {
                    modelName: 'MyOrder',
                    model: order,
                    mod: 'StanfordItem',
                    stanfordState: stanfordState,
                    cacheId: false
                };
            }

            function setFooter() {
                if (hasPlans()) {
                    stanfordState.set('showPlans', true);
                    App.Data.mainModel.set({footer: footerModes.None});
                } else {
                    stanfordState.set('showPlans', false);
                    App.Data.mainModel.set({footer: footerStanfordReload});
                }
                linkBehavior();
            }

            function linkBehavior() {
                var stanfordCard = order.get('stanfordCard'),
                    price = Number(order.get('initial_price')),
                    number = stanfordCard.get('number'),
                    plan = stanfordCard.get('planId');
                App.Data.header.set('enableLink', Boolean(price && number && plan));
            }

            function hasPlans() {
                return stanfordCard.get('validated') && stanfordCard.get('plans').length;
            }

            function getPlans() {
                var mainModel = App.Data.mainModel;
                mainModel.trigger('loadStarted');
                stanfordCard.getPlans(true).then(mainModel.trigger.bind(mainModel, 'loadCompleted'));
            }
        },
        initRevelAPI: function() {
            App.Routers.RevelOrderingRouter.prototype.initRevelAPI.apply(this, arguments);

            var RevelAPI = App.Data.RevelAPI,
                appName;

            if(!App.Data.dirMode) {
                appName = App.Data.get_parameters.appName ? decodeURIComponent(App.Data.get_parameters.appName) : App.Settings.brand_name;
                RevelAPI.set({
                    appName: /\w+'s(\s.*)?$/.test(appName) ? appName : 'the ' + appName,
                    appPossessiveName: /\w+'s(\s.*)?$/.test(appName) ? appName : appName + "'s",
                    appShortName: appName,
                    text1: MSG.BRAND_DIRECTORY_WELCOME_TEXT
                });
            }

            if(!RevelAPI.isAvailable()) {
                return;
            }

            this.listenTo(RevelAPI, 'onPayWithSavedCreditCard', function() {
                App.Data.card.set(RevelAPI.get('card').toJSON());
                App.Data.myorder.trigger('payWithCreditCard');
            }, this);

            this.listenTo(RevelAPI, 'onPayWithCustomCreditCard', function() {
                showDefaultCardView.call(this);
            }, this);
        }
    });

    function showDefaultCardView() {
        var paymentProcessor = App.Data.settings.get_payment_process();
        if(paymentProcessor.credit_card_dialog) {
            this.navigate('card', true);
        } else {
            App.Data.myorder.trigger('payWithCreditCard');
        }
    }

    return new main_router(function() {
        defaultRouterData();
        App.Routers.Router = Router;
    });
});

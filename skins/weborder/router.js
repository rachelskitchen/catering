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
        headers.checkout = {mod: 'Checkout', className: 'checkout'};
        carts.main = {mod: 'Main', className: 'main'};
        carts.checkout = {mod: 'Checkout', className: 'checkout'};
    }

    var Router = App.Routers.RevelOrderingRouter.extend({
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
                var mainModel = App.Data.mainModel = new App.Models.MainModel({
                    goToDirectory: App.Data.dirMode ? this.navigateDirectory.bind(this) : new Function,
                    isDirMode: App.Data.dirMode
                });
                var ests = App.Data.establishments;

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
                    cartCollection: App.Data.myorder
                });
                ests.getModelForView().set('clientName', mainModel.get('clientName'));

                // init Stanford Card model if it's turned on
                if(_.isObject(App.Settings.payment_processor) && App.Settings.payment_processor.stanford) {
                    App.Data.stanfordCard = new App.Models.StanfordCard();
                }

                // listen to navigation control
                this.navigationControl();

                // run history tracking
                this.triggerInitializedEvent();
            });
//retail, weborder
            this.listenTo(App.Data.myorder, "paymentInProcess", function() {
                App.Data.mainModel.trigger('loadStarted');
            }, this);
//retail, weborder
            this.listenTo(App.Data.myorder, "paymentInProcessValid", function() {
                App.Data.mainModel.trigger('loadCompleted');
            }, this);
//retail, weborder
            this.listenTo(App.Data.myorder, "paymentFailed cancelPayment", function(message) {
                App.Data.mainModel.trigger('loadCompleted');
                message && App.Data.errors.alert(message); // user notification
            }, this);

            var checkout = App.Data.myorder.checkout;
                checkout.trigger("change:dining_option", checkout, checkout.get("dining_option"));

            App.Routers.RevelOrderingRouter.prototype.initialize.apply(this, arguments);
        },
        /**
         * Navigate on #confirm when payment is completed.
         */
        onPayHandler: function(capturePhase) {
            this.navigate('confirm',  {
                trigger: true,
                replace: capturePhase
            });
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
                mainView = App.Views.GeneratorView.create('Main', data, data.mod === 'Main'),
                container = Backbone.$('body > div.main-container');

            this.mainView && this.mainView.removeFromDOMTree() || container.empty();
            container.append(mainView.el);
            this.mainView = mainView;
        },
        navigationControl: function() {
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
                if(stanfordCard && stanfordCard.get('needToAskStudentStatus')) {
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

            // onRedemptionApplied event occurs when 'Apply Reward' btn is clicked
            this.listenTo(App.Data.myorder.rewardsCard, 'onRedemptionApplied', function() {
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.get_cart_totals().always(function() {
                    App.Data.mainModel.unset('popup');
                    App.Data.mainModel.trigger('loadCompleted');
                });
            });

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
                    App.Data.mainModel.set('popup', {
                        modelName: 'Rewards',
                        mod: 'Info',
                        model: rewardsCard,
                        className: 'rewards-info',
                        collection: App.Data.myorder,
                        points: rewardsCard.get('points'),
                        visits: rewardsCard.get('visits'),
                        purchases: rewardsCard.get('purchases')
                    });
                }

                App.Data.mainModel.trigger('loadCompleted');
            });

            // onApplyRewardsCard event occurs when Rewards Card's 'Apply' button is clicked on #checkout page
            this.listenTo(App.Data.myorder.rewardsCard, 'onApplyRewardsCard', function() {
                App.Data.mainModel.set('popup', {
                    modelName: 'Rewards',
                    mod: 'Card',
                    model: App.Data.myorder.rewardsCard,
                    className: 'rewards-info'
                });
            });

            // onGetRewards event occurs when Rewards Card's 'Submit' button is clicked on 'Rewards Card Info' popup
            this.listenTo(App.Data.myorder.rewardsCard, 'onGetRewards', function() {
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.rewardsCard.getRewards();
            });
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
            this.getEstablishmentsCallback = function() {
                if (/^(index.*)?$/i.test(Backbone.history.fragment)) App.Data.mainModel.set('needShowStoreChoice', true);
            };
            App.Routers.RevelOrderingRouter.prototype.getEstablishments.apply(this, arguments);
        },
        /**
        * Remove HTML and CSS of current establishment in case if establishment ID will change.
        */
        removeHTMLandCSS: function() {
            App.Routers.RevelOrderingRouter.prototype.removeHTMLandCSS.apply(this, arguments);
            this.bodyElement.children('.main-container').remove();
        },
        index: function() {
            this.prepare('index', function() {
                var dfd = $.Deferred(),
                    self = this;

                App.Views.TotalView.TotalMainView.prototype.integrity_test();

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
                        DINING_OPTION_NAME: _loc.DINING_OPTION_NAME,
                        timetable: App.Data.timetables,
                        customer: App.Data.customer,
                        acceptTips: settings.accept_tips_online,
                        noteAllow:  settings.order_notes_allow,
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
                    errMsg: settings.get('maintenanceMessage')
                });
            }
            this.change_page();
            App.Routers.RevelOrderingRouter.prototype.maintenance.apply(this, arguments);
        }
    });

    return new main_router(function() {
        defaultRouterData();
        App.Routers.Router = Router;
    });
});

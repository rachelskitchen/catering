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

    var headerModes = {},
        footerModes = {};

    headerModes.Main = {mod: 'Main', className: 'main'};
    headerModes.OneButton = {mod: 'OneButton', className: 'one_button'};
    headerModes.Products = headerModes.OneButton;
    headerModes.Dir = headerModes.OneButton;
    headerModes.Modifiers = {mod: 'Modifiers', className: 'two_button'};
    headerModes.Myorder = {mod: 'TwoButton', className: 'two_button myorder'};
    headerModes.Checkout = headerModes.OneButton;
    headerModes.Card = headerModes.Main;
    headerModes.GiftCard = headerModes.Main;
    headerModes.Confirm = headerModes.OneButton;
    headerModes.Done = headerModes.Main;
    headerModes.Location = {mod: 'Location', className: 'two_button location'};
    headerModes.BackToMenu = {mod: 'OneButton', className: 'one_button back_to_menu'};
    headerModes.Map = headerModes.OneButton;
    headerModes.About = {mod: 'TwoButton', className: 'two_button'};
    headerModes.Gallery = headerModes.Map;
    headerModes.Maintenance = {mod: 'Maintenance', className: 'maintenance'};

    footerModes.Main = {mod: 'Main'};
    footerModes.Products = footerModes.Main;
    footerModes.Modifiers = footerModes.Main;
    footerModes.Myorder = footerModes.Main;
    footerModes.Checkout = {mod: 'Checkout'};
    footerModes.Card = {mod: 'Card'};
    footerModes.GiftCard = {mod: 'GiftCard'};
    footerModes.Confirm = {mod: 'Confirm'};
    footerModes.Done = {mod: 'Done'};
    footerModes.Location = footerModes.Main;
    footerModes.Map = footerModes.Main;
    footerModes.About = footerModes.Main;
    footerModes.Gallery = footerModes.Main;
    footerModes.Maintenance = {mod: 'Maintenance'};
    footerModes.MaintenanceDirectory = {mod: 'MaintenanceDirectory'};

    App.Routers.Router = App.Routers.MainRouter.extend({
        routes: {
            "": "index",
            "index": "index",
            "products/:id_category": "products",
            "modifiers/:id_category/:id_product": "modifiers_add",
            "modifiers_edit/:index": "modifiers_edit",
            "myorder": "myorder",
            "checkout" : "checkout",
            "card" : "card",
            "giftcard" : "gift_card",
            "confirm": "confirm",
            "done": "done",
            "location": "location",
            "map": "map",
            "about": "about",
            "gallery": "gallery",
            "maintenance": "maintenance",
            "pay": "pay",
            "*other": "index"
        },
        hashForGoogleMaps: ['location', 'map', 'checkout'],//for #index we start preload api after main screen reached
        initialize: function() {
            App.Data.get_parameters = parse_get_params(); // get GET-parameters from address line
            clearQueryString();
            var self = this;

            // check if we here from paypal payment page
            if (App.Data.get_parameters.pay) {
                window.location.hash = "#pay";
            }

            // load main, header, footer necessary files
            this.prepare('main', function() {
                App.Views.Generator.enableCache = true;
                // set header, footer, main models
                App.Data.header = new App.Models.HeaderModel();
                App.Data.footer = new App.Models.FooterModel({
                    myorder: this.navigate.bind(this, 'myorder', true),
                    location: this.navigate.bind(this, 'location', true),
                    about: this.navigate.bind(this, 'about', true)
                });
                App.Data.mainModel = new App.Models.MainModel();
                new App.Views.MainView({
                    model: App.Data.mainModel,
                    el: 'body'
                });

                // emit 'initialized' event
                this.trigger('initialized');
                this.initialized = true;
            });

            var checkout = App.Data.myorder.checkout;
                checkout.trigger("change:dining_option", checkout, checkout.get("dining_option"));

            this.listenTo(App.Data.myorder, 'paymentResponse', function() {
                App.Data.settings.usaepayBack = true;
                clearQueryString(true);
                App.Data.get_parameters = parse_get_params();
                return this.navigate("done", true);
            }, this);

            App.Routers.MainRouter.prototype.initialize.apply(this, arguments);
        },
        navigateDirectory: function() {
            if(App.Data.dirMode)
                return window.location.href = getData('directoryReferrer').referrer;
        },
        index: function() {
            var self = this;
            this.prepare('index', function() {
                // load content block for categories
                if (!App.Data.categories) {
                    App.Data.categories = new App.Collections.Categories();
                    App.Data.categories.loadData = App.Data.categories.get_categories();
                    App.Data.categories.loadData.then(function() {
                        App.Data.categories.trigger("load_complete");
                        self.change_page();
                    });
                }

                var header = {page_title: 'Menu'};
                if(App.Data.dirMode)
                    header = Backbone.$.extend(header, {
                        back_title: 'Directory',
                        back: this.navigateDirectory.bind(this)
                    });

                App.Data.header.set(header);

                App.Data.mainModel.set({
                    header: !App.Data.dirMode ? headerModes.Main : headerModes.Dir,
                    footer: footerModes.Main,
                    content: [
                        {
                            modelName: 'StoreInfo',
                            mod: 'Main'
                        },
                        {
                            modelName: 'Categories',
                            collection: App.Data.categories,
                            mod: 'Main'
                        }
                    ]
                });

                if(App.Data.categories.loadData.state() == 'resolved')
                    this.change_page();

                App.Data.settings.load_geoloc();
            });
        },
        products: function(id_category) {
            var self = this;

            this.prepare('products', function() {
                App.Data.header.set('page_title', '');

                // load content block for categories
                if (!App.Data.categories) {
                    App.Data.categories = new App.Collections.Categories();
                    App.Data.categories.loadData = App.Data.categories.get_categories();
                } else {
                    App.Data.categories.loadData.resolve();
                }

                $.when(App.Data.categories.loadData, App.Collections.Products.init(id_category)).then(function() {
                    App.Data.header.set({
                        page_title: App.Data.categories.get(id_category).get('name'),
                        back_title: 'Categories',
                        back: self.navigate.bind(self, 'index', true)
                    });

                    App.Data.products[id_category].trigger("load_complete");
                    self.change_page();
                });

                App.Data.mainModel.set({
                    header: headerModes.Products,
                    footer: footerModes.Products,
                    content: {
                        modelName: 'Product',
                        collection: App.Data.products[id_category],
                        mod: 'List'
                    }
                });
            });
        },
        modifiers_add: function(id_category, id_product) {
            this.prepare('modifiers', function() {
                var self = this,
                    order = new App.Models.Myorder(),
                    dfdOrder = order.add_empty(id_product * 1, id_category * 1);

                dfdOrder.then(function() {
                    order = order.clone();

                    App.Data.header.set({
                        page_title: 'Modifiers',
                        back_title: 'Cancel',
                        forward_title: 'Add Item',
                        back: self.navigate.bind(self, 'products/' + id_category, true),
                        forward: function() {
                            var check = order.check_order();

                            if (check.status === 'OK') {
                                order.get_product().check_gift(function() {
                                    App.Data.myorder.add(order);
                                    App.Data.router.navigate("index", true);
                                }, function(errorMsg) {
                                    App.Data.errors.alert(errorMsg);
                                });
                            } else {
                                App.Data.errors.alert(check.errorMsg);
                            }
                        },
                        order: order
                    });

                    App.Data.mainModel.set({
                        header: headerModes.Modifiers,
                        footer: footerModes.Modifiers,
                        content: {
                            modelName: 'MyOrder',
                            model: order,
                            mod: 'Matrix'
                        }
                    });

                    self.change_page();
                });
            });
        },
        modifiers_edit: function(index) {
            index = parseInt(index);
            this.prepare('modifiers', function() {
                var self = this,
                    _order = App.Data.myorder.at(index),
                    order;

                if(!_order)
                    return this.navigate('myorder', true);

                order = _order.clone();

                App.Data.header.set({
                    page_title: 'Modifiers',
                    back_title: 'Cancel',
                    forward_title: 'Update',
                    back: this.navigate.bind(this, 'myorder', true),
                    forward: function() {
                        var check = order.check_order();

                        if (check.status === 'OK') {
                            order.get_product().check_gift(function() {
                                App.Data.myorder.remove(_order);
                                App.Data.myorder.add(order, {at: index});
                                App.Data.router.navigate("index", true);
                            }, function(errorMsg) {
                                App.Data.errors.alert(errorMsg);
                            });
                        } else {
                            App.Data.errors.alert(check.errorMsg);
                        }
                    }
                });

                App.Data.mainModel.set({
                    header: headerModes.Modifiers,
                    footer: footerModes.Modifiers,
                    content: {
                        modelName: 'MyOrder',
                        model: order,
                        mod: 'Matrix'
                    }
                });

                this.change_page();
            });
        },
        myorder: function() {
            this.prepare('myorder', function() {
                App.Data.header.set({
                    page_title: 'Order Cart',
                    back_title: 'Menu',
                    forward_title: 'Check Out',
                    back: this.navigate.bind(this, 'index', true),
                    forward: this.navigate.bind(this, 'checkout', true)
                });

                var isNote = App.Data.settings.get('settings_system').order_notes_allow;

                App.Data.mainModel.set({
                    header: headerModes.Myorder,
                    footer: footerModes.Myorder,
                    content: [
                        {
                            modelName: 'MyOrder',
                            collection: App.Data.myorder,
                            mod: 'List',
                            className: 'myorderList' + (isNote ? ' isNote' : '')
                        },
                        {
                            modelName: 'Total',
                            model: App.Data.myorder.total,
                            mod: 'Main',
                            className: 'myorderSubtotal' + (isNote ? ' isNote' : ''),
                            collection: App.Data.myorder
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
            this.prepare('checkout', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                if(!App.Data.giftcard)
                    App.Data.giftcard = new App.Models.GiftCard;

                if(!App.Data.customer) {
                    App.Data.customer =  new App.Models.Customer();
                    App.Data.customer.loadAddresses();
                }

                App.Data.header.set({
                    page_title: 'Check Out',
                    back_title: 'Order Cart',
                    back: this.navigate.bind(this, 'myorder', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Checkout,
                    footer: footerModes.Checkout,
                    content: [
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            collection: App.Data.myorder,
                            mod: 'OrderType',
                            DINING_OPTION_NAME: DINING_OPTION_NAME,
                            className: 'checkout'
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            customer: App.Data.customer,
                            mod: 'Main',
                            className: 'checkout'
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            timetable: App.Data.timetables,
                            mod: 'Pickup',
                            className: 'checkout'
                        }
                    ],
                    no_perfect_scroll: true
                });

                this.change_page();
            });    
        },
        card: function() {
            this.prepare('card', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.header.set({
                    page_title: 'Card Information'
                });

                App.Data.mainModel.set({
                    header: headerModes.Card,
                    footer: footerModes.Card,
                    content: {
                        modelName: 'Card',
                        model: App.Data.card,
                        mod: 'Main'
                    }
                });

                this.change_page();
            });
        },
        gift_card: function() {
            this.prepare('giftcard', function() {
                if(!App.Data.giftcard)
                    App.Data.giftcard = new App.Models.GiftCard;

                App.Data.header.set({
                    page_title: 'Gift Card Information'
                });

                App.Data.mainModel.set({
                    header: headerModes.GiftCard,
                    footer: footerModes.GiftCard,
                    content: {
                        modelName: 'GiftCard',
                        model: App.Data.giftcard,
                        mod: 'Main'
                    }
                });

                this.change_page();
            });
        },
        confirm: function() {
            var load = $.Deferred();
            if (App.Data.myorder.length === 0) {
                load = this.loadData();
            } else {
                load.resolve();
            }

            this.prepare('confirm', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.header.set({
                    page_title: 'Confirm Order',
                    back_title: 'Check Out',
                    back: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Confirm,
                    footer: footerModes.Confirm,
                    content: [
                        {
                            modelName: 'Total',
                            model: App.Data.myorder.total,
                            mod: 'Checkout',
                            collection: App.Data.myorder
                        },
                        {
                            modelName: 'Tips',
                            model: App.Data.myorder.total.get('tip'),
                            mod: 'Line',
                            total: App.Data.myorder.total,
                            cacheIt: true
                        }
                    ]
                });
               
                this.change_page();
            }, [load]);
        },
        done: function() {
            if(!App.Data.settings.usaepayBack)
                return this.navigate('index', true);

            this.prepare('done', function() {
                var params = App.Data.myorder.paymentResponse;
                var isSuccess = params.status === 'OK';

                App.Data.header.set('page_title', isSuccess ? 'Order has been Submitted.' : 'Order has not been Submitted.');
                App.Data.footer.set({success_payment: isSuccess});

                App.Data.mainModel.set({
                    header: headerModes.Done,
                    footer: footerModes.Done,
                    content: {
                        modelName: 'Main',
                        model: App.Data.mainModel,
                        mod: "Done",
                        className: 'done'
                    }
                });

                this.change_page();
            });
        },
        location: function() {
            var settings = App.Data.settings.get('settings_system');

            this.prepare('store_info', function() {
                App.Data.header.set({
                    page_title: settings instanceof Object ? settings.business_name : 'Location',
                    back_title: 'Menu',
                    forward_title: 'Map',
                    back: this.navigate.bind(this, 'index', true),
                    forward: this.navigate.bind(this, 'map', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Location,
                    footer: footerModes.Location,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.timetables,
                        mod: 'InDetails'
                    }
                });

                this.change_page();
            });
        },
        map: function() {
            this.prepare('store_info', function() {
                App.Data.header.set({
                    page_title: 'Map',
                    back_title: 'Location',
                    back: this.navigate.bind(this, 'location', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Map,
                    footer: footerModes.Map,
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
            var settings = App.Data.settings,
                settings_system = settings.get('settings_system'),
                model = new Backbone.Model({
                    logo: settings_system.logo ? settings.get('host') + settings_system.logo : null,
                    text: settings_system.about_description || 'No information',
                    title: settings_system.about_title || '',
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\.?/)[1]
                });

            this.prepare('store_info', function() {
                var images = App.Data.settings.get('settings_system').about_images,
                    header = headerModes.About;

                App.Data.header.set({
                    page_title: 'About ' + App.Data.settings.get('settings_system').business_name,
                    back_title: 'Menu',
                    back: this.navigate.bind(this, 'index', true),
                    forward_title: 'Gallery',
                    forward: this.navigate.bind(this, 'gallery', true)
                });

                if(!Array.isArray(images) || !images.length)
                    header = headerModes.BackToMenu;

                App.Data.mainModel.set({
                    header: header,
                    footer: footerModes.About,
                    content: {
                        modelName: 'StoreInfo',
                        model: model,
                        mod: 'About',
                        className: 'about'
                    }
                });

                this.change_page();
            });
        },
        gallery: function() {

            this.prepare('store_info', function() {
                if (!App.Data.AboutModel) {
                    App.Data.AboutModel = new App.Models.AboutModel();
                }

                App.Data.header.set({
                    page_title: App.Data.settings.get('settings_system').business_name + ' Gallery',
                    back_title: 'About',
                    back: this.navigate.bind(this, 'about', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Gallery,
                    footer: footerModes.Gallery,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.AboutModel,
                        mod: 'Gallery',
                        className: 'gallery'
                    }
                });

                this.change_page();
            });
        },
        maintenance : function() {
            App.Routers.MainRouter.prototype.maintenance.apply(this, arguments);

            this.prepare('maintenance', function() {
                var header = {page_title: ''};
                if(App.Data.dirMode)
                    header = Backbone.$.extend(header, {
                        back_title: 'Directory',
                        back: this.navigateDirectory.bind(this)
                    });

                App.Data.header.set(header);

                App.Data.mainModel.set({
                    header: !App.Data.dirMode ? headerModes.Maintenance : headerModes.Products,
                    footer: App.Data.dirMode ? footerModes.MaintenanceDirectory : footerModes.Maintenance,
                    content: {
                        modelName: 'Maintenance',
                        mod: 'Main'
                    }
                });

                this.change_page();
            });
        }
    });
});
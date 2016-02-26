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

define(["factory"], function() {
    'use strict';

    function setCallback(prop) {
        return function() {
            var cb = this.model.get(prop);
            typeof cb == 'function' && cb();
        };
    }

    var HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        bindings: {
           '.title': 'text:page_title',
           '.btn-back': 'toggle: all(back, not(strictEqual(tab, 0)))',
           '.btn-profile': 'toggle: strictEqual(tab, 0)',
           '.btn-back-title': 'text: back_title',
           '.btn-cart': 'toggle: cartItemsQuantity, classes: {"qty-visible": cartItemsQuantity}, attr: {"data-count": cartItemsQuantity}',
           '.btn-search': 'classes: {active: showSearch}',
           '.search': 'outsideTouch: showSearch, events:["onOutsideTouch"], classes: {invisible: not(showSearch)}, attr: {contenteditable: false}',
           '.input-search': 'value: search, events: ["input"]',
           '.ctrl': 'reset: search, events: ["click"]'
        },
        events: {
            'click .btn-back': setCallback('back'),
            'click .btn-cart:not([data-count="0"])': setCallback('cart'),
            'click .btn-search': 'search',
            'mousedown .btn-search': 'stopPropagation',
            'touchstart .btn-search': 'stopPropagation',
            'click .ctrl': 'search2',
            'submit .form-search': 'performSearch',
            'onOutsideTouch .search': 'onOutsideTouch', // to hide keyboard and caret
            'click .btn-profile': 'profile'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var tabs = App.Views.GeneratorView.create('Header', {
                model: this.model,
                mod: 'Tabs',
                className: 'tabs tab-text'
            }, 'header_tabs');

            this.subViews.push(tabs);
            this.$el.append(tabs.el);

            var mobile = function() {
                if (cssua.ua.ios) {
                    return 'ios';
                } else if (cssua.ua.android) {
                    return 'android';
                }
            }();

            var set_dir = App.SettingsDirectory;
            var store_app_id = (mobile == 'ios' && set_dir ? set_dir.apple_app_id : set_dir.google_app_id);
            if (set_dir.smart_banner && store_app_id) {
                var meta = document.createElement('meta');
                meta.name = APP_STORE_NAME[mobile];
                meta.content = 'app-id=' + store_app_id;
                document.querySelector('head').appendChild(meta);

                $.smartbanner({
                    daysHidden : 0,
                    daysReminder : 0,
                    title : 'Stanford R&DE FOOD ToGo',
                    author : 'Revel Systems',
                    icon : 'https://lh3.googleusercontent.com/kj4yHHb6ct6xWUsUPHE38Efh38_1MpIrF3IejoZiI9yLtB4VtrLJ3timHm6EWnfbJSih=w300',
                    force: mobile,
                    appendToSelector: '#header',
                    scale: '1',
                    onInstall: bannerHideHandler,
                    onClose: bannerHideHandler
                })
            }

            function bannerHideHandler() {
                $('#section').css('top', $('#section').offset().top - $('#smartbanner').height());
            }

            /**
             * Promotions
             */
            this.model.set('showPromotionsLine', true); // DEBUG
            set_dir.promotionsAvailable = true; // DEBUG
            if (this.model.get('showPromotionsLine') && set_dir.promotionsAvailable) {
                var promotions = App.Views.GeneratorView.create('Header', {
                    model: this.model,
                    mod: 'Promotions',
                    className: 'all-promotions'
                }, 'header_tabs'),
                    animationTime = 200;

                this.subViews.push(promotions);
                this.$el.append(promotions.el);
                var promotionsHeight = 0;
                setTimeout(function() {
                    promotionsHeight = Backbone.$('.all-promotions').height();
                }, 0);

                var promotionsVisible = true,
                    lastScrollTop = 0,
                    animationInProgress = false;

                Backbone.$('#section').on('scroll', function() {
                    if (animationInProgress) {
                        return;
                    }
                    animationInProgress = true;
                    var st = Backbone.$(this).scrollTop();
                    if (!promotionsVisible && st == 0) {
                        showPromotionsLine();
                    }
                    else if (promotionsVisible && st > lastScrollTop){
                        hidePromotions();
                    }
                    else {
                        animationInProgress = false;
                    }
                    lastScrollTop = st;
                });

                function showPromotionsLine() {
                    Backbone.$('.all-promotions').fadeIn(animationTime);
                    Backbone.$('#section').animate({
                        'top': Backbone.$('#section').offset().top + promotionsHeight
                    }, animationTime, function() {
                        animationInProgress = false;
                        promotionsVisible = true;
                    });
                }

                function hidePromotions() {
                    Backbone.$('.all-promotions').fadeOut(animationTime);
                    Backbone.$('#section').animate({
                        'top': Backbone.$('#section').offset().top - promotionsHeight
                    }, animationTime, function() {
                        animationInProgress = false;
                        promotionsVisible = false;
                    });
                }
            }

            return this;
        },
        search: function(e) {
            e && e.stopPropagation();
            this.model.set('showSearch', !this.model.get('showSearch'));
        },
        search2: function(e) {
            e && e.stopPropagation();
            !this.model.previous('search') && this.search();
        },
        performSearch: function(e) {
            e.preventDefault();
            this.model.performSearch();
        },
        stopPropagation: function(e) {
            e.stopPropagation();
        },
        onOutsideTouch: function() {
            this.$('.input-search').blur();
        },
        profile: function() {
            this.model.set('showProfileMenu', true);
        }
    });

    var HeaderTabsView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'tabs',
        tagName: 'ul',
        bindings: {
            ':el': "attr: {'data-active-tab': tab}",
            '[data-tab="0"]': "classes: {active: equal(0, tab)}",
            '[data-tab="1"]': "classes: {active: equal(1, tab)}",
            '[data-tab="2"]': "classes: {active: equal(2, tab)}"
        },
        events: {
            'click li': 'onTab'
        },
        onTab: function(e) {
            var tab = Backbone.$(e.target).data('tab');
            this.model.set('tab', tab);
        }
    });

    var HeaderPromotionsView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'promotions',
        tagName: 'div',
        bindings: {
            //':el': 'toggle: _settings_directory_promotionsAvailable'
        },
        events: {
            'click': 'goToPromotionsList'
        },
        goToPromotionsList: function() {
            App.Data.router.navigate('promotions', true);
        }
    });

    var HeaderModifiersView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'modifiers',
        tagName: 'ul',
        bindings: {
            '.title': 'text:page_title, classes: {"icon-check": not(link)}',
            '.btn-link-title': 'text:link_title',
            '.btn-link': 'toggle: link, classes: {disabled: not(enableLink)}',
            '.btn-back-title': 'text: back_title',
            '.btn-cart': 'toggle: all(not(link), select(hideCart, false, true)), attr: {"data-count": cartItemsQuantity}, classes: {"qty-visible": cartItemsQuantity}'
        },
        events: {
            'click .btn-link': setCallback('link'),
            'click .btn-back': setCallback('back'),
            'click .btn-cart': setCallback('cart')
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        }
    });

    var HeaderComboProductView = HeaderModifiersView.extend({
        events: {
            'click .btn-link': 'link',
            'click .btn-cart': 'cart',
            'click .btn-back': 'back'
        },
        link: function() {
            this.model.get('link').apply(this, arguments);
        },
        initialize: function() {
            this.setHeaders();
            HeaderModifiersView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'reinit', this.reinit, this);
            this.listenTo(App.Data.myorder, 'add remove change', function() {
                this.model.set('cartItemsQuantity', App.Data.myorder.get_only_product_quantity());
            });
        },
        reinit: function() {
            this.setHeaders();
        },
        setHeaders: function() {
            if (this.options.mode == "add")
                this.setHeaderToAdd();
            else
                this.setHeaderToUpdate();
        },
        back: function() {
            var order = this.options.order,
                originOrder = this.options.originOrder;
            this.model.get('back')();
        },
        cart: function() {
            App.Data.router.navigate('cart', true);
        },
        setHeaderToUpdate: function() {
            this.model.set({
                page_title: _loc.CUSTOMIZE,
                link_title: _loc.UPDATE,
                link: this.link_update
            });
        },
        link_update: function () {
            if(!App.Settings.online_orders) return;

            var order = this.options.order,
                originOrder = this.options.originOrder;

            var status = this.model.updateProduct(order);
            if (status) {
                originOrder.update(order);
                this.listenTo(order, 'combo_product_change', this.setHeaderToUpdate, this);
                this.listenTo(order, 'change:quantity', this.setHeaderToUpdate, this);
            }
        },
        setHeaderToAdd: function() {
            this.model.set({
                page_title: _loc.CUSTOMIZE,
                link_title: _loc.ADD_TO_CART,
                link: this.link_add
            });
        },
        link_add: function() {
            var self = this;
            if(!App.Settings.online_orders) return;

            var order = this.options.order;

            this.model.addProduct(order).done(function () {
                //self.setHeaderToUpdate();
            });
        }
    });

    var HeaderCartView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'cart',
        bindings: {
           '.title': 'text:page_title',
           '.btn-back': 'toggle: back',
           '.btn-back-title': 'text: back_title',
           '.btn-promotions': 'toggle: showPromotionsLink'
        },
        events: {
            'click .btn-back': setCallback('back'),
            'click .btn-promotions': setCallback('promotions')
        }
    });

    var HeaderMaintenanceView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'maintenance'
    });

    var HeaderEmptyView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'empty',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
        }
    });

    return new (require('factory'))(function() {
        App.Views.HeaderView = {};
        App.Views.HeaderView.HeaderMainView = HeaderMainView;
        App.Views.HeaderView.HeaderTabsView = HeaderTabsView;
        App.Views.HeaderView.HeaderModifiersView = HeaderModifiersView;
        App.Views.HeaderView.HeaderPromotionsView = HeaderPromotionsView;
        App.Views.HeaderView.HeaderComboProductView = HeaderComboProductView;
        App.Views.HeaderView.HeaderCartView = HeaderCartView;
        App.Views.HeaderView.HeaderMaintenanceView = HeaderMaintenanceView;
        App.Views.HeaderView.HeaderEmptyView = HeaderEmptyView;
    });
});
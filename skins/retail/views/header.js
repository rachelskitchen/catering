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

define(["backbone", "factory"], function(Backbone) {
    'use strict';

    var HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:menu_index', this.menu, this);
            this.listenTo(this.options.cart, 'add remove', this.update, this);
            this.listenTo(this.options.search, 'onSearchComplete', this.searchComplete, this);
            this.listenTo(this.options.search, 'onSearchStart', this.searchStart, this);
            this.listenTo(this.collection, 'onRestoreState', this.restoreState, this);
            this.listenTo(this.model, 'change:isShowPromoMessage', this.calculatePromoMessageWidth, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            if (App.Settings.promo_message) this.calculatePromoMessageWidth(); // calculate a promo message width
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var view = new App.Views.GeneratorView.create('Categories', {
                collection: this.collection,
                mod: 'Tabs',
                el: this.$('.categories'),
                model: this.options.mainModel,
                search: this.options.search
            });
            this.subViews.push(view);
            loadSpinner(this.$('img.logo'));
            this.update();
            return this;
        },
        events: {
            'click .shop': 'onMenu',
            'click .about': 'onAbout',
            'click .locations': 'onLocations',
            'click .cart': 'onCart',
            'submit .search': 'onSearch'
        },
        menu: function(model, value) {
            var menu = this.$('.menu li'),
                tabs = this.subViews[0].$el;
            menu.removeClass('active');
            menu.eq(value).addClass('active');
            if(value === 0)
                tabs.removeClass('hidden');
            else
                tabs.addClass('hidden');
        },
        onMenu: function() {
            this.model.trigger('onShop');
        },
        onAbout: function() {
            this.model.trigger('onAbout');
        },
        onLocations: function() {
            this.model.trigger('onLocations');
        },
        onCart: function() {
            this.model.trigger('onCart');
        },
        onSearch: function(event) {
            event.preventDefault();
            var search = this.$('input[name=search]').val();
            if(search.length > 0) {
                if (App.Data.mainModel.get("mode") != "Main") {
                    this.model.trigger('onShop');
                }
                this.options.search.search(search);
            }
        },
        searchComplete: function(result) {
            this.$('.search').get(0).reset();
            var products = result.get('products');
            if(!products || products.length == 0)
                App.Data.errors.alert(MSG.PRODUCTS_EMPTY_RESULT);
        },
        searchStart: function() {
            // reset selections in App.Data.categories
            this.collection.parent_selected = 0;
            this.collection.selected = 0;
            this.$('input[name=search]').blur();
        },
        update: function() {
            var quantity = this.options.cart.get_only_product_quantity(),
                cart = this.$('.cart');
            if(quantity)
                cart.text(quantity);
            else
                cart.text('');
        },
        restoreState: function(state) {
            var pattern = state.pattern,
                input = this.$('input[name=search]');
            pattern && input.attr('disabled', 'disabled').val(pattern);
            input.removeAttr('disabled');
            this.onSearch({preventDefault: new Function});
        },
        /**
         * Calculate a promo message width.
         */
        calculatePromoMessageWidth: function() {
            if (this.model.get('isShowPromoMessage')) {
                var promo_message = Backbone.$('<div class="promo_message promo_message_internal"> <span>' + App.Settings.promo_message + '</span> </div>');
                $('body').append(promo_message);
                this.model.set('widthPromoMessage', promo_message.find('span').width());
                promo_message.remove();
                this.model.set('widthWindow', $(window).width());
                var self = this;
                var interval = window.setInterval(function() {
                    var img_logo = self.$('img.logo');
                    if (img_logo.length !== 0) {
                        self.resizeLogoPromoMessage(); // resize a logo & a promo message
                        self.addPromoMessage(); // add a promo message
                        $(window).resize(self, self.resizePromoMessage);
                        clearInterval(interval);
                    }
                }, 100);
            } else {
                this.$('.promo_message').hide();
            }
        },
        /**
         * Resize of a promo message.
         */
        resizePromoMessage: function() {
            if (arguments[0].data.model.get('widthWindow') !== $(window).width()) {
                arguments[0].data.model.set('widthWindow', $(window).width());
                arguments[0].data.resizeLogoPromoMessage(); // resize a logo & a promo message
                arguments[0].data.addPromoMessage(); // add a promo message
            }
        },
        /**
         * Resize a logo & a promo message.
         */
        resizeLogoPromoMessage: function() {
            var header_left = this.$('div.header_left')
            var logo_container = this.$('div.logo');
            var promo_container = this.$('div.promo');
            var percent_logo = logo_container.width() / header_left.width();
            if (percent_logo > 0.6) logo_container.css({'max-width': '60%'});
            var width_logo = logo_container.width();
            promo_container.css({'left': width_logo + 15 + 'px'});
        },
        /**
         * Add a promo message.
         */
        addPromoMessage: function() {
            var self = this;
            window.setTimeout(function() {
                var promo_container = self.$('.promo');
                var promo_text = self.$('.promo_text');
                var promo_marquee = self.$('.promo_marquee');
                if (self.model.get('widthPromoMessage') >= promo_container.width()) {
                    var isFirefox = /firefox/g.test(navigator.userAgent.toLowerCase());
                    if (isFirefox) {
                        // bug #15981: "First Firefox displays long promo message completely then erases it and starts scrolling"
                        $(document).ready(function() {
                            promo_text.hide();
                            promo_marquee.show();
                        });
                    } else {
                        promo_text.hide();
                        promo_marquee.show();
                    }
                } else {
                    promo_text.show();
                    promo_marquee.hide();
                }
            }, 0);
        }
    });

    var HeaderConfirmationView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'confirmation'
    });

    var HeaderCheckoutView = HeaderMainView.extend({
        name: 'header',
        mod: 'checkout',
        initialize: function() {
            this.listenTo(this.options.cart, 'add remove', this.update, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            loadSpinner(this.$('img.logo'));
            this.update();
            return this;
        },
        onCart: function() {
            return;
        },
        onSearch: function() {
            return;
        }
    });

    return new (require('factory'))(function() {
        App.Views.HeaderView = {};
        App.Views.HeaderView.HeaderMainView = HeaderMainView;
        App.Views.HeaderView.HeaderConfirmationView = HeaderConfirmationView;
        App.Views.HeaderView.HeaderCheckoutView = HeaderCheckoutView;
    });
});
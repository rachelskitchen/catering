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

    App.Views.HeaderView = {};

    App.Views.HeaderView.HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:menu_index', this.menu, this);
            this.listenTo(this.options.cart, 'add remove', this.update, this);
            this.listenTo(this.options.search, 'onSearchComplete', this.searchComplete, this);
            this.listenTo(this.options.search, 'onSearchStart', this.searchStart, this);
            this.listenTo(this.collection, 'onRestoreState', this.restoreState, this);
            this.listenTo(this.model, 'change:isShowPromoMessage', this.addPromoMessage, this);
            this.listenToOnce(App.Data.mainModel, 'loadCompleted', this.addPromoMessage, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
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
            if(search.length > 0)
                this.options.search.search(search);
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
         * Add promo message.
         */
        addPromoMessage: function() {
            var self = this;
            var promo_text = $("#promo_text");
            var promo_marquee = $("#promo_marquee");
            if (self.model.get("isShowPromoMessage")) {
                var change_container_message = function() {
                    self.$el.find(promo_text).show();
                    if (self.$el.find(promo_text).find("span").width() >= self.$el.find(promo_text).width()) {
                        self.$el.find(promo_text).hide();
                        self.$el.find(promo_marquee).show();
                    }
                    else {
                        self.$el.find(promo_text).show();
                        self.$el.find(promo_marquee).hide();
                    }
                    var interval = window.setInterval(function() {
                        var img_logo = $("img.logo");
                        var div_logo = $("div.logo");
                        var promo_message = $(".promo_message");
                        if (self.$el.find(img_logo).length !== 0) {
                            var percent_img = self.$el.find(img_logo).width()/self.$el.find(div_logo).width();
                            var percent_promo = 100-(percent_img*100)-1.5;
                            if (percent_promo <= 0) {
                                self.$el.find(promo_message).hide();
                            }
                            else {
                                self.$el.find(promo_message).css({"width": percent_promo+"%"});
                            }
                            clearInterval(interval);
                        }
                    });
                };
                change_container_message();
                $(window).resize(change_container_message);
            }
            else {
                self.$el.find(promo_text).hide();
                self.$el.find(promo_marquee).hide();
            }
        }
    });

    App.Views.HeaderView.HeaderConfirmationView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'confirmation'
    });

    App.Views.HeaderView.HeaderCheckoutView = App.Views.HeaderView.HeaderMainView.extend({
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
});
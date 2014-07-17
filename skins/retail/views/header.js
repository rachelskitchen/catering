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
            this.$('input[name=search]').blur();
        },
        update: function() {
            var quantity = this.options.cart.get_only_product_quantity(),
                cart = this.$('.cart');
            if(quantity)
                cart.text(quantity);
            else
                cart.text('');
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
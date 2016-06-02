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
        bindings: {
            '.search-box': 'classes: {active: ui_showSearchInput, link: not(ui_showSearchInput)}',
            'input[name=search]': 'value: ui_searchInput, events: ["input"], attr: {disabled: select(ui_isSearching, "disabled", false)}',
            '.shop': 'classes: {active: equal(menu_index, 0)}',
            '.about': 'classes: {active: equal(menu_index, 1)}',
            '.map': 'classes: {active: equal(menu_index, 2)}'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({
                    showSearchInput: false,
                    searchInput: '',
                    isSearching: false,
                    quantity: 0
                });
            }
        },
        initialize: function() {
            this.listenTo(this.model, 'change:menu_index', this.menu, this);
            this.listenTo(this.options.cart, 'add remove', this.update, this);
            this.listenTo(this.options.search, 'onSearchComplete', this.searchComplete, this);
            this.listenTo(this.options.search, 'onSearchStart', this.searchStart, this);
            this.listenTo(this.options.search, 'onRestore', this.restoreState, this);
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
            'click .search-label': 'showSearchInput',
            'click .cancel-search': 'cancelSearch'
        },
        onEnterListeners: {
            '.shop': 'onMenu',
            '.about': 'onAbout',
            '.locations': 'onLocations',
            '.cart': 'onCart',
            '.search-label': 'showSearchInput',
            '.cancel-search': 'cancelSearch'
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
        onSearch: function() {
            var search = this.getBinding('ui_searchInput');
            if (search.length > 0) {
                this.searchStart();
                this.model.trigger('onShop');
                this.options.search.search(search);
            }
        },
        searchComplete: function() {
            this.setBinding('ui_searchInput', '');
            this.setBinding('ui_isSearching', false);
        },
        searchStart: function() {
            this.setBinding('ui_isSearching', true);
        },
        update: function() {
            this.setBinding('ui_quantity', this.options.cart.get_only_product_quantity());
        },
        restoreState: function() {
            this.setBinding('ui_searchInput', this.options.search.lastPattern || '');
            this.onSearch();
        },
        showSearchInput: function() {
            this.setBinding('ui_showSearchInput', true);
        },
        cancelSearch: function() {
            this.setBinding('ui_showSearchInput', false);
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
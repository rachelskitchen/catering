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

define(["done_view", "generator"], function(done_view) {
    'use strict';

    var SpinnerView = App.Views.FactoryView.extend({
        createSpinner: function() {
            this.listenTo(this.model, 'loadStarted', this.showSpinner.bind(this, EVENT.NAVIGATE), this);
            this.listenTo(this.model, 'loadCompleted', this.hideSpinner.bind(this, EVENT.NAVIGATE), this);

            var spinner = this.$('#main-spinner');
            spinner.spinner();
            spinner.css('position', 'fixed');
        },
        showSpinner: function(event) {
            $(window).trigger('showSpinner', {startEvent: event});
        },
        hideSpinner: function(event, isLast) {
            $(window).trigger('hideSpinner', {startEvent: event, isLastEvent: isLast});
        }
    });

    var MainMainView = SpinnerView.extend({
        name: 'main',
        mod: 'main',
        bindings: {
            '.store_choice': 'toggle: needShowStoreChoice'
        },
        initialize: function() {
            this.listenTo(this.model, 'change:content', this.content_change, this);
            this.listenTo(this.model, 'change:header', this.header_change, this);
            this.listenTo(this.model, 'change:cart', this.cart_change, this);
            this.listenTo(this.model, 'change:popup', this.popup_change, this);
            this.listenTo(App.Data.search, 'onSearchStart', this.showSpinner.bind(this, EVENT.SEARCH), this);
            this.listenTo(App.Data.search, 'onSearchComplete', this.hideSpinner.bind(this, EVENT.SEARCH, true), this);
            this.listenTo(this.model, 'onRoute', this.hide_popup, this);

            this.iOSFeatures();

            this.subViews.length = 3;

            SpinnerView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            SpinnerView.prototype.render.apply(this, arguments);
            this.iPad7Feature();
            this.createSpinner();

            return this;
        },
        events: {
            'click #popup .cancel': 'hide_popup',
            'click .change_establishment': 'change_establishment'
        },
        content_change: function() {
            var content = this.$('#content'),
                data = this.model.get('content'),
                content_defaults = this.content_defaults();

            while (this.subViews.length > 3)
                this.subViews.pop().removeFromDOMTree();

            if (Array.isArray(data))
                data.forEach(function(data) {
                    content.append(this.addContent(data));
                }, this);
            else
                content.append(this.addContent(data));
        },
        header_change: function() {
            var data = _.defaults(this.model.get('header'), this.header_defaults()),
                id = 'header_' + data.modelName + '_' + data.mod;

            this.subViews[0] && this.subViews[0].removeFromDOMTree();
            this.subViews[0] = App.Views.GeneratorView.create(data.modelName, data, id);

             if ( this.model.get("content").isCartLeftPanel ) {
                this.$("section").addClass("cart_left_panel");
                this.$("#cart").addClass("cart_left_panel");
            } else {
                this.$("section").removeClass("cart_left_panel");
                this.$("#cart").removeClass("cart_left_panel");
            }

            this.$('#header').append(this.subViews[0].el);
        },
        cart_change: function() {
            var data = _.defaults(this.model.get('cart'), this.cart_defaults()),
                id = 'cart_' + data.modelName + '_' + data.mod;

            this.subViews[1] && this.subViews[1].removeFromDOMTree();
            this.subViews[1] = App.Views.GeneratorView.create(data.modelName, data, id);
            this.$('#cart').append(this.subViews[1].el);
        },
        popup_change: function(model, value) {
            var popup = this.$('.popup'),
                data, id;

            this.subViews[2] && this.subViews[2].remove();//this.subViews[2].removeFromDOMTree();

            if (typeof value == 'undefined')
                return popup.removeClass('ui-visible');

            data = _.defaults(this.model.get('popup'), this.popup_defaults());

            $('#popup').addClass("popup-background");

            id = 'popup_' + data.modelName + '_' + data.mod;
            this.subViews[2] = App.Views.GeneratorView.create(data.modelName, data);
            this.$('#popup').append(this.subViews[2].el);

            value ? popup.addClass('ui-visible') : popup.removeClass('ui-visible');
        },
        hide_popup: function() {
            this.model.unset('popup');
        },
        header_defaults: function() {
            return {
                model: this.options.headerModel,
                className: 'header',
                modelName: 'Header',
                mainModel: this.model,
                cart: this.options.cartCollection,
                search: this.options.search
            };
        },
        cart_defaults: function() {
            return {
                collection: this.options.cartCollection,
                className: 'cart',
                modelName: 'Cart'
            };
        },
        content_defaults: function() {
            return {
                className: 'content'
            };
        },
        addContent: function(data, removeClass) {
            var id = 'content_' + data.modelName + '_' + data.mod + (data.uniqId || '');
            data = _.defaults(data, this.content_defaults());

            if (removeClass)
                delete data.className;

            var subView = App.Views.GeneratorView.create(data.modelName, data, id);
            this.subViews.push(subView); // subViews length always > 3

            return subView.el;
        },
        iOSFeatures: function() {
            if (/iPad|iPod|iPhone/.test(window.navigator.userAgent))
                document.addEventListener('touchstart', new Function, false); // enable css :active pseudo-class for all elements
        },
        /**
         * Show the "Change Establishment" modal window.
         */
        change_establishment: function() {
            var ests = App.Data.establishments;
            ests.getModelForView().set({
                storeDefined: true
            }); // get a model for the stores list view
            ests.trigger('loadStoresList');
        }
    });

    var MainMaintenanceView = App.Views.FactoryView.extend({
        name: 'main',
        mod: 'maintenance',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.$('.store_choice').css({display: 'inline-block'});
            this.listenToOnce(App.Data.mainModel, 'loadCompleted', App.Data.myorder.check_maintenance);
            if (!App.Data.router.isNotFirstLaunch) this.$('.back').hide();
        },
        events: {
            'click .reload': 'reload',
            'keydown .reload': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.reload();
                }
            },
            'click .go-to-directory': 'goToDirectory',
            'click .back': 'back',
            'click .change_establishment': 'change_establishment'
        },
        /**
         * Go to the previous establishment.
         */
        back: function() {
            window.history.back();
        },
        reload: function() {
            window.location.replace(window.location.href.replace(/#.*$/, ''));
        },
        /**
         * Show the "Change Establishment" modal window.
         */
        change_establishment: function() {
            var ests = App.Data.establishments;
            ests.getModelForView().set({
                storeDefined: true
            }); // get a model for the stores list view
            ests.trigger('loadStoresList');
        }
    });

    var MainDoneView = App.Views.CoreMainView.CoreMainDoneView.extend({
        getPickupTime: function() {
            return {};
        }
    });

    var MainProfileView = App.Views.CoreMainView.CoreMainProfileView.extend({
        bindings: {
            '#header .title': 'text: profile_title'
        },
        render: function() {
            App.Views.CoreMainView.CoreMainProfileView.prototype.render.apply(this, arguments);
            SpinnerView.prototype.createSpinner.call(this);
            return this;
        }
    });

    _.defaults(MainProfileView.prototype, SpinnerView.prototype);

    return new (require('factory'))(done_view.initViews.bind(done_view), function() {
        App.Views.MainView.MainMainView = MainMainView;
        App.Views.MainView.MainMaintenanceView = MainMaintenanceView;
        App.Views.MainView.MainDoneView = MainDoneView;
        App.Views.MainView.MainProfileView = MainProfileView;
    });
});
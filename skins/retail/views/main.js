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

    var MainMainView = App.Views.FactoryView.extend({
        name: 'main',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:content', this.content_change, this);
            this.listenTo(this.model, 'change:header', this.header_change, this);
            this.listenTo(this.model, 'change:cart', this.cart_change, this);
            this.listenTo(this.model, 'change:popup', this.popup_change, this);
            this.listenTo(this.model, 'loadStarted', this.showSpinner.bind(this, EVENT.NAVIGATE), this);
            this.listenTo(this.model, 'loadCompleted', this.hideSpinner.bind(this, EVENT.NAVIGATE), this);
            this.listenTo(App.Data.search, 'onSearchStart', this.showSpinner.bind(this, EVENT.SEARCH), this);
            this.listenTo(App.Data.search, 'onSearchComplete', this.hideSpinner.bind(this, EVENT.SEARCH, true), this);
            this.listenTo(this.model, 'onRoute', this.hide_popup, this);
            this.listenTo(this.model, 'change:needShowStoreChoice', this.checkBlockStoreChoice, this); // show the "Store Choice" block if a brand have several stores
            this.listenTo(this.model, 'change:isBlurContent', this.blurEffect, this); // a blur effect of content

            this.iOSFeatures();

            this.subViews.length = 3;

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.iPad7Feature();

            var spinner = this.$('#main-spinner');
            spinner.spinner();
            spinner.css('position', 'fixed');

            return this;
        },
        events: {
            'click #popup .cancel': 'hide_popup',
            'click .change_establishment': 'change_establishment',
            'click .go-to-directory': 'goToDirectory'
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
                collection: this.options.categories,
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
        popup_defaults: function() {
            /*return {
             className: 'popup'
             };*/
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
        showSpinner: function(event) {
            $(window).trigger('showSpinner', {startEvent: event});
        },
        hideSpinner: function(event, isLast) {
            $(window).trigger('hideSpinner', {startEvent: event, isLastEvent: isLast});
        },
        /**
         * Show the "Store Choice" block if a brand have several stores.
         */
        checkBlockStoreChoice: function() {
            var block = this.$('.store_choice');
            this.model.get('needShowStoreChoice') ? block.css({display: 'inline-block'}) : block.css({display: 'none'});
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
            this.model.set('isBlurContent', true);
        },
        /**
         * A blur effect of content.
         * Blur effect supported on Firefox 35, Google Chrome 18, Safari 6, iOS Safari 6.1, Android browser 4.4, Chrome for Android 39.
         */
        blurEffect: function() {
            // http://caniuse.com/#search=filter
            var mainEl = this.$('.main_el');
            this.model.get('isBlurContent') ? mainEl.addClass('blur') : mainEl.removeClass('blur');
        },
        goToDirectory: function() {
            var goToDirectory = this.model.get('goToDirectory');
            typeof goToDirectory == 'function' && goToDirectory();
        }
    });

    var MainMaintenanceView = App.Views.FactoryView.extend({
        name: 'main',
        mod: 'maintenance',
        initialize: function() {
            this.listenTo(this.model, 'change:isBlurContent', this.blurEffect, this); // a blur effect of content
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
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
        goToDirectory: function() {
            var goToDirectory = this.model.get('goToDirectory');
            typeof goToDirectory == 'function' && goToDirectory();
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
            this.model.set('isBlurContent', true);
        },
        /**
         * A blur effect of content.
         * Blur effect supported on Firefox 35, Google Chrome 18, Safari 6, iOS Safari 6.1, Android browser 4.4, Chrome for Android 39.
         */
        blurEffect: function() {
            // http://caniuse.com/#search=filter
            var mainEl = this.$('.maintenance');
            this.model.get('isBlurContent') ? mainEl.addClass('blur') : mainEl.removeClass('blur');
        }
    });

    var MainDoneView = App.Views.CoreMainView.CoreMainDoneView.extend({
        getPickupTime: function() {
            return {};
        }
    });

    return new (require('factory'))(done_view.initViews.bind(done_view), function() {
        App.Views.MainView.MainMainView = MainMainView;
        App.Views.MainView.MainMaintenanceView = MainMaintenanceView;
        App.Views.MainView.MainDoneView = MainDoneView;
    });
});
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
            this.listenTo(this.model, 'loadStarted', this.loadStarted, this);
            this.listenTo(this.model, 'loadCompleted', this.loadCompleted, this);

            var spinner = this.$('#main-spinner');
            spinner.spinner();
            spinner.css('position', 'fixed');
        },
        loadCompleted: function() {
            $(window).trigger('loadCompleted');
            clearTimeout(this.spinner);
            delete this.spinner;
            this.hideSpinner();
        },
        loadStarted: function() {
            this.spinner = setTimeout(this.showSpinner.bind(this), 50);
        },
        showSpinner: function() {
            this.$('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').addClass('ui-visible');
        },
        hideSpinner: function() {
            this.$('#main-spinner').addClass('ui-visible').removeClass('ui-visible');
        }
    });

    var MainMainView = SpinnerView.extend({
        name: 'main',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:content', this.content_change, this);
            this.listenTo(this.model, 'change:header', this.header_change, this);
            this.listenTo(this.model, 'change:cart', this.cart_change, this);
            this.listenTo(this.model, 'change:popup', this.popup_change, this);
            this.listenTo(this.model, 'change:profile_panel', this.profile_change, this);

            this.iOSFeatures();

            this.subViews.length = 4;

            SpinnerView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.store_choice': 'toggle:needShowStoreChoice'
        },
        render: function() {
            SpinnerView.prototype.render.apply(this, arguments);
            this.profile_change();
            this.iPad7Feature();
            this.createSpinner();

            return this;
        },
        events: {
            'click #popup .cancel': 'hide_popup',
            'click .popup .shadow-bg': 'hide_popup',
            'click .change_establishment': 'change_establishment'
        },
        content_change: function() {
            var content = this.$('#content'),
                data = this.model.get('content'),
                content_defaults = this.content_defaults();

            while (this.subViews.length > 4)
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
                data, cache_id;

            if (this.subViews[2]) {
                if (this.subViews[2].options.cache_id ) {
                    this.subViews[2].is_hidden = true; //it's cause of setInterval function in DynamicHeightHelper
                    this.subViews[2].removeFromDOMTree(); //saving the view which was cached before
                }
                else
                    this.subViews[2].remove();
            }

            if (typeof value == 'undefined')
                return popup.removeClass('ui-visible');

            data = _.defaults(this.model.get('popup'), this.popup_defaults());
             if (data.two_columns_view === true) {
                $('#popup').removeClass("popup-background");
            } else {
                $('#popup').addClass("popup-background");
            }

            cache_id = data.cache_id ? 'popup_' + data.modelName + '_' + data.mod + '_' + data.cache_id : undefined;

            var is_init_cache_session = data['init_cache_session'];
            if (is_init_cache_session && cache_id) {
                App.Views.GeneratorView.cacheRemoveView(data.modelName, data.mod, cache_id);
            }

            this.subViews[2] = App.Views.GeneratorView.create(data.modelName, data, cache_id);
            this.subViews[2].is_hidden = false;
            this.$('#popup').append(this.subViews[2].el);

            popup.addClass('ui-visible');
        },
        profile_change: function() {
            var data = _.defaults(this.model.get('profile_panel'), this.profile_defaults());

            if(!data.modelName) {
                return;
            }

            // Don't cache profile view.
            // It can be used in MainProfile with specific el.
            this.subViews[3] && this.subViews[3].remove();
            this.subViews[3] = App.Views.GeneratorView.create(data.modelName, data);
        },
        hide_popup: function(event, status) {
            var callback = _.isObject(this.model.get('popup')) ? this.model.get('popup').action_callback : null;
            this.model.unset('popup');
            callback && callback(status);
        },
        header_defaults: function() {
            return {
                model: this.options.headerModel,
                className: 'header',
                modelName: 'Header'
            };
        },
        cart_defaults: function() {
            return {
                collection: this.options.cartCollection,
                model: this.options.paymentMethods,
                customer: this.options.customer,
                checkout: this.options.cartCollection.checkout,
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
        profile_defaults: function() {
            return {
                el: this.$('#profile-panel')
            };
        },
        addContent: function(data, removeClass) {
            var id = 'content_' + data.modelName + '_' + data.mod;
            data = _.defaults(data, this.content_defaults());

            if (removeClass)
                delete data.className;

            var subView = App.Views.GeneratorView.create(data.modelName, data, id);
            this.subViews.push(subView); // subViews length always > 4

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
        bindings: {
            '.store_choice': 'toggle:needShowStoreChoice'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.listenToOnce(App.Data.mainModel, 'loadCompleted', App.Data.myorder.check_maintenance);
            if (!App.Data.router.isNotFirstLaunch) this.$('.back').hide();
        },
        events: {
            'click .reload': 'reload',
            'click .back': 'back',
            'click .change_establishment': 'change_establishment'
        },
        onEnterListeners: {
            ':el': 'reload'
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
        bindings: {
            '.header-underline': 'text: insertPlaceholder(_lp_DONE_THANK_YOU, customer_first_name)',
            '.submitted': 'html: insertPlaceholder(_lp_DONE_ORDER_SUBMITTED, format(boldTmp, header_business_name))',
            '.pickup-time': 'classes: {hide: not(inList(checkout_dining_option, "DINING_OPTION_ONLINE", "DINING_OPTION_SHIPPING"))}, html: insertPlaceholder(select(isDelivery, _lp_DONE_ARRIVE_TIME, _lp_DONE_PICKUP_TIME), format(boldTmp, checkout_pickupTime))',
            '.email-sent-to': 'text: customer_email'
        },
        bindingFilters: {
            insertPlaceholder: function(pattern, value) {
                return pattern.replace('%s', value);
            }
        },
        computeds: {
            isDelivery: {
                deps: ['checkout_dining_option'],
                get: function(dining_option) {
                    return dining_option == 'DINING_OPTION_DELIVERY'
                        || dining_option == 'DINING_OPTION_SHIPPING'
                        || dining_option == 'DINING_OPTION_CATERING';
                }
            },
            boldTmp: function() {
                return '<span class="bold">$1</span>';
            }
        },
        return_menu: function() {
            this.model.unset('popup');
            App.Views.CoreMainView.CoreMainDoneView.prototype.return_menu.apply(this, arguments);
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
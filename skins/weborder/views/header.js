define(["backbone", "factory"], function(Backbone) {
    'use strict';

    App.Views.HeaderView = {};

    App.Views.HeaderView.HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:tab_index', this.tabs, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            if (App.Data.settings.get('settings_system').delivery_for_online_orders) {
                var view = App.Views.GeneratorView.create('Header', {
                    el: this.$('.delivery_wrapper'),
                    mod: 'Delivery',
                    model: this.model
                });
                this.subViews.push(view);
            }
            loadSpinner(this.$('img.logo'));
        },
        events: {
            'click .menu': 'onMenu',
            'click .about': 'onAbout',
            'click .map': 'onMap'
        },
        tabs: function(model, value) {
            var tabs = this.$('.tabs li');
            tabs.removeClass('active');
            tabs.eq(value).addClass('active');
        },
        onMenu: function() {
            this.model.trigger('onMenu');
        },
        onAbout: function() {
            this.model.trigger('onAbout');
        },
        onMap: function() {
            this.model.trigger('onMap');
        }
    });

    App.Views.HeaderView.HeaderCheckoutView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'checkout',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            if (App.Data.settings.get('settings_system').delivery_for_online_orders) {
                var view = App.Views.GeneratorView.create('Header', {
                    el: this.$('.delivery_wrapper'),
                    mod: 'Delivery',
                    model: this.model
                });
                this.subViews.push(view);
            }
            loadSpinner(this.$('img.logo'));
        },
        events: {
            'click .btn': 'onBack'
        },
        onBack: function() {
            this.model.trigger('onBack');
        }
    });

    App.Views.HeaderView.HeaderConfirmationView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'confirmation'
    });

    App.Views.HeaderView.HeaderDeliveryView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'delivery',
        render: function() {
            var settings = App.Data.settings.get('settings_system'),
                initial_model = this.model.toJSON();

            $.extend(initial_model, {
                delivery_charge: round_monetary_currency(settings.delivery_charge),
                currency_symbol: settings.currency_symbol,
                min_delivery_amount: round_monetary_currency(settings.min_delivery_amount),
                max_delivery_distance: settings.max_delivery_distance,
                delivery_time: {
                    hour: Math.floor(settings.estimated_delivery_time / 60),
                    minutes: Math.ceil(settings.estimated_delivery_time % 60)
                },
                distance_mearsure: settings.distance_mearsure
            });

            this.model = initial_model;
            App.Views.FactoryView.prototype.render.apply(this, arguments);
        }
    });
});
define(["backbone", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.StoreInfoView = {};

    App.Views.StoreInfoView.StoreInfoMainView = App.Views.LogoView.extend({
        name: 'store_info',
        mod: 'main',
        initialize: function() {
            var settings = App.Data.settings,
                settings_system = settings.get('settings_system');
            this.model = new Backbone.Model({
                logo: settings_system.logo ? settings.get('host') + settings_system.logo : null,
                phone: settings_system.phone,
                location: settings_system.address instanceof Object ? settings_system.address.line_1 : null,
                phoneFormat: function(phone) {
                    if(phone.length < 10)
                        return phone;
                    var matches = phone.match(/^(\+?\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
                    if(matches !== null)
                        return matches.slice(1).join('.');
                    else
                        return phone;
                },
                enable_delivery: settings_system.delivery_for_online_orders,
                currency_symbol: settings_system.currency_symbol,
                delivery_charge: round_monetary_currency(settings_system.delivery_charge),
                min_delivery_amount: round_monetary_currency(settings_system.min_delivery_amount),
                delivery_radius: settings_system.max_delivery_distance,
                delivery_for_online_orders: settings_system.delivery_for_online_orders,
                est_delivery_time: {
                    hour: Math.floor(settings_system.estimated_delivery_time / 60),
                    minutes: Math.ceil(settings_system.estimated_delivery_time % 60)
                },
                distance_mearsure: settings_system.distance_mearsure
            });
            App.Views.LogoView.prototype.initialize.apply(this, arguments);
        },
        events: {
            "click .phone": "call",
            "click .store_info_main_data": "store_info"
        },
        call: function(e) {
            e.stopPropagation();
        },
        store_info: function() {
            App.Data.router.navigate('location', true);
        }
    });

    App.Views.StoreInfoView.StoreInfoInDetailsView = App.Views.LogoView.extend({
        name: 'store_info',
        mod: 'details',
        initialize: function() {
            this.model = new Backbone.Model(this.infoDetailed());

            App.Views.LogoView.prototype.initialize.apply(this, arguments);
        },
        events: {
            "click .phone": "call"
        },
        call: function(e) {
            e.stopPropagation();
        }
    });

    App.Views.StoreInfoView.StoreInfoMapView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        name: 'store_info',
        mod: 'map',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.map();
        }
    });

    App.Views.StoreInfoView.StoreInfoAboutView = App.Views.LogoView.extend({
        name: 'store_info',
        mod: 'about'
    });

    App.Views.StoreInfoView.StoreInfoGalleryView = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'gallery',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            $(window).on('resize', this.resize);
        },
        remove: function() {
            $(window).off('resize', this.resize);
            return App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            this.$el.gallery({
                images: this.model.get('images'),
                animate: true,
                circle: true
            });

            return this;
        }
    });
});
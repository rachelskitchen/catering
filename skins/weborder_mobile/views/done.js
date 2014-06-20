define(["backbone", "factory"], function(Backbone) {
    'use strict';

    App.Views.DoneView = {};

    App.Views.DoneView.DoneMainView = App.Views.FactoryView.extend({
        name: 'done',
        mod: 'main',
        render: function() {
            var model = this.model.toJSON(),
                pickup_time = model.pickup_time.split(',');
            model.type = 'Pickup Time';

            if (model.dining_option === 'DINING_OPTION_DELIVERY' || model.dining_option === 'DINING_OPTION_DELIVERY_SEAT') {
                model.type = 'Delivery Time';
            }
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.pickup_time = pickup_time[0] + ', ';
            model.pickup_day = pickup_time.slice(1).join(', ');
            model.reward_points = model.reward_points || '';
            model.isOnlyGift = model.dining_option === 'DINING_OPTION_ONLINE';

            this.$el.html(this.template(model));
            return this;
        }
    });

    App.Views.DoneView.DoneErrorView = App.Views.FactoryView.extend({
        name: 'done',
        mod: 'error'
    });
});
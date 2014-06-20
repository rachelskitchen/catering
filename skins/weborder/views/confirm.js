define(["backbone", "checkout_view"], function(Backbone) {
    'use strict';

    App.Views.ConfirmView = {};

    App.Views.ConfirmView.ConfirmPayCardView = App.Views.FactoryView.extend({
        name: 'confirm',
        mod: 'card_order',
        initialize: function() {
            this.listenTo(this.collection, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(this.collection, "paymentFailed", function(message) {
                this.collection.trigger('hideSpinner');
            }, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            var new_model = {},//this.collection.toJSON(),
                pickup = this.collection.checkout.get("pickupTS"),
                currentTime = this.options.timetable.base(),
                time = currentTime.getTime();

            new_model.isDelivery = this.collection.checkout.get("dining_option") === 'DINING_OPTION_DELIVERY';

            if (pickup) pickup = new Date(time > pickup ? time : pickup);
            new_model.pickup_time = format_date_3(pickup);

            this.$el.html(this.template(new_model));

            this.subViews.push(App.Views.GeneratorView.create('Card', {
                el: this.$('#credit-card'),
                mod: 'Main',
                model: this.options.card
            }));

            this.subViews.push(App.Views.GeneratorView.create('MyOrder', {
                el: this.$('.order-items'),
                mod: 'List',
                collection: this.collection
            }));
            this.$('.order-items').contentarrow();

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.total_block'),
                mod: 'Checkout',
                model: this.collection.total,
                collection: this.collection
            }));
        },
        events: {
            'click .btn-submit': 'submit_payment'
        },
        submit_payment: function() {
            var self = this;
            this.options.card.trigger('add_card');
            saveAllData();

            self.collection.check_order({
                card: true
            }, function() {
                self.collection.pay_order_and_create_order_backend(2);
                !self.canceled && self.collection.trigger('showSpinner');
                $('#popup .cancel').trigger('click');
            });
        }
    });
});

define(["backbone", "factory", "checkout_view"], function(Backbone) {
    'use strict';

    App.Views.CheckoutView.CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        name: 'checkout',
        mod: 'main',
        initialize: function() {
            this.listenTo(this, 'address-with-states', this.showDeliveryWithStates, this);
            this.listenTo(this, 'address-without-states', this.showDelivery, this);
            this.listenTo(this, 'address-hide', this.hideDelivery, this);
            App.Views.CoreCheckoutView.CoreCheckoutMainView.prototype.initialize.apply(this, arguments);
        },
        showDelivery: function() {
            this.$('.contact_info').addClass('address-without-states');
        },
        showDeliveryWithStates: function() {
            this.$('.contact_info').addClass('address-with-states');
        },
        hideDelivery: function() {
            this.$('.contact_info').removeClass('address-with-states').removeClass('address-without-states');
        }
    });
});
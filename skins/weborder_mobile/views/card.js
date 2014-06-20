define(["backbone", "card_view"], function(Backbone) {
    'use strict';

    App.Views.CardView.CardMainView = App.Views.CoreCardView.CoreCardMainView.extend({
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'add_card', this.onProceed, this);
        },
        onProceed: function() {
            this.setData();
            App.Data.myorder.check_order({
                card: true
            }, function() {
                App.Data.router.navigate('confirm', true);
            });
        }
    });
});
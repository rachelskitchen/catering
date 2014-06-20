define(["backbone", "factory", "quantity_view"], function(Backbone) {
    'use strict';

    App.Views.QuantityView.QuantityMainView = App.Views.CoreQuantityView.CoreQuantityMainView.extend({
        events: {
            'change select': 'change',
        },
        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var select = this.$('select'),
                product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                stock_amount = product.get('stock_amount');

            select.empty();
            for (var i = 1; i <= stock_amount; i++) {
                if (i === quantity) {
                    select.append('<option selected="selected" value="' + i + '">' + i + '</option>');
                } else {
                    select.append('<option value="' + i + '">' + i + '</option>');
                }
            }

            if (stock_amount === 1) {
                select.addClass('disabled');
                select.prop('disabled', true);
            } else {
                select.removeClass('disabled');
                select.prop('disabled', false);
            }
        },
        change: function(e) {
            this.model.set('quantity', e.target.value * 1);
        },
        update: function() {
            this.$('span.quantity').text(this.model.get('quantity'));
        }
    });

    App.Views.QuantityView.QuantityWeightView = App.Views.CoreQuantityView.CoreQuantityWeightView.extend({
        events: {
            'change .weight_edit_input': 'change_weight'
        },
        change_weight: function(e) {
            this.model.set('weight', e.target.value * 1);
        }
    });
});
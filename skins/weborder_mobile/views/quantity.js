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

define(["quantity_view"], function(quantity_view) {
    'use strict';

    var QuantityMainView = App.Views.CoreQuantityView.CoreQuantityMainView.extend({
        bindings: {
            'input.quantity_edit_input': 'restrictInput: "0123456789", kbdSwitcher: "numeric"'
        },
        events: {
            'click .increase:not(.disabled)': 'increase',
            'click .decrease:not(.disabled)': 'decrease',
            'input .quantity_edit_input': 'change_quantity',
            'blur .quantity_edit_input': 'blur_quantity'
        },
        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var product = this.model.get_product(),
                disallowNegativeInventory = App.Data.settings.get('settings_system').cannot_order_with_empty_inventory;
            if (product.get('stock_amount') === 1 || product.isParent()) {
                this.$('.decrease').addClass('disabled');
                this.$('.increase').addClass('disabled');
                this.$('.quantity_edit_input').addClass('disabled').prop('disabled', true);
                disallowNegativeInventory && this.model.set('quantity', 1); // bug 13494
            } else {
                this.$('.decrease').removeClass('disabled');
                this.$('.increase').removeClass('disabled');
                this.$('.quantity_edit_input').removeClass('disabled').prop('disabled', false);
            }
        },
        increase: function(event) {
            if($(event.target).hasClass('disabled'))
                return;
            var q = this.model.get('quantity'),
                stock_amount = this.model.get_product().get('stock_amount');
            this.model.set('quantity', ++q <= stock_amount ? q : stock_amount);
        },
        decrease: function(event) {
            if($(event.target).hasClass('disabled'))
                return;
            var q = this.model.get('quantity');
            this.model.set('quantity', --q >= 1 ? q : 1);
        },
        update: function() {
            this.$('.quantity_edit_input').val(this.model.get('quantity'));
        },
        change_quantity: function(e) {
            var min = 1,
                max = this.model.get_product().get('stock_amount');

            if (!e.target.validity.valid) {
                e.target.value = min;
            } else if (e.target.value > max) {
                e.target.value = max;
            }

            if (e.target.value)  {
                this.model.set('quantity', e.target.value * 1);
            }
        },
        blur_quantity: function(e) {
            if (!e.target.value) {
                e.target.value = 1;
                this.model.set('quantity', e.target.value * 1);
            }
        }

    });

    var QuantityWeightView = App.Views.CoreQuantityView.CoreQuantityWeightView.extend({
        update: function() {
            this.$('.weight_edit_input').val(this.model.get('weight').toFixed(this.number_decimal_digits));
        }
    });

    return new (require('factory'))(quantity_view.initViews.bind(quantity_view), function() {
        App.Views.QuantityView.QuantityMainView = QuantityMainView;
        App.Views.QuantityView.QuantityWeightView = QuantityWeightView;
    });
});
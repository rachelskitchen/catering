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

define(["backbone", "factory", "quantity_view"], function(Backbone) {
    'use strict';

    App.Views.QuantityView.QuantityMainView = App.Views.CoreQuantityView.CoreQuantityMainView.extend({
        events: {
            'click .increase': 'increase',
            'click .decrease': 'decrease',
        },
        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            if (this.model.get_product().get('stock_amount') === 1) {
                this.$('.decrease').addClass('disabled');
                this.$('.increase').addClass('disabled');
            } else {
                this.$('.decrease').removeClass('disabled');
                this.$('.increase').removeClass('disabled');
            }
        },
        increase: function() {
            var q = this.model.get('quantity'),
                stock_amount = this.model.get_product().get('stock_amount');
            this.model.set('quantity', ++q <= stock_amount ? q : stock_amount);
        },
        decrease: function() {
            var q = this.model.get('quantity');
            this.model.set('quantity', --q >= 1 ? q : 1);
        },
        update: function() {
            this.$('span.quantity').text(this.model.get('quantity'));
        }
    });

    App.Views.QuantityView.QuantityWeightView = App.Views.CoreQuantityView.CoreQuantityWeightView.extend({
        initialize: function() {
            App.Views.CoreQuantityView.CoreQuantityWeightView.prototype.initialize.apply(this, arguments);
            this.num_digits = Math.abs((App.Data.settings.get("settings_system").scales.number_of_digits_to_right_of_decimal).toFixed(0)*1);
        },
        events: {
            'change .weight_edit_input': 'change_weight'
        },
        change_weight: function(e) {
            this.model.set('weight', e.target.value * 1);
        },
        update: function() {
            this.$('.weight_edit_input').val(this.model.get('weight').toFixed(this.num_digits));
        }
    });
});
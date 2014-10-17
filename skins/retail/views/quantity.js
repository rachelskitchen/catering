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
            'change select': 'change',
        },
        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var select = this.$('select'),
                product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                stock_amount = product.get('stock_amount'),
                selectWrapper = this.$('.select-wrapper');

            // need hide quantity widget if parent product is selected
            if(product.isParent())
                return this.$el.hide();

            stock_amount > 0 && select.empty();
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
                selectWrapper.addClass('disabled');
            } else {
                select.removeClass('disabled');
                select.prop('disabled', false);
                selectWrapper.removeClass('disabled');
            }
        },
        change: function(e) {
            this.model.set('quantity', e.target.value * 1);
        }
    });
});
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
        events: {
            'change input': 'change'
        },
        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var select = this.$('select'),
                product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                stock_amount = product.get('stock_amount'),
                selectWrapper = this.$('.combobox-wrapper');

            select.empty();
            for (var i = 1; i <= Math.min(stock_amount, 100); i++) {
                if (i === quantity) {
                    select.append('<option selected="selected" value="' + i + '">' + i + '</option>');
                } else {
                    select.append('<option value="' + i + '">' + i + '</option>');
                }
            }

            if (stock_amount === 1 || product.isParent()) {
                select.addClass('disabled');
                select.prop('disabled', true);
                selectWrapper.addClass('disabled');
            } else {
                select.removeClass('disabled');
                select.prop('disabled', false);
                selectWrapper.removeClass('disabled');
            }

            if(product.isParent())
                this.$el.hide();

            select.combobox();
            var inputbox = this.$('.inputbox');
            inputTypeNumberMask(inputbox, /^[1-9][0-9]{0,2}$/); // 1-999 range
            inputbox.trigger("change");
        },
        change: function(e) {
            this.model.set('quantity', e.target.value * 1);
        }
    });

    return new (require('factory'))(quantity_view.initViews.bind(quantity_view), function() {
        App.Views.QuantityView.QuantityMainView = QuantityMainView;
    });
});
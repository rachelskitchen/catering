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

define(["backbone", "factory"], function(Backbone) {
    'use strict';
    App.Views.CoreQuantityView = {};

    App.Views.CoreQuantityView.CoreQuantityMainView = App.Views.FactoryView.extend({
        name: 'quantity',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:quantity', this.update, this);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.hide_show);
            this.hide_show();
        },
        hide_show: function() {
            var product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                stock_amount = product.get('stock_amount'),
                is_gift = product.get('is_gift');

            is_gift && this.model.set('quantity', 1);

            if (is_gift) {
                this.$el.hide();
            } else {
                this.$el.show();
            }

            this.$('.select-wrapper').addClass('l' + (stock_amount ? stock_amount.toString().length : '1'));
        },
        update: function() {

        }
    });

    App.Views.CoreQuantityView.CoreQuantityWeightView = App.Views.FactoryView.extend({
        name: 'quantity',
        mod: 'weight',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:weight', this.update, this);
        },
        render: function() {
            var self = this,
                model = this.model.toJSON(),
                product = this.model.get_product();

            model.sold_by_weight = product.get("sold_by_weight");
            model.weight = this.model.get('weight') ? this.model.get('weight') : '';
            model.uom = App.Data.settings.get("settings_system").scales.default_weighing_unit;

            this.$el.html(this.template(model));

            if (model.sold_by_weight) {
                var reg_str, elem = self.$('.weight_edit_input');
                var number_decimal_digits = App.Data.settings.get("settings_system").scales.number_of_digits_to_right_of_decimal;
                if (number_decimal_digits)
                   reg_str = "^\\d{0,4}\\.{0,1}\\d{0," + number_decimal_digits + "}$";
                else
                   reg_str = "^\\d{0,4}$";

                // shoudn't change type attribute for android platforms
                // because some devices have problem with numeric keypad - don't have '.', ',' symbols (bug 11032)
                inputTypeNumberMask(elem, new RegExp(reg_str), null, cssua.ua.android);
            }
        },
        update: function() {

        }
    });

    App.Views.QuantityView = {};

    App.Views.QuantityView.QuantityMainView = App.Views.CoreQuantityView.CoreQuantityMainView;
    App.Views.QuantityView.QuantityWeightView = App.Views.CoreQuantityView.CoreQuantityWeightView;
});

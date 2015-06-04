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

    App.Views.CoreTipsView = {};

    App.Views.CoreTipsView.CoreTipsLineView = App.Views.FactoryView.extend({
        name: 'tips',
        mod: 'line',
        initialize: function() {
            this.tipAmountRegStr = "^\\d{0,5}(\\.\\d{0,2})?$";
            this.model.set('iPad', /ipad/i.test(window.navigator.userAgent));
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:amount', this.render, this);
            this.listenTo(this.model, 'change:percent', this.render, this);
            this.listenTo(this.model, 'change:type', this.render, this);
            this.listenTo(this.options.total, 'change:total', this.setSum, this);
        },
        render: function() {
            var self = this,
                model = this.model.toJSON();
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            model.tip_allow = App.Data.settings.get('settings_system').accept_tips_online === true;
            this.$el.html(this.template(model));
            // because some devices have problem with numeric keypad - don't have '.', ',' symbols (bug 11032) -> use 'float' type:
            inputTypeMask(this.$('.tipAmount'), new RegExp(this.tipAmountRegStr), '0.00', 'float');
            this.setBtnSelected(model.type ? (model.amount ? model.percent : "Other") : "None");
            return this;
        },
        events: {
            'click .btn': 'setAmount',
            'change .tipAmount': 'setSum'
        },
        setAmount: function(e) {
            var amount_str = $(e.target).attr('data-amount'),
                amount = amount_str*1;
            var obj_set = {'type' : amount_str != "None",
                            'amount': isNaN(amount) || amount_str == "None" ? false : true };
            if (amount) {
                obj_set['percent'] = amount;
            }
            this.model.set(obj_set);
            this.setSum();
            this.setBtnSelected(amount_str);
        },
        setBtnSelected: function(amount_str) {
            //this is for animation works after template rendering
            setTimeout( (function() {
                this.$('.btn').removeClass('selected');
                this.$('[data-amount=' + amount_str + ']').addClass('selected');
            }).bind(this), 0);
        },
        setSum: function() {
            var amount = this.$('.tipAmount'),
                newAmount = amount.val(),
                formatAmount = parseFloat(newAmount),
                pattern = new RegExp(this.tipAmountRegStr.replace(/(.*)0(.*)0(.*)/, '$11$22$3').replace(/[\(\)\?]/g, ''));

            if(amount.attr('disabled')) {
                var tip = round_monetary_currency(App.Data.myorder.total.get_tip());
                amount.val(tip);
                this.model.set('sum', tip*1);
            } else if(!isNaN(formatAmount)) {
                this.model.set('sum', formatAmount);
            }

            // If input field value does not match "XX.XX" need format it.
            // Also need restore previos (or 0.00 if it was unset) value if new value is '.'.
            if(!pattern.test(newAmount)) {
                amount.val(round_monetary_currency(this.model.get('sum')));
            }
        }
    });

    return new (require('factory'))(function() {
        App.Views.TipsView = {};
        App.Views.TipsView.TipsMainView = App.Views.CoreTipsView.CoreTipsMainView;
        App.Views.TipsView.TipsLineView = App.Views.CoreTipsView.CoreTipsLineView;
    });
});
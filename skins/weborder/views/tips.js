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

define(['tips_view'], function() {
    'use strict';

    App.Views.TipsView.TipsMainView = App.Views.FactoryView.extend({  
        name: 'tips',
        mod: 'main',
        initialize: function() {
            this.model.set('iPad', /ipad/i.test(window.navigator.userAgent));
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);          
            this.listenTo(this.model, 'change', this.render, this);
        },
        render: function() {
            var self = this,
                model = this.model.toJSON();
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            
            this.$el.html(this.template(model));
            inputTypeNumberMask(this.$('.tipAmount'), /^\d{0,5}\.{0,1}\d{0,2}$/, '0.00');
            return this;
        },
        events: {
            'click .btn': 'setAmount',
            'change .tipAmount': 'setSum'
        },
        setAmount: function(e) {
            var amount_str = $(e.target).attr('data-amount'),
                amount = amount_str*1;

            this.model.set({'type' : amount_str != "None",
                            'amount': isNaN(amount) || amount_str == "None" ? false : true });            
            if (amount) {
                this.model.set('percent', amount);
            }                        
            this.setSum();
        },
        setSum: function() {
            var amount = this.$('.tipAmount');
            if (amount.attr('disabled')) {
                var tip = round_monetary_currency(App.Data.myorder.total.get_tip());
                this.model.set('sum', tip*1);
            } else {
                this.model.set('sum', amount.val()*1);
            }
        }
    });
});
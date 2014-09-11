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

    App.Views.CoreTipsView.CoreTipsMainView = App.Views.FactoryView.extend({
        name: 'tips',
        mod: 'main',
        render: function() {
            var self = this,
                model = this.model.toJSON();
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            model.tip_allow = App.Data.settings.get('settings_system').accept_tips_online === true;

            this.$el.html(this.template(model));
            // shoudn't change type attribute for android platforms
            // because some devices have problem with numeric keypad - don't have '.', ',' symbols (bug 11032)
            inputTypeNumberMask(this.$('.tipAmount'), /^\d{0,5}\.{0,1}\d{0,2}$/, '0.00', cssua.ua.android);

            // execute after render
            setTimeout(function() {
                var type = self.model.get('type') ? 1 : 0,
                    amount = self.model.get('amount'),
                    percent = self.model.get('percent'),
                    sum = self.model.get('sum');

                self.$('input[name="tips"][value="' + type + '"]').change();
                if(type)
                    if(amount && percent)
                        self.$('.btn[data-amount="' + percent + '"]').click();
                    else if(!amount) {
                        self.$('.btn[data-amount="other"]').click();
                        self.$('.tipAmount').val(sum || '0.00');
                    }
            }, 0);

            this.listenSum = setInterval(this.setSum.bind(this), 200);

            return this;
        },
        remove: function() {
            clearInterval(this.listenSum);
            return App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        events: {
            'change input[name="tips"]': 'setType',
            'click .btn': 'setAmount',
            'change .tipAmount': 'setSum'
        },
        setType: function(e) {
            var val = Boolean(parseInt(e.target.value, 10));

            this.$('.tipAmount').attr('disabled', 'disabled');
            this.$('input[name="tips"]').removeAttr('checked');
            this.$(e.target).attr('checked', 'checked');

            this.model.set('type', val);

            if(!val) {
                this.$('.btn').removeClass('selected');
                this.$('.btn').addClass('disabled');
            } else {
                this.$('.btn').removeClass('disabled');
            }

            this.$('[type="radio"]').next('.radio').removeClass('checked');
            this.$(e.target).next('.radio').addClass('checked');
        },
        setAmount: function(e) {
            if(this.$(e.target).hasClass('disabled'))
                return;

            var amount = $(e.target).attr('data-amount') * 1;

            this.$('.btn').removeClass('selected');
            this.$(e.target).addClass('selected');

            this.model.set('amount', isNaN(amount) ? false : true);

            if(amount) {
                this.$('.tipAmount').attr('disabled', 'disabled');
                this.model.set('percent', amount);
            } else {
                this.$('.tipAmount').removeAttr('disabled');
            }
        },
        setSum: function() {
            var amount = this.$('.tipAmount');

            if(amount.attr('disabled') === 'disabled') {
                amount.val(round_monetary_currency(App.Data.myorder.total.get_tip()));
            } else {
                this.model.set('sum', amount.val());
            }

        }
    });


    App.Views.CoreTipsView.CoreTipsLineView = App.Views.FactoryView.extend({  
        name: 'tips',
        mod: 'line',
        initialize: function() {
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
            
            this.$el.html(this.template(model));            
            // shoudn't change type attribute for android platforms
            // because some devices have problem with numeric keypad - don't have '.', ',' symbols (bug 11032)
            inputTypeNumberMask(this.$('.tipAmount'), /^\d{0,5}\.{0,1}\d{0,2}$/, '0.00', cssua.ua.android);
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
                this.$('[data-amount='+amount_str+']').addClass('selected');
            }).bind(this), 0);
        },
        setSum: function() {
            var amount = this.$('.tipAmount');
            if (amount.attr('disabled')) {
                var tip = round_monetary_currency(App.Data.myorder.total.get_tip());
                amount.val(tip);
                this.model.set('sum', tip*1);
            } else {
                this.model.set('sum', amount.val()*1);
            }
        }
    });

    App.Views.TipsView = {};

    App.Views.TipsView.TipsMainView = App.Views.CoreTipsView.CoreTipsMainView;
    
    App.Views.TipsView.TipsLineView = App.Views.CoreTipsView.CoreTipsLineView;
});
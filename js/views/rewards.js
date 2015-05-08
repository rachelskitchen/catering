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

 define(["factory", "backbone_epoxy"], function(factory) {
    'use strict';

    Backbone.Epoxy.binding.addFilter('currencyFormat', function(value) {
        return App.Settings.currency_symbol + round_monetary_currency(value);
    });

    var RewardsCardView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'card',
        bindings: {
            '.rewards-input': 'value: number, events: ["input"]',
            '.submit-card': 'classes: {disabled: select(number, false, true)}',
        },
        events: {
            'click .submit-card': 'submit'
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.applyBindings();
        },
        submit: function() {
            this.model.trigger('onGetRewards');
        }
    });

    var RewardsItemApplicationView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'item_application',
        tagName: 'li',
        binding: {
            '.discount': 'text: currencyFormat(discount)'
        }
    });

    var RewardsOrderApplicationView = RewardsItemApplicationView.extend({
        name: 'rewards',
        mod: 'order_application'
    });

    var RewardsInfoView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'info',
        bindings: {
            '.rewards-number': 'text: number',
            '.total-points': 'text: points_value',
            '.total-visits': 'text: visits_value',
            '.total-purchases': 'text: currencyFormat(purchases_value)'
        },
        events: {
            'click .apply-reward': 'apply'
        },
        initialize: function() {
            // extend bindingSources to implement the ability pass bindingSources via options
            if(this.options.bindingSources instanceof Object) {
                this.bindingSources = this.bindingSources || {};
                _.extend(this.bindingSources, this.options.bindingSources);
            }

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.applyBindings();
        },
        apply: function() {
            console.log('reward has been applied');
        }
    });

    return new (require('factory'))(function() {
        App.Views.RewardsView = {}
        App.Views.RewardsView.RewardsCardView = RewardsCardView;
        App.Views.RewardsView.RewardsItemApplicationView = RewardsItemApplicationView;
        App.Views.RewardsView.RewardsOrderApplicationView = RewardsOrderApplicationView;
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;

        // mixin prototype with Backbone.Epoxy.View.prototype
        Backbone.Epoxy.View.mixin(RewardsCardView.prototype);
        Backbone.Epoxy.View.mixin(RewardsItemApplicationView.prototype);
        Backbone.Epoxy.View.mixin(RewardsOrderApplicationView.prototype);
        Backbone.Epoxy.View.mixin(RewardsInfoView.prototype);
    });
});
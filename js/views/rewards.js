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

 define(["factory"], function(factory) {
    'use strict';

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

    return new (require('factory'))(function() {
        App.Views.RewardsView = {}
        App.Views.RewardsView.RewardsCardView = RewardsCardView;

        // mixin prototype with Backbone.Epoxy.View.prototype
        Backbone.Epoxy.View.mixin(RewardsCardView.prototype);
    });
});
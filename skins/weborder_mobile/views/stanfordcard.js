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

define(["stanfordcard_view"], function(stanfordcard_view) {
    'use strict';

    var StanfordCardMainView = App.Views.CoreStanfordCardView.CoreStanfordCardMainView.extend({
        initialize: function() {
            App.Views.CoreStanfordCardView.CoreStanfordCardMainView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'add_card', this.onProceed, this);
            this.listenTo(App.Data.myorder, "paymentFailed", function(message) {
                App.Data.mainModel.trigger("loadCompleted");
                message && App.Data.errors.alert(message); // user notification
            }, this);
        },
        onProceed: function() {
            this.setData();
            App.Data.myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                giftcard: false,
                stanfordcard: true
            }, function() {
                App.Data.myorder.create_order_and_pay(PAYMENT_TYPE.STANFORD);
                App.Data.mainModel.trigger('loadStarted');
            });
        }
    });

    return new (require('factory'))(stanfordcard_view.initViews.bind(stanfordcard_view), function() {
        App.Views.StanfordCardView.StanfordCardMainView = StanfordCardMainView;
    });
});

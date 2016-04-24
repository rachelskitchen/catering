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

define(["factory", "stanfordcard_view"], function(factory, stanfordcard_view) {
    'use strict';

    var CoreStanfordCardMainView = App.Views.CoreStanfordCardView.CoreStanfordCardMainView,
        StanfordCardPopupView = CoreStanfordCardMainView.extend({
        name: 'stanfordcard',
        mod: 'popup',
        bindings: _.extend({}, CoreStanfordCardMainView.prototype.bindings, {
            '.btn-submit': 'classes: {disabled: any(not(number), not(captchaKey), not(captchaValue))}'
        }),
        events: _.extend({}, CoreStanfordCardMainView.prototype.events, {
            'click .btn-cancel': 'cancel',
            'keydown .btn-cancel': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.cancel();
                }
            },
            'click .btn-submit': 'submit',
            'keydown .btn-submit': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.submit();
                }
            }
        }),
        initialize: function() {
            this.listenTo(this.model, 'onStanfordCardError', this.showErrorMsg, this);
            CoreStanfordCardMainView.prototype.initialize.apply(this, arguments);
        },
        cancel: function() {
            this.model.trigger('onCancelStudentVerification');
        },
        submit: function() {
            var myorder = this.options.myorder;
            myorder.trigger('showSpinner');
            this.model.getPlans().then(myorder.trigger.bind(myorder, 'hideSpinner'));
        },
        showErrorMsg: function(msg) {
            App.Data.errors.alert(msg);
        }
    });

    var StanfordCardPlanView = App.Views.CoreStanfordCardView.CoreStanfordCardPlanView.extend({
        bindings: {
            '.radio': 'classes: {checked: selected}'
        }
    });

    return new (require('factory'))(stanfordcard_view.initViews.bind(stanfordcard_view), function() {
        App.Views.StanfordCardView.StanfordCardPopupView = StanfordCardPopupView;
        App.Views.StanfordCardView.StanfordCardPlanView = StanfordCardPlanView;
    });
});
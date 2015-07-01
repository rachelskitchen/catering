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

define(["backbone", "captcha"], function(Backbone) {
    'use strict';

    /**
     * @class
     * Represents Stanford Card Plan model.
     */
    App.Models.StanfordCardPlan = Backbone.Model.extend({
        /**
         * @prop {object} defaults - the literal object containing attributes with default values.
         *
         * @prop {number} defaults.id - the plan id.
         * @default null.
         *
         * @prop {string} defaults.name - the plan name.
         * @default ''.
         *
         * @prop {string} defaults.type - the palan type (may be Dollars or Meals).
         * @default 'D'.
         *
         * @prop {number} defaults.balance - the plan balance.
         * @default 0.
         *
         * @prop {boolean} defaults.selected - flag of user selection.
         * @default false.
         */
        defaults: {
            id: null,
            name: '',
            type: 'D',
            balance: 0,
            selected: false
        }
    });

    /**
     * @class
     * Represents collection of Stanford Card Plans.
     */
    App.Collections.StanfordCardPlans = Backbone.Collection.extend({
        /**
         * @prop {App.Models.StanfordCardPlan} model - the constructor of models.
         * @default App.Models.StanfordCardPlan.
         */
        model: App.Models.StanfordCardPlan,
        /**
         * @method
         * Sets 'unselect()' method as listener for 'change:selected' event.
         */
        initialize: function() {
            this.listenTo(this, 'change:selected',  this.unselect, this);
        },
        /**
         * @method
         * Unselects early selected plans.
         */
        unselect: function(model, value) {
            if(value) {
                this.each(function(plan) {
                    if(plan !== model) {
                        plan.set('selected', false);
                    }
                });
            }
        }
    });

    /**
     * @class
     * Represents Stanford Card model.
     */
    App.Models.StanfordCard = App.Models.Captcha.extend({
        /**
         * @prop {object} defaults - the literal object containing attributes with default values.
         *
         * @prop {number} defaults.number - the Stanford Card number.
         * @default null.
         *
         * @prop {App.Collections.StanfordCardPlans} defaults.plans - available Stanford Card plans.
         * @default null.
         *
         * @prop {number} defaults.planId - the selected Stanford Card plan.
         * @default null.
         */
        defaults: _.extend({}, App.Models.Captcha.prototype.defaults, {
            number: '',
            plans: null,
            planId: null
        }),
        /**
         * @method
         * Sets `plans` attribute value and 'updatePlanId()' method as listener for `plans::change:selected` event.
         */
        initialize: function() {
            var plans = this.get('plans');
            if(!(plans instanceof App.Collections.StanfordCardPlans) && !Array.isArray(plans)) {
                plans = new App.Collections.StanfordCardPlans();
            } else if(Array.isArray(plans)) {
                plans = new App.Collections.StanfordCardPlans(plans);
            }
            this.set('plans', plans);
            this.listenTo(plans, 'change:selected', this.updatePlanId, this);
        },
        /**
         * @method
         * Updates `planId` attribute value.
         */
        updatePlanId: function() {
            var selected = this.get('plans').where({selected: true});
            this.set('planId', selected.length ? selected[0].get('id') : this.defaults.planId);
        },
        /**
         * @method
         * Resets all attribute values to default.
         */
        reset: function() {
            this.set({
                number: this.defaults.number,
                captchaKey: this.defaults.captchaKey,
                captchaValue: this.defaults.captchaValue,
                captchaImage: this.defaults.captchaImage,
                planId: this.defaults.planId
            });
            this.get('plans').reset();
        },
        /**
         * @method
         * Receives available Stanford Card plans from '/weborders/stanford_card' resource.
         * The following json is sent as POST data:
         * {
         *    "establishment": <number>,
         *    "number”: <string>,
         *    "captchaKey": <string>,
         *    "captchaValue": <string>
         * }
         */
        getPlans: function() {
            var est = App.Data.settings.get('establishment'),
                req = Backbone.$.Deferred(),
                plans = this.get('plans'),
                data = this.toJSON(),
                self = this;

            // abort execution if one of 'captchaKey', 'captchaValue', 'number' is invalid
            if(typeof data.number != 'string' || !data.number.length || !data.captchaKey || !data.captchaValue) {
                req.resolve();
                return req;
            }

            // send request
            Backbone.$.ajax({
                url: '/weborders/stanford_card/',
                type: 'POST',
                data: JSON.stringify({
                    establishment: est,
                    number: data.number,
                    captchaKey: data.captchaKey,
                    captchaValue: data.captchaValue
                }),
                dataType: 'json',
                success: function(data) {
                    // expect response that may have following formats:
                    // {status: 'OK', data:[...]} - card number exists
                    // {status: 'OK', data: []} - card number doesn't exist
                    // {status: 'ERROR', errorMsg: '...'} - invalid captcha
                    if(!Array.isArray(data.data)) {
                        self.trigger('onStanfordCardError', data.errorMsg);
                    } else if(!data.data.length) {
                        plans.reset();
                        self.trigger('onStanfordCardError', _loc.STANFORD_NO_PLANS);
                    } else {
                        plans.reset(data.data);
                        plans.at(0).set('selected', true);
                    }
                },
                complete: req.resolve.bind(req)
            });

            return req;
        }
    });
});


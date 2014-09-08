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

define(["backbone"], function(Backbone) {
    'use strict';

    App.Models.Tip = Backbone.Model.extend({
        defaults: function() {
            return {
                type: false, // tip in cash (false) or credit card (true)
                amount: true, // true - %, false - $
                percents: [10,15,20], // percent variant
                sum: 0, // sum if amount false
                percent: 0, // percent if amount true
                img: App.Data.settings.get("img_path")
            };
        },
        get_tip: function(total) {
            var type = this.get('type'),
                amount = this.get('amount'),
                percent = this.get('percent') * 1,
                sum = this.get('sum') * 1;

            if (!type) {
                return 0;
            } else {
                if (amount) {
                    return percent*total/100;
                }
                else {
                    return sum;
                }
            }
        },
        /**
         * empty: set default values for the tip obj
         */
        empty: function() {
            this.set(this.defaults());
        },
        /**
         *
         */
        saveTip : function() {
            setData('tip',this);
        },
        /**
         *
         */
        loadTip : function() {
            this.set(getData('tip'));
        }
    });
});
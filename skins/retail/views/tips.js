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

    App.Views.TipsView.TipsMainView = App.Views.CoreTipsView.CoreTipsMainView.extend({
        render: function() {
            this.model.set('iPad', /ipad/i.test(window.navigator.userAgent));
            return App.Views.CoreTipsView.CoreTipsMainView.prototype.render.apply(this, arguments);
        },
        setType: function(e) {
            App.Views.CoreTipsView.CoreTipsMainView.prototype.setType.apply(this, arguments);
            this.$('.input_beauty').addClass('disabled');
        },
        setAmount: function(e) {
            var input = this.$('.input_beauty');
            App.Views.CoreTipsView.CoreTipsMainView.prototype.setAmount.apply(this, arguments);
            if(isNaN(parseInt($(e.target).attr('data-amount'), 10)) && this.model.get('type'))
                input.removeClass('disabled');
            else
                input.addClass('disabled');
        }
    });
});
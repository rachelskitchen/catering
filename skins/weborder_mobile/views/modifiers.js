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

define(["modifiers_view"], function(modifiers_view) {
    'use strict';

    var ModifiersItemView = App.Views.CoreModifiersView.CoreModifiersItemView.extend({
        orientationChanged: false,
        initialize: function() {
            App.Views.CoreModifiersView.CoreModifiersItemView.prototype.initialize.apply(this, arguments);
            var self = this;
            if (cssua.ua.android) {
                Backbone.$(window).on('windowResize.ModifiersItem', function() {
                    if (self.orientationChanged) {
                        setTimeout(self.androidOrientationChangeHandler, 300);
                        self.orientationChanged = false;
                    }
                });

                Backbone.$(window).on("orientationchange.ModifiersItem", function(event) {
                    self.orientationChanged = true; // "orientationchange" event gets fired earlier than "resize"
                });
            }
        },
        remove: function() {
            if (cssua.ua.android) {
                Backbone.$(window).off('orientationchange.ModifiersItem');
                Backbone.$(window).off('windowResize.ModifiersItem');
            }
            App.Views.CoreModifiersView.CoreModifiersItemView.prototype.remove.apply(this, arguments);
        },
        androidOrientationChangeHandler: function() {
            App.Views.CoreModifiersView.CoreModifiersItemView.prototype.setTooltipPosition.apply(this);
        },
    });

    return new (require('factory'))(modifiers_view.initViews.bind(modifiers_view), function() {
        App.Views.ModifiersView.ModifiersItemView = ModifiersItemView;
    });
});

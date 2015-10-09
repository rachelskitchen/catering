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

define(["instructions_view"], function(instructions_view) {
    'use strict';

    var InstructionsModifiersView = App.Views.CoreInstructionsView.CoreInstructionsModifiersView.extend({
        bindings: {
            '.instructions': 'value: special, events: ["input"]'
        },
        render: function() {
            var self = this;
            App.Views.CoreInstructionsView.CoreInstructionsModifiersView.prototype.render.apply(this, arguments);
            /* Bug 5278 */
            this.$('textarea').on('touchstart', function() {
                var $self = $(this);
                setTimeout(function() {
                    var $scroll = $self.parents('.ps-container');
                    if ($scroll.length > 0 && $self.position().top + $self.outerHeight() > $scroll.height()) {
                        $scroll.scrollTop($scroll.scrollTop() + $self.position().top + $self.outerHeight() - $scroll.height());
                    }
                    $self[0].scrollIntoView();
                    $self.focus();
                }, 500);
            });
            /* end Bug 5278 */
        }
    });

    return new (require('factory'))(instructions_view.initViews.bind(instructions_view), function() {
        App.Views.InstructionsView = {};
        App.Views.InstructionsView.InstructionsModifiersView = InstructionsModifiersView;
    });
});
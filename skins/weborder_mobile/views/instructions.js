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

define(["backbone", "factory", "instructions_view"], function(Backbone) {
    'use strict';

    App.Views.InstructionsView = {};

    App.Views.InstructionsView.InstructionsModifiersView = App.Views.CoreInstructionsView.CoreInstructionsModifiersView.extend({
        render: function() {
            var self = this;
            App.Views.CoreInstructionsView.CoreInstructionsModifiersView.prototype.render.apply(this, arguments);
            /* Bug 5278 */
            this.$('textarea').on('touchstart', function() {
                var $self = $(this);
                setTimeout(function() {
                    var $scroll = $self.parents('.ps-container');
                    if ($self.position().top + $self.outerHeight() > $scroll.height()) {
                        $scroll.scrollTop($scroll.scrollTop() + $self.position().top + $self.outerHeight() - $scroll.height());
                    }
                    $self[0].scrollIntoView();
                    if (!isIEMobile() && !isAndroidWebKit()) {
                        $scroll.perfectScrollbar('update');
                    }
                    $self.focus();
                }, 500);
            });
            /* end Bug 5278 */
        }
    });
});
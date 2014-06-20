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

(function($) {
    'use strict';

    $.fn.spinner = function() {
        this.each(function() {
            var $this = $(this),
                html = '<div class="ui-spinner">';
            html += '<div class="point1 point"></div>';
            html += '<div class="point2 point"></div>';
            html += '<div class="point3 point"></div>';
            html += '<div class="point4 point"></div>';
            html += '<div class="point5 point"></div>';
            html += '<div class="point6 point"></div>';
            html += '<div class="point7 point"></div>';
            html += '<div class="point8 point"></div>';
            html += '</div>';
            if(['absolute', 'relative'].indexOf($this.css('position')) == -1)
                $this.css('position', 'relative');
            $(this).append(html);
        });
    }
})($);
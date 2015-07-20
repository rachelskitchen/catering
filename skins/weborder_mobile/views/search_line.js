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

define(["search_line_view"], function(search_line_view) {
    'use strict';

    var SearchLineSpinnerView = App.Views.CoreSearchLineView.CoreSearchLineMainView.extend({
        name: 'search_line',
        mod: 'spinner',
        render: function() {
            App.Views.CoreSearchLineView.CoreSearchLineMainView.prototype.render.apply(this, arguments);
            this.$(".search-line-spinner").view_spinner({
                model: this.model.get('search'),
                show_event: "onSearchStart",
                hide_event: "onSearchComplete",
                cache_id: "search-spinner"
            });
        }
    });

    return new (require('factory'))(search_line_view.initViews.bind(search_line_view), function() {
        App.Views.SearchLineView.SearchLineSpinnerView = SearchLineSpinnerView;
    });
});
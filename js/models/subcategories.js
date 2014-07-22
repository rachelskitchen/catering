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

 define(['categories'], function() {
    'use strict';

    App.Models.ParentCategory = Backbone.Model.extend({
        defaults: {
            id: '',
            subs: null
        },
        initialize: function() {
            var subs = this.get('subs');
            this.set('subs', new App.Collections.Categories(subs));
        },
        addSub: function(data) {
            this.get('subs').add(data);
        },
        addAllSubs: function() {
            var name = this.get('id'),
                subs = this.get('subs'),
                self = this,
                allSubs;

            allSubs = new App.Models.Category({
                name: 'View All',
                parent_name: name,
                sort: -1,
                active: true,
                id: name,
                ids: subs.pluck('id')
            });
            this.addSub(allSubs);

            // need deactivate allSubs if any active subcategory is not present
            allSubs.listenTo(subs, 'change:active', deactivateAllSubs);
            deactivateAllSubs();

            function deactivateAllSubs() {
                subs.where({active: true}).length == 0 && allSubs.set('active', false);
            }
        }
    });

    App.Collections.SubCategories = Backbone.Collection.extend({
        model: App.Models.ParentCategory,
        getSubs: function(id) {
            var parent = this.get(id);
            if(parent)
                return parent.get('subs').where({active: true});
            else
                return [];
        }
    });
 });
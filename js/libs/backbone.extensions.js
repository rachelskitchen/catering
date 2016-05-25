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

/**
 * Contains {@link Backbone.RadioCollection} constructors.
 * @module backbone_extensions
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents 'radio' collection.
     * @alias Backbone.RadioCollection
     * @augments Backbone.Collection
     * @example
     * // create a radio collection
     * require(['categories'], function() {
     *     var radio = new Backbone.RadioCollection([{selected: false}, {selected: true}]);
     * });
     */
    Backbone.RadioCollection = Backbone.Collection.extend(
    /**
     * @lends Backbone.Collection.prototype
     */
    {
        /**
         * Attribute name which specifies radio behavior for items.
         * @type {string}
         * @default 'selected'
         */
        criteriaAttr: 'selected',
        /**
         * Adds listener for 'change:<criteriaAttr>' event to handle items changes.
         */
        initialize: function() {
            this.listenTo(this, 'change:' + this.criteriaAttr, this.radioControl);
            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },
        /**
         * Finds all items whose {@link Backbone.RadioCollection#criteriaAttr criteriaAttr} value is `true` and changes value on `false`.
         * Ignores item if it's `model` param.
         *
         * @param {Backbone.Model} model - model triggered an `change` event
         * @param {boolean} value - new value of attribute specified in {@link Backbone.RadioCollection#criteriaAttr criteriaAttr}
         */
        radioControl: function(model, value) {
            if (value) {
                var criteria = {},
                    self = this;
                criteria[this.criteriaAttr] = true;
                this.where(criteria).forEach(function(item) {
                    item.set(self.criteriaAttr, model === item);
                });
            }
        }
    });
});
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

define(['backbone'], function() {
    'use strict';

   App.Models.FilterItem = Backbone.Model.extend({
        /**
         * @param {Object[]} attribues - Object with attributes.
         * @param {boolean} attribues[].selected - The state of filter.
         * @param {*} attributes[].value - The value of state.
         * @param {string} attributes.title - The title of filter.
         * @param {*} attributs.uid - The unique filter id that uses for saving data in LocalStorage.
         */
        defaults: {
            selected: false,
            value: null,
            title: '',
            uid: null
        },
        initialize: function() {
            this.loadData();
            this.listenTo(this, 'change:selected', this.saveData, this);
            Backbone.Model.prototype.initialize.apply(this, arguments);
        },
        saveData: function() {
            var prefix = App.Data.is_stanford_mode ? "stanford." : "";
            setData('filter.' + prefix + this.get('uid'), this, true);
        },
        loadData: function() {
            var prefix = App.Data.is_stanford_mode ? "stanford." : "";
            var data = getData('filter.' + prefix + this.get('uid'), true);
            if(data instanceof Object) {
                this.set(data);
            }
        }
    });

    App.Collections.FilterItems = Backbone.Collection.extend({
        model: App.Models.FilterItem,
        /**
         * @param {array} items - The array of objects each of them is attributes of filter item
         */
        setItems: function(items) {
            if(!Array.isArray(items)) {
                return;
            }
            items.forEach(function(item, index) {
                var model = this.at(index);
                if(model) {
                    model.set(item);
                } else {
                    this.add(item);
                }
            }, this);
        }
    });

    /**
     *  @class App.Models.Filter
     */
    App.Models.Filter = Backbone.Model.extend({
        /**
         * @param {string} title - Filter's title.
         * @param {App.Models.FilterItems} filterItems - Array of filter items. May be set as array.
         * @callback compare
         * @param {Backbone.Model} item - item that should be compared with selected filter item value
         * @param {App.Models.FilterItem} filter - selected filter item
         */
        defaults: {
            title: '',
            filterItems: null,  // collection of filters models
            compare: null,      // should be function that accepts `item`, `filter` params
            radio: false
        },
        initialize: function() {
            var filterItems = this.get('filterItems'),
                filterItemsCollection = filterItems instanceof App.Collections.FilterItems ? filterItems : new App.Collections.FilterItems();

            Array.isArray(filterItems) && filterItemsCollection.setItems(filterItems);
            this.set('filterItems', filterItemsCollection);
            this.listenTo(filterItemsCollection, 'change:selected', this.onChanged, this);

            return Backbone.Model.prototype.initialize.apply(this, arguments);
        },
        /**
         * Trigger 'change:selected' event when any filter item is selected/unselected
         */
        onChanged: function(model, value) {
            this.trigger('change:selected', this, value);
        },
        /**
         * `items` should be array of models
         */
        applyFilter: function(items) {
            var errorResult = null,
                selected = this.getSelected(),
                compare = this.get('compare'),
                result;

            result = {
                valid: [],
                invalid: []
            };

            if(!Array.isArray(items)) {
                console.log('Unable apply filter "%s": `items` arguments is not array');
                return errorResult;
            }

            if(typeof compare != 'function') {
                return errorResult;
            }

            if(selected.length == 0) {
                result.invalid = items;
                items.forEach(function(item) {
                    item.set('filterResult', false);
                });
                return result;
            }

            items.forEach(function(item) {
                if(!(item instanceof Backbone.Model)) {
                    return console.error('Item', item, 'is not Backbone model');
                }
                var valid = selected.some(function(filter) {
                    return compare(item, filter);
                });
                if(valid) {
                    result.valid.push(item);
                    item.set('filterResult', true);
                } else {
                    result.invalid.push(item);
                    item.set('filterResult', false);
                }
            });

            return result;
        },
        /**
         * Set attributes values from simple object (including nested filter items)
         */
        setData: function(data) {
            if(!(data instanceof Object)) {
                return;
            }
            for(var i in data) {
                if(i == 'filterItems') {
                    this.get('filterItems').setItems(data[i]);
                } else {
                    this.set(i, data[i]);
                }
            }
        },
        /**
         * Get attributes values as simple object (including nested filter items)
         */
        getData: function() {
            var data = this.toJSON();
            data.filterItems = this.get('filterItems').toJSON();
            return data;
        },
        /**
         * Return array of selected filter items
         */
        getSelected: function() {
            return this.get('filterItems').where({selected: true});
        }
    });

    App.Collections.Filters = Backbone.Collection.extend({
        model: App.Models.Filter,
        valid: [],
        invalid: [],
        initialize: function() {
            this.listenTo(this, 'change:selected', this.listenToChanges, this);
            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },
        listenToChanges: function(model, value) {
            // if `selected` changed on `true` need check invalid items because a new valid condition is added that affects only invalid items
            // if `selected` changed on `false` need check valid items because one valid condition is removed that affects only valid items
            if(value === true) {
                this.applyFilters('invalid');
            } else if(value === false) {
                this.applyFilters('valid', model.get('radio'));
            }
        },
        /**
         * Apply each filter.
         * Original models order may be changed after any filter passing.
         * Emit 'onFiltered' event after completion with `valid`, `invalid` arguments.
         */
        applyFilters: function(src, silent) {
            src = src || 'invalid';

            var antiSrc = src == 'valid' ? 'invalid' : 'valid',
                filters = this.models,
                valid = this.valid,
                invalid = this.invalid,
                result = {
                    valid: (src == 'valid' ? valid : invalid),
                    invalid: []
                };

            if(!this.length) {
                return;
            }

            for(var ind = 0, length = filters.length; ind < length; ind++) {
                if(!filters[ind].getSelected().length) {
                    result.valid = [];
                    result.invalid = valid.concat(invalid);
                    result.invalid.forEach(function(item) {
                        item.set('filterResult', false);
                    });
                    break;
                }
                applyFilter(filters[ind], result.valid);
            }

            function applyFilter(filter, data) {
                var iterResult = filter.applyFilter(data);
                if(iterResult) {
                    result.invalid.push.apply(result.invalid, iterResult.invalid);
                    result.valid = iterResult.valid;
                }
            }

            this[antiSrc].push.apply(this[antiSrc], result[antiSrc]);
            this[src] = result[src];

            !silent && this.trigger('onFiltered', this.valid, this.invalid);
        },
        setData: function(data) {
            if(!Array.isArray(data)) {
                return;
            }
            data.forEach(function(item, index) {
                var model = this.at(index);
                if(model) {
                    model.setData(item);
                } else {
                    this.add(item);
                }
            }, this);
        },
        getData: function() {
            return this.map(function(filter) {
                return filter.getData();
            });
        }
    });
});
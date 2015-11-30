define(['filters'], function() {
    'use strict';

    var filter1, filter2, filter3, filter4, filters, loadData, loadDataResult;

    loadData = App.Models.FilterItem.prototype.loadData;
    loadDataResult = function() {return;};

    beforeEach(function() {
        // avoid applying of App.Models.FilterItem.prototype.loadData() and changing attributes
        spyOn(App.Models.FilterItem.prototype, 'loadData').and.callFake(function() {
            return loadDataResult();
        });

        // without items
        filter1 = new App.Models.Filter({
            compare: function(item, filter) {
                return true;
            }
        });

        // with items and comparing with a price
        filter2 = new App.Models.Filter({
            filterItems: [{
                value: 1,
                selected: true
            }, {
                value: 3,
                selected: false
            }],
            compare: function(item, filter) {
                return item.get('price') === filter.get('value');
            }
        });

        // with items and comparing with a cost
        filter3 = new App.Models.Filter({
            filterItems: [{
                value: 2,
                selected: true
            }, {
                value: 4,
                selected: false
            }],
            compare: function(item, filter) {
                return item.get('cost') === filter.get('value');
            }
        });

        // with items and 'radio' type
        filter4 = new App.Models.Filter({
            filterItems: [{
                value: 1,
                selected: true
            }, {
                value: 2,
                selected: false
            }],
            radio: true,
            compare: function(item, filter) {
                return true;
            }
        });

        filters = new App.Collections.Filters([filter1, filter2, filter3]);
    });

    describe('App.Models.FilterItem', function() {
        var data = {selected: true, value: 1, title: 'test', uid: 'test'},
            filterItem = new App.Models.FilterItem(data);

        it('Environment', function() {
            expect(App.Models.FilterItem).toBeDefined();
        });

        it('initialize()', function() {
            spyOn(filterItem, 'listenTo');
            filterItem.initialize();

            expect(filterItem.loadData).toHaveBeenCalled();
            expect(filterItem.listenTo).toHaveBeenCalledWith(filterItem, 'change:selected', filterItem.saveData, filterItem);
        });

        it('saveData()', function() {
            spyOn(window, 'setData');
            filterItem.set('selected', false);

            expect(window.setData).toHaveBeenCalledWith('filter.test', filterItem, true);
            filterItem.set('selected', true);
        });

        it('loadData(): data exists in storage, data doesn\'t exist in storage', function() {
            var data = {selected: false},
                loadDataResultOld = loadDataResult;

            loadDataResult = loadData.bind(filterItem);

            spyOn(window, 'getData').and.callFake(function() {return data;});
            filterItem.loadData();

            // window.getData()
            expect(window.getData).toHaveBeenCalledWith('filter.test', true);

            // data exists in storage
            expect(filterItem.get('selected')).toBe(false);

            filterItem.set('selected', true);
            data = undefined;
            filterItem.loadData();

            // data doesn't exist in storage
            expect(filterItem.get('selected')).toBe(true);

            loadDataResult = loadDataResultOld;
        });
    });

    describe('App.Collections.FilterItems', function() {
        it('Environment', function() {
            expect(App.Collections.FilterItems).toBeDefined();
        });

        it('Items are instances of App.Models.FilterItem', function() {
            expect(App.Collections.FilterItems.prototype.model).toBe(App.Models.FilterItem);
        });

        it('setItems(): `items` param isn\'t array, is array', function() {
            var items = [{title: 'item1', value: 1}, {title: 'item2', value: 2}],
                filterItems = new App.Collections.FilterItems({title: 'first', value: 3});

            // `items` param is array
            filterItems.setItems(items);

            expect(filterItems.length).toBe(2);
            expect(filterItems.at(0).get('title')).toBe(items[0].title);
            expect(filterItems.at(0).get('value')).toBe(items[0].value);
            expect(filterItems.at(1).get('title')).toBe(items[1].title);
            expect(filterItems.at(1).get('value')).toBe(items[1].value);

            // `items` param isn't array
            spyOn(App.Models.FilterItem.prototype, 'set');
            spyOn(filterItems, 'add');

            filterItems.setItems();

            expect(App.Models.FilterItem.prototype.set).not.toHaveBeenCalled();
            expect(filterItems.add).not.toHaveBeenCalled();
        });
    });

    describe('App.Models.Filter', function() {
        it('Environment', function() {
            expect(App.Models.Filter).toBeDefined();
        });

        it('initialize() call: `filterItems` is always App.Collections.FilterItems collection, model listens to `change:selected` event of `filterItems`', function() {
            var filterItems1 = filter1.get('filterItems'),
                filterItems2 = filter2.get('filterItems'),
                filter = new App.Models.Filter({filterItems: new App.Collections.FilterItems([{title: 1}, {title: 2}])});

            expect(filterItems1 instanceof App.Collections.FilterItems).toBe(true);
            expect(filterItems2 instanceof App.Collections.FilterItems).toBe(true);
            expect(filterItems1.length).toBe(0);
            expect(filterItems2.length).toBe(2);
            expect(filter instanceof App.Models.Filter).toBe(true);
            expect(filter.get('filterItems') instanceof App.Collections.FilterItems).toBe(true);
            expect(filter.get('filterItems').length).toBe(2);
        });

        it('onChanged()', function() {
            var filterItem = filter2.get('filterItems').at(0),
                newValue = !filterItem.get('selected');

            spyOn(filter2, 'trigger');
            filterItem.set('selected', newValue);

            expect(filter2.trigger).toHaveBeenCalledWith('change:selected', filter2, newValue);

            filterItem.set('selected', !newValue);
        });

        describe('uncheck()', function() {
            it ('`value` is true and filter type is `radio`', function() {
                var filterItem1 = filter4.get('filterItems').at(0),
                    filterItem2 = filter4.get('filterItems').at(1),
                    newValue = !filterItem2.get('selected');
                filterItem2.set('selected', newValue);

                expect(filterItem1.get('selected')).toBe(false);
                expect(filterItem2.get('selected')).toBe(true);

                filterItem2.set('selected', !newValue);
            });

            it('`value` is true and filter type is not `radio`', function() {
                var filterItem1 = filter2.get('filterItems').at(0),
                    filterItem2 = filter2.get('filterItems').at(1),
                    newValue = !filterItem2.get('selected');
                filterItem2.set('selected', newValue);

                expect(filterItem1.get('selected')).toBe(true);
                expect(filterItem2.get('selected')).toBe(true);

                filterItem2.set('selected', !newValue);
            });

            it ('`value` is false', function() {
                var filterItem1 = filter4.get('filterItems').at(0),
                    filterItem2 = filter4.get('filterItems').at(1),
                    newValue = !filterItem1.get('selected');
                filterItem1.set('selected', newValue);

                expect(filterItem1.get('selected')).toBe(false);
                expect(filterItem2.get('selected')).toBe(false);

                filterItem1.set('selected', !newValue);
            });
        });

        describe('applyFilter()', function() {
            var emptyResult = null,
                item1 = new Backbone.Model({price: 2}),
                item2 = new Backbone.Model({price: 1}),
                item3 = new Backbone.Model({price: 3}),
                items = [item1, item2, item3],
                oldCompare1, oldCompare2;

            beforeEach(function() {
                oldCompare1 = filter1.get('compare');
                oldCompare2 = filter2.get('compare');
            });

            afterEach(function() {
                filter1.set({compare: oldCompare1});
                filter2.set({compare: oldCompare2});
                item1.unset('filterResult');
                item2.unset('filterResult');
                item3.unset('filterResult');
            });

            it('`compare` is undefined', function() {
                filter1.set({compare: null});
                expect(filter1.applyFilter([])).toEqual(emptyResult);
            });

            it('`items` argument isn\'t passed', function() {
                expect(filter2.applyFilter()).toBe(emptyResult);
            });

            it('`items` argument is empty array', function() {
                expect(filter2.applyFilter([])).toEqual({
                    valid: [],
                    invalid: []
                });
            });

            it('`items` list are not Backbone models', function() {
                expect(filter2.applyFilter([{}, {}, {}])).toEqual({
                    valid: [],
                    invalid: []
                });
            });

            it('no selected filter items', function() {
                // check when filter doesn't have selected items or items at all
                expect(filter1.applyFilter(items)).toEqual({
                    valid: [],
                    invalid: items
                });
                expect(items[0].get('filterResult')).toBe(false);
                expect(items[1].get('filterResult')).toBe(false);
                expect(items[2].get('filterResult')).toBe(false);
            });

            it('`items` argument is passed', function() {
                // check existing property
                expect(filter2.applyFilter(items)).toEqual({
                    valid: [item2],
                    invalid: [item1, item3]
                });
                expect(item1.get('filterResult')).toBe(false);
                expect(item2.get('filterResult')).toBe(true);
                expect(item3.get('filterResult')).toBe(false);
            });
        });

        it('setData(): `data` param isn\'t object, is object', function() {
            var filter = new App.Models.Filter(),
                filterItems = filter.get('filterItems'),
                data = {title: 'test', filterItems: []};

            spyOn(filter, 'set');
            spyOn(filterItems, 'setItems');

            // `data` isn't object
            filter.setData();

            expect(filter.set).not.toHaveBeenCalled();
            expect(filterItems.setItems).not.toHaveBeenCalled();

            // `data` param is object
            filter.setData(data);

            expect(filter.set).toHaveBeenCalledWith('title', 'test');
            expect(filterItems.setItems).toHaveBeenCalledWith(data.filterItems);
        });

        it('getData()', function() {
            var result = filter3.toJSON();
            result.filterItems = result.filterItems.toJSON();
            expect(filter3.getData()).toEqual(result);
        });

        it('getSelected()', function() {
            var item1 = new App.Models.FilterItem({selected: false}),
                item2 = new App.Models.FilterItem({selected: true}),
                item3 = new App.Models.FilterItem({selected: false}),
                filter = new App.Models.Filter({filterItems: [item1, item2, item3]});

            expect(filter.getSelected()).toEqual([item2]);
            item2.set('selected', false);
            expect(filter.getSelected()).toEqual([]);
        });
    });

    describe('App.Collections.Filters', function() {
        it('Environment', function() {
            expect(App.Collections.Filters).toBeDefined();
        });

        it('Items are instances of App.Models.Filter', function() {
            expect(App.Collections.Filters.prototype.model).toBe(App.Models.Filter);
        });

        it('initialize()', function() {
            var filters = new App.Collections.Filters();

            spyOn(filters, 'listenTo');
            filters.initialize();

            expect(filters.listenTo).toHaveBeenCalledWith(filters, 'change:selected', filters.listenToChanges, filters);
        });

        describe('listenToChanges()', function() {
            var filters = new App.Collections.Filters([{filterItems: [{selected: true}]}]),
                filterItem = filters.at(0).get('filterItems').at(0);

            beforeEach(function() {
                spyOn(filters, 'applyFilters');
            });

            it('changed on `true`', function() {
                filterItem.set('selected', false);
                expect(filters.applyFilters).toHaveBeenCalledWith('valid', false);
            });

            it('changed on `false`', function() {
                filterItem.set('selected', true);
                expect(filters.applyFilters).toHaveBeenCalledWith('invalid');
            });

            it('no parameters', function() {
                filterItem.set('selected', false);
                expect(filters.applyFilters).toHaveBeenCalledWith('valid', false);
            });
        });

        describe('applyFilters()', function() {
            var oldValid, oldInvalid, oldCompare2, oldCompare3;

            beforeEach(function() {
                oldValid = filters.valid;
                oldInvalid = filters.invalid;
                oldCompare2 = filter2.get('compare');
                oldCompare3 = filter3.get('compare');
            });

            afterEach(function() {
                filters.valid = oldValid;
                filters.invalid = oldInvalid;
                filter2.set('compare', oldCompare2);
                filter3.set('compare', oldCompare3);
            });

            it('filters length is 0', function() {
                var filters = new App.Collections.Filters();
                filters.applyFilters();
                expect(filters.valid).toEqual([]);
                expect(filters.invalid).toEqual([]);
            });

            it('filters length > 0, unselect/select a filter item', function() {
                var item1 = new Backbone.Model({price: 2, cost: 1}),
                    item2 = new Backbone.Model({price: 1, cost: 3}),
                    item3 = new Backbone.Model({price: 2, cost: 2}),
                    item4 = new Backbone.Model({price: 1, cost: 2}), //true
                    items = [item1, item2, item3, item4],
                    filters = new App.Collections.Filters([filter2, filter3]);

                filters.invalid = items;
                filters.applyFilters(); // result filters.valid == [item4], filters.invalid == [item1, item2, item3]
console.log('valid', filters.valid, 'invalid', filters.invalid)
                expect(filters.valid).toEqual([item4]);
                expect(filters.invalid.indexOf(item1)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item2)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item3)).toBeGreaterThan(-1);
                expect(item4.get('filterResult')).toBe(true);
                expect(item1.get('filterResult')).toBe(false);
                expect(item2.get('filterResult')).toBe(false);
                expect(item3.get('filterResult')).toBe(false);

                // reset one filter
                var selected = filter2.get('filterItems').where({selected: true})[0];
                selected.set('selected', false); // result filters.valid == [], filters.invalid == [item1, item2, item3, item4]

                expect(filters.invalid.indexOf(item1)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item2)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item3)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item4)).toBeGreaterThan(-1);
                expect(filters.valid.length).toBe(0);
                expect(item1.get('filterResult')).toBe(false);
                expect(item2.get('filterResult')).toBe(false);
                expect(item3.get('filterResult')).toBe(false);
                expect(item4.get('filterResult')).toBe(false);

                // apply one filter
                selected.set('selected', true); // result filters.valid == [item4], filters.invalid == [item1, item2, item3]

                expect(filters.invalid.indexOf(item1)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item2)).toBeGreaterThan(-1);
                expect(filters.invalid.indexOf(item3)).toBeGreaterThan(-1);
                expect(filters.valid.indexOf(item4)).toBeGreaterThan(-1);
                expect(item1.get('filterResult')).toBe(false);
                expect(item2.get('filterResult')).toBe(false);
                expect(item3.get('filterResult')).toBe(false);
                expect(item4.get('filterResult')).toBe(true);

                // 'onFiltered' event
                spyOn(filters, 'trigger');
                filters.applyFilters();
                expect(filters.trigger).toHaveBeenCalledWith('onFiltered', filters.valid, filters.invalid);
            });
        });

        it('setData(): `data` param isn\'t array, is array', function() {
            var data = [{title: 'item1'}, {title: 'item2'}],
                filters = new App.Collections.Filters({title: 'test'});

            spyOn(App.Models.Filter.prototype, 'setData');
            spyOn(filters, 'add');

            // `data` param isn't array
            filters.setData();

            expect(filters.add).not.toHaveBeenCalled();
            expect(App.Models.Filter.prototype.setData).not.toHaveBeenCalled();

            // `data` param is array
            filters.setData(data);

            expect(filters.add).toHaveBeenCalledWith(data[1]);
            expect(App.Models.Filter.prototype.setData).toHaveBeenCalledWith(data[0]);
        });

        it('getData()', function() {
            expect(filters.getData()).toEqual([filter1.getData(), filter2.getData(), filter3.getData()]);
        });
    });
});
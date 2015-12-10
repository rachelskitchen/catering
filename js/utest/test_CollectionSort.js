define(['collection_sort'], function() {
    'use strict';

    var model, a, b, result,
        defaults = {
            name: null,
            sort_val: null
        },
        prot = Backbone.Model.extend({
            defaults: defaults
        }),
        Model = App.Collections.CollectionSort.extend({
            model: prot
        });

    beforeEach(function() {
        a = new Backbone.Model();
        b = new Backbone.Model();
        model = new Model([a, b]);
        model.sortKey = 'sort_val';
    });

    describe('App.Collections.CollectionSort', function() {
        describe('strategies', function() {
            it('sortStrings()', function() {
                a.set({sort_val: 'string a'});
                b.set({sort_val: 'string b'});

                spyOn(model.strategies, 'sort');
                model.strategies.sortStrings.call(model, a, b);
                expect(model.strategies.sort).toHaveBeenCalledWith('string a', 'string b');
            });

            describe('sortNumbers()', function() {
                it('not equal attributes', function() {
                    a.set({sort_val: 12});
                    b.set({sort_val: '34'});
                    model.sortStrategy = 'sortNumbers';

                    spyOn(model.strategies, 'sort');
                    model.strategies.sortNumbers.call(model, a, b);
                    expect(model.strategies.sort).toHaveBeenCalledWith(12, 34);

                    a.set('sort_val', NaN);
                    model.strategies.sortNumbers.call(model, a, b);
                    expect(model.strategies.sort).toHaveBeenCalledWith(null, 34);
                });

                it('equal attributes', function() {
                    a.set({name: 'less', sort_val: 1});
                    b.set({name: 'more', sort_val: 1});
                    model.sortStrategy = 'sortNumbers';

                    spyOn(model.strategies, 'sort');
                    result = function() {
                        return model.strategies.sortNumbers.call(model, a, b);
                    };
                    expect(model.strategies.sort).not.toHaveBeenCalledWith();

                    expect(result()).toBe(-1); // a < b

                    a.set('name', 'more');
                    b.set('name', 'less');
                    expect(result()).toBe(1); // a > b

                    a.set('name', 'equal');
                    b.set('name', 'equal');
                    expect(result()).toBe(0); // a == b

                    a.set('sort_val', NaN);
                    b.set('sort_val', NaN);
                    expect(result()).toBe(0); // a == b
                });
            });

            it('sort()', function() {
                model.sortOrder = 'asc';
                result = function(a, b) {
                    return model.strategies.sort.call(model, a, b);
                };

                expect(result(null, null)).toBe(0);
                expect(result(null, 1)).toBe(1);
                expect(result(1, null)).toBe(-1);
                expect(result(1, 2)).toBe(-1);
                expect(result(2, 1)).toBe(1);
            });
        });

        it('sortEx()', function() {
            spyOn(model.models, 'sort').and.callThrough();
            spyOn(model.strategies, 'sortStrings');

            a.set({sort_val: '12'});
            b.set({sort_val: '34'});
            model.defaults = {
                sortKey: 'sort_val'
            };
            model.sortEx('sortStrings', 'sort_val');

            expect(model.strategies.sortStrings).toHaveBeenCalled();
            expect(model.models.sort).toHaveBeenCalled();
        });
    });
});
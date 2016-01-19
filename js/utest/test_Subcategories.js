define(['subcategories'], function() {
    'use strict';

    describe('App.Models.ParentCategory', function() {
        var model, def_initialized,
            locale = App.Data.locale.toJSON(),
            spyGetData,
            locale = App.Data.locale.toJSON();

        beforeEach(function() {
            model = new App.Models.ParentCategory();
            def_initialized = {
                name: '',
                sort: null,
                ids: '',
                subs: new App.Collections.Categories([])
            };
        });

        it('Environment', function() {
            expect(App.Models.ParentCategory).toBeDefined();
        });

        describe('initialize()', function() {
            it('`subs` is not set', function() {
                expect(model.toJSON()).toEqual(def_initialized);
            });

            it('`subs` is instance of App.Collections.Categories', function() {
                var subs = new App.Collections.Categories([{id: 'sub1'}, {id: 'sub2'}]),
                    result = deepClone(def_initialized);

                result.subs = subs;
                model.set('subs', subs);
                model.initialize();
                expectations();
            });

            it('`subs` is array', function() {
                var subs = [{id: 'sub1'}, {id: 'sub2'}],
                    result = deepClone(def_initialized);

                result.subs = subs;
                model.set('subs', subs);
                model.initialize();
                expectations();
            });

            it('`subs` is not array', function() {
                var subs = 'not collection, not array',
                    result = deepClone(def_initialized);

                result.subs = subs;
                model.set('subs', subs);
                model.initialize();
                expect(model.toJSON()).toEqual(def_initialized);
            });

            function expectations() {
                expect(model.toJSON().subs.models[0].id).toBe('sub1');
                expect(model.toJSON().subs.models[1].id).toBe('sub2');
            }
        });

        it('addSub()', function() {
            var subs = new Backbone.Collection();
            spyOn(model, 'addProducts');
            spyOn(subs, 'add');
            model.set('subs', subs, {silent: true});
            model.addSub('data');

            expect(model.addProducts).toHaveBeenCalledWith('data');
            expect(subs.add).toHaveBeenCalledWith('data');
        });

        it('addAllSubs()', function() {
            var spyAddSub = spyOn(model, 'addSub'),
                subs = new App.Collections.Categories([{id: 'sub1'}, {id: 'sub2'}]);
            model.set({
                id: 'some id',
                subs: subs
            })
            model.addAllSubs();

            var allSubs = spyAddSub.calls.mostRecent().args[0],
                result = Backbone.$.extend(new App.Models.Category().toJSON(), {
                    id: 'some id',
                    name: locale.SUBCATEGORIES_VIEW_ALL,
                    parent_name: 'some id',
                    sort: -1,
                    active: true,
                    ids: ['sub1', 'sub2']
                })
            expect(allSubs instanceof App.Models.Category);
            expect(allSubs.toJSON()).toEqual(result);
        });

        describe('addProducts()', function() {
            it('`subs` is model', function() {
                var subs = new Backbone.Model();
                model.addProducts(subs);
                expect(subs.get('products') instanceof App.Collections.Products).toBe(true);
            });

            it('`subs` is object', function() {
                var subs = {};
                model.addProducts(subs);
                expect(subs.products instanceof App.Collections.Products).toBe(true);
            });

            it('`subs` is array of objects', function() {
                var subs = [{}, {}];
                model.addProducts(subs);
                expect(subs[0].products instanceof App.Collections.Products).toBe(true);
                expect(subs[1].products instanceof App.Collections.Products).toBe(true);
            });

            it('`subs` is array of models', function() {
                var subs = [new Backbone.Model(), new Backbone.Model()];
                model.addProducts(subs);
                expect(subs[0].get('products') instanceof App.Collections.Products).toBe(true);
                expect(subs[1].get('products') instanceof App.Collections.Products).toBe(true);
            });
        });

    });

    describe('App.Collections.SubCategories', function() {
        var model;

        beforeEach(function() {
            model = new App.Collections.SubCategories();
        });

        it('Environment', function() {
            expect(App.Collections.SubCategories).toBeDefined();
        });

        it('Default values', function() {
            expect(model.comparator).toBe('sort');
        });

        describe('getSubs()', function() {
            it('category with given id does not exist', function() {
                expect(model.getSubs('not existing id')).toEqual([]);
            });

            it('category with given id exists', function() {
                var model1 = new Backbone.Model({id: 'model1', active: false}),
                    model2 = new Backbone.Model({id: 'model2', active: true});
                model.add(new Backbone.Model({
                    id: 'some id',
                    subs: new Backbone.Collection([model1, model2])
                }));
                expect(model.getSubs('some id')).toEqual([model2]);
            });
        });

    });
});
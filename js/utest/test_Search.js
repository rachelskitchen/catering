define(['js/models/search'], function() {
    'use strict';

    describe('App.Models.Search', function() {
        var model, def;

        beforeEach(function() {
            model = new App.Models.Search();
        });

        it('Environment', function() {
            expect(App.Models.Search).toBeDefined();
            expect(App.Models.Search).toBe(App.Models.ProductsBunch);
        });
    });

    describe('App.Collections.Search', function() {
        var model;

        beforeEach(function() {
            model = new App.Collections.Search();
        });

        it('Environment', function() {
            expect(App.Collections.Search).toBeDefined();
        });

        it('initialize()', function() {
            spyOn(App.Collections.Search.prototype, 'setLastPattern');
            model = new App.Collections.Search();
            model.trigger('onSearchComplete');
            expect(model.setLastPattern).toHaveBeenCalled();
        });

        it('setLastPattern()', function() {
            model.setLastPattern('wrong param');
            expect(model.lastPattern).toBeUndefined();

            var result = new App.Models.Search({pattern: 'last pattern'});
            model.setLastPattern(result);
            expect(model.lastPattern).toBe('last pattern');
        });

        it('clearLastPattern()', function() {
            model.lastPattern = 'some pattern';
            model.clearLastPattern();
            expect(model.lastPattern).toBe('');
        });

        describe('search()', function() {
            var pattern = 'some pattern',
                dfd;

            beforeEach(function() {
                spyOn(model, 'trigger');

                dfd = new Backbone.$.Deferred();
                spyOn(App.Models.Search.prototype, 'get_products').and.callFake(function() {
                    return dfd;
                });
            });

            it('pattern found in cache, search is not completed', function() {
                model.add(new Backbone.Model({pattern: pattern}));
                expect(model.search(pattern)).toEqual(model);
            });

            it('completed search found in cache', function() {
                var cacheModel = new Backbone.Model({pattern: pattern, completed: true});
                model.add(cacheModel);
                model.search(pattern);
                expect(model.trigger).toHaveBeenCalledWith('onSearchStart');
                expect(model.trigger).toHaveBeenCalledWith('onSearchComplete', cacheModel);
            });

            it('completed search not found in cache', function() {
                var cacheModel = new Backbone.Model({pattern: 'another pattern', completed: true});
                model.add(cacheModel);
                model.search(pattern);
                dfd.resolve();
                expect(model.trigger).toHaveBeenCalledWith('onSearchStart');
                expect(model.models[1].get('completed')).toBe(true);
                expect(model.status).toBe('searchComplete');
                expect(model.trigger.calls.mostRecent().args[0]).toBe('onSearchComplete');
            });
        });

    });

    describe('App.Models.SearchLine', function() {
        var model, def;

        beforeEach(function() {
            model = new App.Models.SearchLine();

            def = {
                searchString: '',
                dummyString: '',
                collapsed : true,
                search: null
            };
        });

        it('Environment', function() {
            expect(App.Models.SearchLine).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        describe('updateSearch()', function() {
            var searchModel;

            beforeEach(function() {
                searchModel = new App.Collections.Search();
                model.set('search', searchModel);
                spyOn(searchModel, 'search');
            });

            it('`searchString` is empty', function() {
                model.updateSearch();
                expect(searchModel.search).not.toHaveBeenCalledWith();
            });

            it('`searchString is set', function() {
                model.set('searchString', 'search string');
                model.updateSearch();
                expect(searchModel.search).toHaveBeenCalledWith('search string');
            });
        });

        it('empty_search_line()', function() {
            model.set({
                dummyString: 'string',
                searchString: 'string',
                search: new App.Collections.Search()
            }, {silent: true});

            model.empty_search_line();

            expect(model.get('dummyString')).toBe('');
            expect(model.get('searchString')).toBe('');
        });

        describe('getSearchModel()', function() {
            var searchCol, searchModel, pattern = 'p';

            beforeEach(function() {
                searchCol = new App.Collections.Search();
                searchModel = new App.Models.Search({pattern: pattern});
                searchCol.add( searchModel );
                model.set({
                    search: searchCol,
                    searchString: 'some string'
                }, {silent: true});
            });

            it('pattern doesn not exist', function() {
                var search = model.getSearchModel();
                expect(search).toBe(undefined);
            });

            it('pattern exists', function() {
                model.set({
                    searchString: pattern
                }, {silent: true});
                 var search = model.getSearchModel();
                expect(search instanceof App.Models.Search).toBe(true);
            });
        });
    });

});
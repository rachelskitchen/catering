define(['establishments'], function() {
    'use strict';

    describe('App.Models.Establishment', function() {
        it('Environment', function() {
            expect(App.Models.Establishment).toBeDefined();
        });
    });

    describe('App.Collections.Establishments', function() {
        var model, def,
            locale = App.Data.locale.toJSON(),
            spyGetData;

        beforeEach(function() {
            model = new App.Collections.Establishments();

            spyOn(window, 'setData');
            spyGetData = spyOn(window, 'getData');
        });

        it('Environment', function() {
            expect(App.Collections.Establishments).toBeDefined();
        });

        it('initialize()', function() {
            model.trigger('changeEstablishment', 123);
            expect(model._meta.establishment).toBe(123);
        });

        describe('meta()', function() {
            it('gets meta data', function() {
                model._meta.someProperty = 'some value';
                expect(model.meta('someProperty')).toBe('some value');
            });

            it('sets new value', function() {
                model.meta('someProperty', 'new value');
                expect(model._meta.someProperty).toBe('new value');
            });
        });

        describe('checkGETParameters()', function() {
            var spyLoadEst,
                spyParams;

            beforeEach(function() {
                spyOn(model, 'trigger');
                spyOn(model, 'meta');
                spyLoadEst = spyOn(model, 'loadEstablishment');
                spyParams = spyOn(window, 'parse_get_params').and.returnValue({});
                spyOn(model, 'getEstablishments').and.returnValue(Backbone.$.Deferred().resolve());
            });

            describe('there is a saved establishment', function() {
                it('changes establishment to saved establishment', function() {
                    spyLoadEst.and.returnValue('loaded est');

                    model.checkGETParameters();

                    expect(model.meta).toHaveBeenCalledWith('statusCode', 3);
                    expect(model.trigger).toHaveBeenCalledWith('changeEstablishment', 'loaded est');
                });
            });

            describe('there is no saved establishment', function() {
                it('changes establishment to specified establishment (`establishment` is set)', function() {
                    model.checkGETParameters(555);

                   expectStatusCode(3);
                   expect(model.trigger).toHaveBeenCalledWith('changeEstablishment', 555);
                });

                it('changes establishment to default value (`establishment` is not set, `brand` GET parameters does not exist', function() {
                    model.checkGETParameters();

                    expectStatusCode(3);
                    expect(model.trigger).toHaveBeenCalledWith('changeEstablishment', 1);
                });

                it('`brand` GET parameter has negative value', function() {
                    spyParams.and.returnValue({brand: -1});
                    model.checkGETParameters();
                    expectStatusCode(2); // error
                });

                describe('`brand` GET parameter has correct value', function() {
                    beforeEach(function() {
                        spyParams.and.returnValue({brand: 1});
                    });

                    it('brand has only 1 establishment', function() {
                        model.add({id: 111});
                        model.checkGETParameters();

                        expectMetaBrand();
                        expectStatusCode(3);
                        expect(model.trigger).toHaveBeenCalledWith('changeEstablishment', 111);
                    });

                    it('brand has more than 1 establishment', function() {
                        model.add([{id: 111}, {id: 222}]);
                        model.checkGETParameters();

                        expectMetaBrand();
                        expectStatusCode(1);
                        expect(model.trigger).toHaveBeenCalledWith('loadStoresList');
                    });

                    it('brand has no establishments', function() {
                        model.checkGETParameters();
                        expectMetaBrand();
                        expectStatusCode(2);
                        expect(model.trigger).toHaveBeenCalledWith('showError');
                    });

                    function expectMetaBrand() {
                        expect(model.meta).toHaveBeenCalledWith('brand', 1);;
                    }
                });
            });

            function expectStatusCode(code) {
                expect(model.meta).toHaveBeenCalledWith('statusCode', code);
            }

        });

        describe('getEstablishments()', function() {
            var ajaxSpy,
                ajaxOpts,
                result;

            beforeEach(function() {
                ajaxSpy = spyOn(Backbone.$, 'ajax');
            });

            it('success', function() {
                ajaxSpy.and.callFake(function(opts) {
                    ajaxOpts = opts;
                    opts.success([{
                        brand_name: 'brand name',
                        estabs: [
                            {
                                id: 1
                            },
                            {
                                id: 2
                            }
                        ]
                    }]);
                    opts.complete();
                });

                result = model.getEstablishments();
                expect(model._meta.brandName).toBe('brand name');
                expect(model.length).toBe(2);
                expect(result.state()).toBe('resolved');
            });

            it('`is_once` is true', function() {
                model.add({id: 1});

                result = model.getEstablishments(true);
                expect(result.state()).toBe('resolved');
                expect(ajaxSpy).not.toHaveBeenCalled();
            });
        });

        it('getBrandName()', function() {
            model._meta.brandName = 'some brand';
            expect(model.getBrandName()).toBe('some brand');
        });

        it('getModelForView()', function() {
            model._meta.modelForView = 'some model';
            expect(model.getModelForView()).toBe('some model');
        });

        it('getEstablishmentID()', function() {
            model._meta.establishment = 'some establishment';
            expect(model.getEstablishmentID()).toBe('some establishment');
        });

        it('setViewVersion()', function() {
            var modelForView = new Backbone.Model();
            spyOn(model, 'getModelForView').and.returnValue(modelForView);
            model.setViewVersion(true);
            expect(modelForView.get('isMobileVersion')).toBe(true);

            model.setViewVersion(false);
            expect(modelForView.get('isMobileVersion')).toBe(false);
        });

        it('needShowAlert()', function() {
            var modelForView = new Backbone.Model();
            spyOn(model, 'getModelForView').and.returnValue(modelForView);
            model.needShowAlert(true);
            expect(modelForView.get('needShowAlert')).toBe(true);

            model.needShowAlert(false);
            expect(modelForView.get('needShowAlert')).toBe(false);
        });

        it('saveEstablishment()', function() {
            model.saveEstablishment('establishment to save');
            expect(window.setData).toHaveBeenCalledWith('establishments', {establishment: 'establishment to save'});
        });

        it('loadEstablishment()', function() {
            spyGetData.and.returnValue({establishment: 'some establishment'});
            expect(model.loadEstablishment()).toBe('some establishment');
        });

        it('removeSavedEstablishment()', function() {
            spyOn(window, 'removeData');
            model.removeSavedEstablishment();
            expect(window.removeData).toHaveBeenCalledWith('establishments');
        });

        describe('checkGETParameters()', function() {

        });

    });
});
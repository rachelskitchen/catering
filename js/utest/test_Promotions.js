define(['js/utest/data/Promotions', 'promotions'], function(promotionsData) {
    'use strict';

    describe('App.Models.Promotion', function() {
        var model, def = promotionsData.promotion_defaults;

        beforeEach(function() {
            model = new App.Models.Promotion();
        });

        it('Environment', function() {
            expect(App.Models.Promotion).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

    });

    describe('App.Collections.Promotions', function() {
        var collection;

        beforeEach(function() {
            collection = new App.Collections.Promotions();
        });

        it('Environment', function() {
            expect(App.Collections.Promotions).toBeDefined();
        });

        it('Create collection', function() {
            collection = new App.Collections.Promotions({name: 'test', code: '123'});
            expect(collection.models[0] instanceof App.Models.Promotion).toBe(true);
        });

        describe('initialize()', function() {
            describe('`change:is_applied` event', function() {
                beforeEach(function() {
                    App.Models.Promotion.prototype.listenTo = jasmine.createSpy();
                    collection = new App.Collections.Promotions();
                });

                it('some promotion is applied, another promotion gets applied', function() {
                    collection.add(promotionsData.campaigns);
                    collection.models[0].set('is_applied', true, {silent: true});
                    collection.models[1].set('is_applied', true);
                    expect(collection.models[1].get('is_applied')).toBe(true);
                    expect(collection.models[0].get('is_applied')).toBe(false);
                });
            });
        });

        describe('addAjaxJson(promotions)', function() {
            it('`promotions` is not array', function() {
                var result = collection.addAjaxJson('not array');
                expect(collection.length).toBe(0);
                expect(result).toBeUndefined();
            });

            it('`promotions` is array of objects', function() {
                var data = deepClone(promotionsData.campaigns);
                collection.addAjaxJson(data);
                expect(collection.length).toBe(promotionsData.campaigns.length);

                var model0 = collection.models[0].toJSON(),
                    model1 = collection.models[1].toJSON();
                data[1].is_applicable = false;

                collection.addAjaxJson(data);
                // model0 was not changed
                expect(model0).toEqual(collection.models[0].toJSON());
                // model1.is_applicable was changed
                expect(collection.models[1].get('id')).toBe(model1.id);
                expect(collection.models[1].get('is_applicable')).toBe(false);
            });

            it('`promotions` is array of models', function() {
                var data = deepClone(promotionsData.campaigns),
                    arr = [];
                data = new App.Collections.Promotions(data);

                spyOn(data.models[0], 'toJSON').and.callThrough();
                collection.addAjaxJson(data.models);
                expect(data.models[0].toJSON).toHaveBeenCalled();

                expect(collection.length).toBe(data.length);
            });

            it('`promotions` is array of not objects', function() {
                var data = [1, 2, '3'];
                collection.addAjaxJson(data);
                expect(collection.length).toBe(0);
            });

            describe('getPromotions()', function() {
                var data, rewardsCard, number, jqXHR, url, type, dataType, est,
                    myorder, order, fetching;

                beforeEach(function() {
                    // URL for reward cards resource
                    url = '/weborders/campaigns/';
                    // type of request
                    type = 'POST';
                    // expected data type
                    dataType = 'json';
                    // jqXHR simulator
                    jqXHR = $.Deferred();
                    // establishment
                    est = 1;
                    // getPromotions() returns deferred object
                    fetching = $.Deferred();

                    data = deepClone(promotionsData.campaigns);

                    spyOn(Backbone.$, 'ajax').and.callFake(function(opts) {
                        jqXHR = _.extend(jqXHR, opts);
                        jqXHR.done(function() {
                            opts.success(data);
                        });
                        return jqXHR;
                    });

                    spyOn(App.Data.settings, 'get').and.returnValue(est);

                    myorder = App.Data.myorder;
                    order = {
                        item_submit: jasmine.createSpy().and.returnValue({product: 123})
                    };
                    App.Data.myorder = [order];

                    spyOn(App.Data.errors, 'alert');
                    spyOn(collection, 'addAjaxJson');
                    spyOn(collection, 'trigger');
                });

                afterEach(function() {
                    App.Data.myorder = myorder;
                });

                it('ajax success', function() {
                    data = {status: 'OK', data: data};
                    fetching = collection.getPromotions();
                    jqXHR.resolve();
                    expect(App.Data.errors.alert).not.toHaveBeenCalled();
                    expect(collection.addAjaxJson).toHaveBeenCalledWith(data.data);
                    expect(collection.trigger).toHaveBeenCalledWith('promotionsLoaded');
                    expect(fetching.state()).toBe('resolved');
                });

                it('ajax error', function() {
                    collection.getPromotions();
                    jqXHR.reject();
                    expect(collection.trigger).not.toHaveBeenCalledWith('promotionsLoaded');
                });

                function expectRequestParameters() {
                    expect(jqXHR.url).toBe(url);
                    expect(jqXHR.type).toBe(type);
                    expect(jqXHR.dataType).toBe(dataType);
                    expect(JSON.parse(jqXHR.data)).toEqual({
                        establishmentId: 1,
                        items: [{product: 123}],
                        orderInfo: {
                            rewards_card: {
                                number: '123456789'
                            }
                        },
                        captchaKey : captchaKey,
                        captchaValue : captchaValue
                    });
                }
            });

            it('update()', function() {
                spyOn(collection, 'getPromotions');
                collection.update();
                expect(collection.getPromotions).toHaveBeenCalled();
            });

            it('init()', function() {
                var promotions,
                    fetching = Backbone.$.Deferred();

                spyOn(App.Collections.Promotions.prototype, 'getPromotions').and.returnValue(fetching);
                App.Data.promotions = undefined;
                promotions = App.Collections.Promotions.init();
                expect(App.Collections.Promotions.prototype.getPromotions).toHaveBeenCalled();
                expect(promotions instanceof App.Collections.Promotions).toBe(true);
                expect(promotions.fetching.state()).toBe('pending');
            });

        });
    });

});

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

        describe('change:is_applied event', function() {
            var getProductsQty;

            beforeEach(function() {
                App.Data.myorder.checkout = new Backbone.Model();
                App.Data.myorder.get_cart_totals = jasmine.createSpy();
                getProductsQty = App.Data.myorder.get_only_product_quantity = jasmine.createSpy();
                model = new App.Models.Promotion({
                    code: '123'
                });
                model.collection = new Backbone.Collection();
                spyOn(model.collection, 'trigger');
            });

            it('promotion gets applied, cart is empty', function() {
                getProductsQty.and.returnValue(0);
                model.set({
                    is_applied: true
                });

                expect(model.collection.trigger).toHaveBeenCalledWith('onPromotionApply', model);
                expect(App.Data.myorder.checkout.get('last_discount_code')).toBe('123');
                expect(App.Data.myorder.get_cart_totals).not.toHaveBeenCalledWith();
            });


            it('promotion gets applied, cart is not empty', function() {
                getProductsQty.and.returnValue(1);
                model.set({
                    is_applied: true
                });

                expect(model.collection.trigger).toHaveBeenCalledWith('onPromotionApply', model);
                expect(App.Data.myorder.checkout.get('discount_code')).toBe('123');
                expect(App.Data.myorder.get_cart_totals).toHaveBeenCalledWith({apply_discount: true});
            });

            it('promotion gets not applied', function() {

            });
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
            it('`needToUpdate` must be true after order update', function() {
                App.Data.myorder = new Backbone.Model();
                collection = new App.Collections.Promotions();
                expect(collection.needToUpdate).toBe(false);

                App.Data.myorder.trigger('add');
                expect(collection.needToUpdate).toBe(true);
                collection.needToUpdate = false;

                App.Data.myorder.trigger('change');
                expect(collection.needToUpdate).toBe(true);
                collection.needToUpdate = false;

                App.Data.myorder.trigger('remove');
                expect(collection.needToUpdate).toBe(true);
                collection.needToUpdate = false;
            });

            describe('`onPromotionApply` event', function() {
                beforeEach(function() {
                    App.Models.Promotion.prototype.listenTo = jasmine.createSpy();
                    collection = new App.Collections.Promotions();
                });

                it('some promotion is applied, another promotion gets applied', function() {
                    collection.add(promotionsData.campaigns);
                    collection.models[0].set('is_applied', true);
                    collection.models[1].set('is_applied', true);
                    collection.trigger('onPromotionApply', collection.models[1]);
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
                    model1Cid = collection.models[1].cid;
                data[1].is_applicable = false;

                collection.addAjaxJson(data);
                // model0 was not changed
                expect(model0).toEqual(collection.models[0].toJSON());
                // model1.is_applicable was changed
                expect(collection.models[1].cid).toBe(model1Cid);
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

            it('`promotions` is array of objects, some promotion has wrong code format', function() {
                var data = deepClone(promotionsData.campaigns);
                data[0].code = '!#$';
                collection.addAjaxJson(data);
                expect(collection.length).toBe(promotionsData.campaigns.length - 1);
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
                        jqXHR.fail(function() {
                            opts.error();
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

                it('preparation of `items` request parameter', function() {
                    collection.getPromotions();
                    expect(order.item_submit).toHaveBeenCalled();
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
                    expect(App.Data.errors.alert).toHaveBeenCalledWith(MSG.ERROR_PROMOTIONS_LOAD, true);
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

            describe('init()', function() {
                var result,
                    fetching = Backbone.$.Deferred();

                beforeEach(function() {
                    spyOn(App.Collections.Promotions.prototype, 'getPromotions').and.returnValue(fetching);
                });

                it('App.Data.promotions in undefined', function() {
                    App.Data.promotions = undefined;
                    result = App.Collections.Promotions.init();
                    expect(App.Collections.Promotions.prototype.getPromotions).toHaveBeenCalled();
                    expect(result.state()).toBe('pending');
                });

                it('App.Data.promotions is defined', function() {
                    App.Data.promotions = new Backbone.Collection();
                    result = App.Collections.Promotions.init();
                    expect(App.Collections.Promotions.prototype.getPromotions).not.toHaveBeenCalled();
                    expect(result.state()).toBe('resolved');
                });
            });

        });
    });

});

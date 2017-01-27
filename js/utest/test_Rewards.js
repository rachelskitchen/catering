define(['js/utest/data/Rewards', 'rewards'], function(rewardsData) {
    'use strict';

    describe("App.Models.Rewards", function() {
        var model, def;

        beforeEach(function() {
            model = new App.Models.Rewards();
            def = {
                id: null,
                name: '',
                amount: 0,
                is_item_level: false,
                points: 0,
                rewards_type: null,
                type: 0,
                selected: false,
                disabled: false
            };
        });

        it('Environment', function() {
            expect(App.Models.Rewards).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });
    });

    describe('App.Collections.Rewards', function() {
        var collection, model;

        beforeEach(function() {
            collection = new App.Collections.Rewards();
            model = new App.Models.Rewards({ id: 1 });
        });

        it('Enviroment', function() {
            expect(App.Collections.Rewards).toBeDefined();
        });

        it('Create collection', function() {
            collection.add(model);
            expect(collection.models[0] instanceof App.Models.Rewards).toBe(true);
        });

        describe('updateDisabled()', function() {
            var value;

            beforeEach(function() {
                value = true;
                App.Settings.allow_multiple_reward_redemptions_per_order = true;
                spyOn(model, 'get');
            });

            it('`App.Settings.allow_multiple_reward_redemptions_per_order` is false. `criteria.is_item_level` should not be defined', function() {
                App.Settings.allow_multiple_reward_redemptions_per_order = false;
                collection.updateDisabled(model, value);
                expect(model.get).not.toHaveBeenCalled();
            });

            it('`App.Settings.allow_multiple_reward_redemptions_per_order` is true. `criteria.is_item_level` should be defined', function() {
                collection.updateDisabled(model, value);
                expect(model.get).toHaveBeenCalled();
            });
        });

        describe('deselect()', function() {
            var value;

            beforeEach(function() {
                value = true;
                App.Settings.allow_multiple_reward_redemptions_per_order = true;
                spyOn(model, 'get');
            });

            it('`App.Settings.allow_multiple_reward_redemptions_per_order` is false. `criteria.is_item_level` should not be defined', function() {
                App.Settings.allow_multiple_reward_redemptions_per_order = false;
                collection.updateDisabled(model, value);
                expect(model.get).not.toHaveBeenCalled();
            });

            it('`App.Settings.allow_multiple_reward_redemptions_per_order` is true. `criteria.is_item_level` should be defined', function() {
                collection.updateDisabled(model, value);
                expect(model.get).toHaveBeenCalled();
            });
        });
    });

    describe('App.Models.RewardsBalance', function() {
        var model, def;

        beforeEach(function() {
            model = new App.Models.RewardsBalance();
            def = {
                points: null,
                visits: null,
                purchases: null
            };
        });

        it('Enviroment', function() {
            expect(App.Models.RewardsBalance).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });
    });

    describe("App.Models.RewardsCard", function() {
        var rewardsCard, def, defaults;

        beforeEach(function() {
            rewardsCard = new App.Models.RewardsCard();
            def = {
                number: '',
                rewards: new App.Collections.Rewards,
                balance: new App.Models.RewardsBalance,
                discounts: [],
                captchaImage: '',
                captchaKey: '',
                captchaValue: ''
            };

            defaults = deepClone(rewardsData.defaults);
        });

        it('Environment', function() {
            expect(App.Models.RewardsCard).toBeDefined();
        });

        it('Create model', function() {
            expect(rewardsCard.get('number')).toEqual(def.number);
            expect(rewardsCard.get('rewards').toJSON()).toEqual(def.rewards.toJSON());
            expect(rewardsCard.get('balance').toJSON()).toEqual(def.balance.toJSON());
            expect(rewardsCard.get('discounts')).toEqual(def.discounts);
            expect(rewardsCard.get('captchaImage')).toEqual(def.captchaImage);
            expect(rewardsCard.get('captchaKey')).toEqual(def.captchaKey);
            expect(rewardsCard.get('captchaValue')).toEqual(def.captchaValue);
        });

        it('initialize()', function() {
            var rewardsSet1 = [{id: 11}, {id: 12}],
                balanceSet1 = {points: 101, visits: 102, purchases: 103},
                rewardsSet2 = [{id: 21}, {id: 22}],
                balanceSet2 = {points: 201, visits: 202, purchases: 203};

            // check convertions after inititalization
            rewardsCard = new App.Models.RewardsCard({
                rewards: rewardsSet1,
                balance: balanceSet1
            });

            var rewards = rewardsCard.get('rewards'),
                balance = rewardsCard.get('balance');

            expect(rewards instanceof App.Collections.Rewards).toBe(true);
            expect(balance instanceof App.Models.RewardsBalance).toBe(true);
            expect(rewards.models[0].get('id')).toBe(rewardsSet1[0].id);
            expect(rewards.models[1].get('id')).toBe(rewardsSet1[1].id);
            expect(balance.toJSON()).toEqual(balanceSet1);

            // check convertions after assigning data
            rewardsCard.set({
                rewards: rewardsSet2,
                balance: balanceSet2
            });

            rewards = rewardsCard.get('rewards');
            balance = rewardsCard.get('balance');

            expect(rewards instanceof App.Collections.Rewards).toBe(true);
            expect(balance instanceof App.Models.RewardsBalance).toBe(true);
            expect(rewards.models[0].get('id')).toBe(21);
            expect(rewards.models[1].get('id')).toBe(22);
            expect(balance.toJSON()).toEqual(balanceSet2);
        });

        it('updateSelected()', function() {
            var discountsData = deepClone(rewardsData.rewards.discounts),
                rewards = rewardsCard.get('rewards');
            rewards.set(discountsData);
            rewards.models[0].set('selected', true);
            rewards.models[2].set('selected', true);

            var discounts = [rewards.models[2].get('id')];

            rewardsCard.updateSelected();
            expect(rewardsCard.get('discounts')).toEqual(discounts);
        });

        describe('getRewards()', function() {
            var data, rewardsCard, number, jqXHR, url, type, dataType, est, captchaKey, captchaValue,
                myorder, order;

            beforeEach(function() {
                // URL for reward cards resource
                url = '/weborders/rewards/';

                // type of request
                type = 'POST';

                // expected data type
                dataType = 'json';

                // jqXHR simulator
                jqXHR = $.Deferred();

                // rewards card number
                number = '123456789';

                // establishment
                est = 1;

                // captchaKey
                captchaKey = 'captcha-test-key';

                // captchaValue
                captchaValue = 'captcha-test-key';

                // response from server
                data = deepClone(rewardsData.rewards);

                rewardsCard = new App.Models.RewardsCard({
                    number: number,
                    captchaKey: captchaKey,
                    captchaValue: captchaValue
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function(opts) {
                    jqXHR = _.extend(jqXHR, opts);
                    jqXHR.done(function() {
                        opts.success(data);
                    });
                    return jqXHR;
                });

                spyOn(App.Data.settings, 'get').and.returnValue(est);
                spyOn(rewardsCard, 'trigger');

                myorder = App.Data.myorder;
                order = {
                    item_submit: jasmine.createSpy().and.returnValue({product: 123})
                };
                App.Data.myorder = [order];
            });

            afterEach(function() {
                App.Data.myorder = myorder;
            });

            it('App.Data.myorder is not empty. Prepare order items for submitting to server', function() {
                rewardsCard.getRewards();
                expect(order.item_submit).toHaveBeenCalled();
            });

            it('`number` isn\'t assigned', function() {
                rewardsCard.set('number', '');
                rewardsCard.getRewards();
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
            });

            it('`captchaKey` isn\'t assigned', function() {
                rewardsCard.set('captchaKey', '');
                rewardsCard.getRewards();
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
            });

            it('`captchaValue` isn\'t assigned', function() {
                rewardsCard.set('captchaValue', '');
                rewardsCard.getRewards();
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request failed', function() {
                rewardsCard.getRewards();
                jqXHR.reject();
                expectRequestParameters();
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, captcha is invalid (response JSON: {status: "ERROR", errorMsg: "..."})', function() {
                rewardsCard.getRewards();
                data = {status: 'ERROR', errorMsg: '...'};
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onResetData');
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsErrors', data.errorMsg);
                expect(rewardsCard.get('purchases')).toBe(rewardsCard.defaults.purchases);
                expect(rewardsCard.get('visits')).toBe(rewardsCard.defaults.visits);
                expect(rewardsCard.get('points')).toBe(rewardsCard.defaults.points);
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, successful result (response JSON: {status: "OK", data:[...]})', function() {
                rewardsCard.getRewards();
                data = {status: 'OK', data: data};
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                var rewards = _.map(data.data.discounts, function(reward) {
                    return _.extend(reward, {selected: false, disabled: false});
                });
                expect(rewardsCard.get('rewards').toJSON()).toEqual(rewards);
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, data.discounts is missing (response JSON: {status: "OK", data:{}})', function() {
                rewardsCard.getRewards();
                data = {status: 'OK', data: {}};
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');

                expect(rewardsCard.get('rewards').toJSON()).toEqual([]);
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
                    captchaValue : captchaValue
                });
            }
        });

        it('saveData()', function() {
            var data = {
                number: '123',
                redemption_code: 2,
                points: {rewards_earned: 11, discount: 12, point_to_next_reward: 13, value: 14},
                visits: {rewards_earned: 21, discount: 22, point_to_next_reward: 23, value: 24},
                purchases: {rewards_earned: 31, discount: 32, point_to_next_reward: 33, value: 34}
            }, nameArg, dataArg;


            spyOn(window, 'setData').and.callFake(function(_name, _data) {
                nameArg = _name;
                dataArg = _data;
            });
            rewardsCard.set(data);
            rewardsCard.saveData();

            expect(window.setData).toHaveBeenCalled();
            expect(nameArg).toBe('rewardsCard');
            expect(dataArg).toEqual(dataArg);
        });

        describe('loadData()', function() {
            it('data exists in storage', function() {
                var data = {
                    number: '123',
                    discounts: [11, 22],
                    rewards: [_.extend(defaults, {id: 1})],
                    balance: {points: 100, visits: 200, purchases: 300},
                    captchaKey: 'test',
                    captchaValue: 'test'
                }

                spyOn(window, 'getData').and.callFake(function() {
                    return data;
                });
                rewardsCard.loadData();

                expect(window.getData).toHaveBeenCalledWith('rewardsCard');
                expect(rewardsCard.get('number')).toBe(data.number);
                expect(rewardsCard.get('discounts')).toEqual(data.discounts);
                expect(rewardsCard.get('rewards').toJSON()).toEqual(data.rewards);
                expect(rewardsCard.get('balance').toJSON()).toEqual(data.balance);
                expect(rewardsCard.get('captchaKey')).toBe(data.captchaKey);
                expect(rewardsCard.get('captchaValue')).toBe(data.captchaValue);
            });

            it('data doesn\'t exist in storage', function() {
                spyOn(window, 'getData').and.returnValue(undefined);
                rewardsCard.loadData();

                expect(window.getData).toHaveBeenCalledWith('rewardsCard');
                expect(rewardsCard.get('number')).toBe(rewardsCard.defaults.number);
                expect(rewardsCard.get('redemption_code')).toBe(rewardsCard.defaults.redemption_code);
                expect(rewardsCard.get('captchaKey')).toBe(rewardsCard.defaults.captchaKey);
                expect(rewardsCard.get('captchaValue')).toBe(rewardsCard.defaults.captchaValue);
                expect(rewardsCard.get('points')).toBe(rewardsCard.defaults.points);
                expect(rewardsCard.get('visits')).toBe(rewardsCard.defaults.visits);
                expect(rewardsCard.get('purchases')).toBe(rewardsCard.defaults.purchases);
            });
        });

        it('resetData()', function() {
            var data = {
                number: '232312',
                rewards: [_.extend(defaults, {id: 1})],
                balance: {points: 100, visits: 200, purchases: 300},
                discounts: [11, 22],
                captchaKey: 'test',
                captchaValue: 'test'
            };

            spyOn(rewardsCard, 'trigger').and.callThrough();
            rewardsCard.set(data);

            expect(rewardsCard.get('number')).toBe(data.number);
            expect(rewardsCard.get('rewards').toJSON()).toEqual(data.rewards);
            expect(rewardsCard.get('balance').toJSON()).toEqual(data.balance);
            expect(rewardsCard.get('discounts')).toEqual(data.discounts);
            expect(rewardsCard.get('captchaValue')).toBe(data.captchaValue);
            expect(rewardsCard.get('captchaKey')).toBe(data.captchaKey);

            rewardsCard.resetData();
            expect(rewardsCard.get('number')).toEqual(rewardsCard.defaults.number);
            expect(rewardsCard.trigger).toHaveBeenCalledWith('onResetData');
            expectReset();
        });

        it('resetDataAfterPayment()', function() {
            var data = {
                number: '232312',
                rewards: [_.extend(defaults, {id: 1})],
                balance: {points: 100, visits: 200, purchases: 300},
                discounts: [11, 22],
                captchaKey: 'test',
                captchaValue: 'test'
            };

            spyOn(rewardsCard, 'trigger').and.callThrough();
            rewardsCard.set(data);
            rewardsCard.resetDataAfterPayment();

            expect(rewardsCard.get('number')).toBe(data.number);
            expectReset();
        });

        describe('selectRewardCard()', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.RewardsCard();
            });

            it('`this.resetData()` should be called', function() {
                spyOn(model, 'resetData');
                model.selectRewardCard(model);
                expect(model.resetData).toHaveBeenCalled();
            });

            it('`this.set()` should be called', function() {
                spyOn(model, 'set');
                model.selectRewardCard(model);
                expect(model.set).toHaveBeenCalled();
            });
        });

        describe('check()', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.RewardsCard({
                    number: '0987654321',
                    captchaValue: 'keyword'
                });
            });

            it('`number` attribute is empty. The method should return an error', function() {
                model.set('number', '');
                var result = model.check();
                expect(result.status).toEqual('ERROR_EMPTY_FIELDS');
            });

            it('`captchaValue` attribute is empty. The method should return an error', function() {
                model.set('captchaValue', '');
                var result = model.check();
                expect(result.status).toEqual('ERROR_EMPTY_FIELDS');
            });

            it('`number` and `captchaValue` attributes are not empty. The method should return OK', function() {
                var result = model.check();
                expect(result.status).toEqual('OK');
            });
        });

        describe('linkToCustomer()', function() {
            var authHeader = { Authorization: 'Bearer XXX' },
                model, ajaxReq, ajaxParams;

            beforeEach(function() {
                model = new App.Models.RewardsCard({
                    number: '0987654321',
                    captchaValue: 'Q1w23er',
                    captchaKey: 'supersecret'
                });

                ajaxReq = Backbone.$.Deferred();

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxParams = arguments[0];
                    ajaxReq.done(ajaxParams.success);
                    return ajaxReq;
                });
            });

            it('`authorizationHeader` is not passed. The method should not return an object', function() {
                expect(model.linkToCustomer()).not.toEqual(jasmine.any(Object));
            });

            it('`authorizationHeader` is not an object. The method should not return an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    expect(model.linkToCustomer(value)).not.toEqual(jasmine.any(Object));
                });
            });

            it('`number` is not set. The method should not return an object', function() {
                model.set('number', '');
                expect(model.linkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('`captchaValue` is not set. The method should not return an object', function() {
                model.set('captchaValue', '');
                expect(model.linkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('`captchaKey` is not set. The method should not return an object', function() {
                model.set('captchaKey', '');
                expect(model.linkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('Request params are valid', function() {
                var req = model.linkToCustomer(authHeader);

                expect(req).toBe(ajaxReq);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(ajaxParams.url).toBe('/weborders/v1/rewardscard/' + model.get('number') + '/link/');
                expect(ajaxParams.method).toBe('POST');
                expect(ajaxParams.headers).toBe(authHeader);
                expect(ajaxParams.dataType).toBe('json');
                expect(ajaxParams.contentType).toBe('application/json');
                expect(ajaxParams.data).toBe(JSON.stringify({
                    captchaValue: model.get('captchaValue')
                }));
                expect(ajaxParams.success).toEqual(jasmine.any(Function));
                expect(ajaxParams.error).toEqual(jasmine.any(Function));
            });

            it('Request is successful, `data` is not an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    var req = model.linkToCustomer(authHeader);
                    ajaxReq.resolve(value);
                    expect(value).not.toBe(jasmine.any(Object));
                });
            });

            it('Request is successful, `data` is object and `data.status` is `OK`', function() {
                var req = model.linkToCustomer(authHeader),
                    attrs = {
                        points: 333,
                        purchases: 222,
                        visits: 111
                    },
                    data = {
                        status: 'OK',
                        data: {
                            balances: new App.Models.RewardsBalance(attrs)
                        }
                    };

                ajaxReq.resolve(data);
                expect(model.get('balance').attributes).toEqual(attrs);
            });

            it('Request is successful, `data` is object and `data.status` is not `OK`', function() {
                var req = model.linkToCustomer(authHeader),
                    data = { status: 'ERROR' };

                spyOn(model, 'trigger');
                ajaxReq.resolve(data);
                expect(model.trigger).toHaveBeenCalled();
            });
        });

        describe('unlinkToCustomer()', function() {
            var authHeader = { Authorization: 'Bearer XXX' },
                model, ajaxReq, ajaxParams;

            beforeEach(function() {
                model = new App.Models.RewardsCard({
                    number: '0987654321'
                });

                ajaxReq = Backbone.$.Deferred();

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxParams = arguments[0];
                    ajaxReq.done(ajaxParams.success);
                    return ajaxReq;
                });
            });

            it('`authorizationHeader` is not passed. The method should not return an object', function() {
                expect(model.unlinkToCustomer()).not.toEqual(jasmine.any(Object));
            });

            it('`authorizationHeader` is not an object. The method should not return an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    expect(model.unlinkToCustomer(value)).not.toEqual(jasmine.any(Object));
                });
            });

            it('`number` is not set. The method should not return an object', function() {
                model.set('number', '');
                expect(model.unlinkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('Request params are valid', function() {
                var req = model.unlinkToCustomer(authHeader);

                expect(req).toBe(ajaxReq);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(ajaxParams.url).toBe('/weborders/v1/rewardscard/' + model.get('number') + '/unlink/');
                expect(ajaxParams.method).toBe('GET');
                expect(ajaxParams.headers).toBe(authHeader);
                expect(ajaxParams.success).toEqual(jasmine.any(Function));
                expect(ajaxParams.error).toEqual(jasmine.any(Function));
            });

            it('Request is successful, `data.status` is `OK` and `this.collection` exists', function() {
                model.collection = new Backbone.Collection();
                model.collection.add(model);

                var req = model.unlinkToCustomer(authHeader),
                    data = { status: 'OK' };

                ajaxReq.resolve(data);
                expect(model.collection).not.toBeTruthy();
            });
        });

        function expectReset() {
            expect(rewardsCard.get('rewards').toJSON()).toEqual([]);
            expect(rewardsCard.get('balance')).toEqual(rewardsCard.defaults.balance);
            expect(rewardsCard.get('discounts')).toEqual(rewardsCard.defaults.discounts);
        }

    });

    describe('App.Collections.RewardCards', function() {
        var collection;

        beforeEach(function() {
            collection = new App.Collections.RewardCards();
        });

        describe('getCards()', function() {
            var authHeader = { Authorization: 'Bearer XXX' },
                ajaxReq, ajaxParams;

            beforeEach(function() {
                ajaxReq = Backbone.$.Deferred();

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxParams = arguments[0];
                    ajaxReq.done(ajaxParams.success);
                    return ajaxReq;
                });
            });

            it('`authorizationHeader` is not passed. The method should not return an object', function() {
                expect(collection.getCards()).not.toEqual(jasmine.any(Object));
            });

            it('`authorizationHeader` is not an object. The method should not return an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    expect(collection.getCards(value)).not.toEqual(jasmine.any(Object));
                });
            });

            it('Request params are valid', function() {
                var req = collection.getCards(authHeader);

                expect(req).toBe(ajaxReq);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(ajaxParams.url).toBe('/weborders/v1/rewardscard/');
                expect(ajaxParams.method).toBe('GET');
                expect(ajaxParams.headers).toBe(authHeader);
                expect(ajaxParams.success).toEqual(jasmine.any(Function));
                expect(ajaxParams.error).toEqual(jasmine.any(Function));
            });

            it('Request is successful, `data.status` is `OK` and `data.data` is not an array. `this.add()` should not be called', function() {
                var req = collection.getCards(authHeader),
                    data = { status: 'OK', data: null };

                spyOn(collection, 'reset');
                ajaxReq.resolve(data);
                expect(collection.reset).toHaveBeenCalled();
            });

            it('Request is successful, `data.status` is not `OK` and `data.data` is an array. `this.add()` should not be called', function() {
                var req = collection.getCards(authHeader),
                    data = { status: 'ERROR', data: [] };

                spyOn(collection, 'reset');
                ajaxReq.resolve(data);
                expect(collection.reset).toHaveBeenCalled();
            });

            it('Request is successful, `data.status` is `OK` and `data.data` is an array. `this.add()` should be called', function() {
                var req = collection.getCards(authHeader),
                    data = { status: 'OK', data: [] };

                spyOn(collection, 'reset');
                ajaxReq.resolve(data);
                expect(collection.reset).toHaveBeenCalled();
            });

            it('Request is successful, `data.data` contains a few cards. `this.add()` should be called', function() {
                var req = collection.getCards(authHeader),
                    data = {
                        status: 'OK',
                        data: [
                            { number: '1234567890', discounts: [], balances: new App.Models.RewardsBalance },
                            { number: '0987654321', discounts: [], balances: new App.Models.RewardsBalance }
                        ]
                    };

                spyOn(collection, 'add');
                ajaxReq.resolve(data);
                expect(collection.add).toHaveBeenCalled();
            });
        });

        describe('getSelected()', function() {
            it('Add a model with `selected` true. Should return an object', function() {
                collection.add({ selected: true });
                expect(collection.getSelected()).toEqual(jasmine.any(Object));
            });
        });

        describe('selectFirstItem()', function() {
            it('There are no selected cards in the collection. The first model should be selected', function() {
                collection.add({ selected: false });
                collection.add({ selected: false });
                collection.selectFirstItem();
                expect(collection.at(0).get('selected')).toEqual(true);
            });
        });

        describe('addUniqueItem()', function() {
            var rewardCard;

            beforeEach(function() {
                rewardCard = new App.Models.RewardsCard({
                    number: '0987654321',
                    discounts: [1, 2, 3]
                });

                spyOn(collection, 'findWhere').and.callThrough();
            });

            it('rewardCard is not passed', function() {
                collection.addUniqueItem();
                expect(collection.findWhere).not.toHaveBeenCalled();
            });

            it('rewardCard is not an instance of `App.Models.RewardsCard`', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true, [], {}];

                values.forEach(function(value) {
                    collection.addUniqueItem(value);
                    expect(collection.findWhere).not.toHaveBeenCalled();
                });
            });

            it('rewardCard is an instance of `App.Models.RewardsCard`', function() {
                collection.addUniqueItem(rewardCard);
                expect(collection.findWhere).toHaveBeenCalled();
            });

            it('rewardCard has the same number as an existing card. The existing one should be updated with new attributes', function() {
                collection.add({
                    number: rewardCard.get('number'),
                    discounts: [3, 2, 1]
                });

                collection.addUniqueItem(rewardCard);
                expect(collection.at(0).get('discounts')).toEqual(rewardCard.get('discounts'));
            });

            it('rewardCard has a unique number. New card should be added to the collection', function() {
                collection.add({ number: '1234567890' });
                collection.addUniqueItem(rewardCard);
                expect(collection.length).toBeGreaterThan(1);
            });
        });

        describe('resetSelection()', function() {
            it('The collection models should not be selected', function() {
                collection.add({ number: '0987654321', selected: false });
                collection.add({ number: '1234567890', selected: true });
                collection.resetSelection();
                expect(collection.where({ selected: true }).length).toEqual(0);
            });
        });
    });
});

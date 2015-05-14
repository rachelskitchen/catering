define(['rewards'], function() {
    'use strict';

    describe("App.Models.Rewards", function() {
        var rewards, def;

        beforeEach(function() {
            rewards = new App.Models.Rewards();
            def = {
                rewards_earned: 0,
                discount: 0,
                point_to_next_reward: 0,
                value: 0,
                selected: false
            };
        });

        it('Environment', function() {
            expect(App.Models.Rewards).toBeDefined();
        });

        it('Create model', function() {
            expect(rewards.toJSON()).toEqual(def);
        });

        it('isAvailable()', function() {
            rewards.set('rewards_earned', 0.5);
            expect(rewards.isAvailable()).toBe(false);
            rewards.set('rewards_earned', 21);
            expect(rewards.isAvailable()).toBe(true);
        });

        it('isDefault()', function() {
            expect(rewards.isDefault()).toBe(true);
            rewards.set('rewards_earned', 1);
            expect(rewards.isDefault()).toBe(false);
        });
    });

    describe("App.Models.RewardsCard", function() {
        var rewardsCard, def, visits, purchases, points;

        beforeEach(function() {
            rewardsCard = new App.Models.RewardsCard();
            def = {
                purchases: new App.Models.Rewards,
                visits: new App.Models.Rewards,
                points: new App.Models.Rewards,
                number: '',
                redemption_code: null,
                captchaImage: '',
                captchaKey: '',
                captchaValue: ''
            };
        });

        it('Environment', function() {
            expect(App.Models.RewardsCard).toBeDefined();
        });

        it('Create model', function() {
            expect(rewardsCard.get('number')).toEqual(def.number);
            expect(rewardsCard.get('redemption_code')).toEqual(def.redemption_code);
            expect(rewardsCard.get('purchases').toJSON()).toEqual(def.purchases.toJSON());
            expect(rewardsCard.get('visits').toJSON()).toEqual(def.visits.toJSON());
            expect(rewardsCard.get('points').toJSON()).toEqual(def.points.toJSON());
            expect(rewardsCard.get('captchaImage')).toEqual(def.captchaImage);
            expect(rewardsCard.get('captchaKey')).toEqual(def.captchaKey);
            expect(rewardsCard.get('captchaValue')).toEqual(def.captchaValue);
        });

        it('initialize()', function() {
            var purchases1 = {value: 5},
                purchases2 = {value: 3},
                visits1 = {value: 2},
                visits2 = {value: 4},
                points1 = {value: 7},
                points2 = {value: 1};

            // check convertions after inititalization
            rewardsCard = new App.Models.RewardsCard({
                purchases: purchases1,
                visits: visits1,
                points: points1
            });

            var purchases = rewardsCard.get('purchases'),
                visits = rewardsCard.get('visits'),
                points = rewardsCard.get('points');

            expect(purchases instanceof App.Models.Rewards).toBe(true);
            expect(visits instanceof App.Models.Rewards).toBe(true);
            expect(points instanceof App.Models.Rewards).toBe(true);
            expect(purchases.get('value')).toBe(purchases1.value);
            expect(visits.get('value')).toBe(visits1.value);
            expect(points.get('value')).toBe(points1.value);

            // check convertions after assigning data
            rewardsCard.set({
                purchases: purchases2,
                visits: visits2,
                points: points2
            });

            purchases = rewardsCard.get('purchases');
            visits = rewardsCard.get('visits');
            points = rewardsCard.get('points');

            expect(purchases instanceof App.Models.Rewards).toBe(true);
            expect(visits instanceof App.Models.Rewards).toBe(true);
            expect(points instanceof App.Models.Rewards).toBe(true);
            expect(purchases.get('value')).toBe(purchases2.value);
            expect(visits.get('value')).toBe(visits2.value);
            expect(points.get('value')).toBe(points2.value);
        });

        describe('updateRewardsType()', function() {
            var data, rewardsCard;

            beforeEach(function() {
                data = {
                    rewards_earned: 2,
                    discount: 12,
                    point_to_next_reward: 4,
                    value: 2
                };
                rewardsCard = new App.Models.RewardsCard({
                    purchases: data,
                    visits: data,
                    points: data
                });
                spyOn(rewardsCard, 'set');
            });

            it('`rewardType` parameter value isn\'t one of "purchases", "visits", "points"`', function() {
                rewardsCard.updateRewardsType('dsf', {value:12});
                expect(rewardsCard.set).not.toHaveBeenCalled();
            });

            it('`rewardType` parameter value is one of "purchases", "visits", "points"`, `data` isn\'t passed', function() {
                var json = rewardsCard.toJSON();

                //check purchases
                rewardsCard.updateRewardsType('purchases');
                expect(rewardsCard.set).toHaveBeenCalledWith('purchases', json.purchases);
                expect(rewardsCard.get('purchases').toJSON()).toEqual(json.purchases.toJSON());

                //check visits
                rewardsCard.updateRewardsType('visits');
                expect(rewardsCard.set).toHaveBeenCalledWith('visits', json.visits);
                expect(rewardsCard.get('visits').toJSON()).toEqual(json.visits.toJSON());

                //check visits
                rewardsCard.updateRewardsType('points');
                expect(rewardsCard.set).toHaveBeenCalledWith('points', json.points);
                expect(rewardsCard.get('points').toJSON()).toEqual(json.points.toJSON());
            });

            it('`rewardType` parameter value is one of "purchases", "visits", "points"`, `data` is simple object', function() {
                var data = {
                    rewards_earned: 2,
                    discount: 12,
                    point_to_next_reward: 4,
                    value: 2,
                    selected: false
                }

                // check purchases
                rewardsCard.updateRewardsType('purchases', data);
                var purchases = rewardsCard.get('purchases');

                expect(purchases instanceof App.Models.Rewards).toBe(true);
                expect(rewardsCard.set).toHaveBeenCalled();
                expect(purchases.toJSON()).toEqual(data);

                // check visits
                rewardsCard.updateRewardsType('visits', data);
                var visits = rewardsCard.get('visits');

                expect(visits instanceof App.Models.Rewards).toBe(true);
                expect(rewardsCard.set).toHaveBeenCalled();
                expect(visits.toJSON()).toEqual(data);

                // check points
                rewardsCard.updateRewardsType('points', data);
                var points = rewardsCard.get('points');

                expect(points instanceof App.Models.Rewards).toBe(true);
                expect(rewardsCard.set).toHaveBeenCalled();
                expect(points.toJSON()).toEqual(data);
            });
        });

        describe('getRewards()', function() {
            var data, rewardsCard, number, jqXHR, url, type, dataType, postData, est, captchaKey, captchaValue;

            beforeEach(function() {
                // URL for reward cards resource
                url = '/weborders/reward_cards/';

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

                // data passed to server to get rewards card
                postData = {
                    establishment: est,
                    number: number,
                    captchaKey: captchaKey,
                    captchaValue: captchaValue
                };

                // response from server
                data = [{
                    points: {
                        rewards_earned: 4,
                        discount: 12,
                        point_to_next_reward: 3,
                        value: 1
                    },
                    visits: {
                        rewards_earned: 5,
                        discount: 11,
                        point_to_next_reward: 32,
                        value: 12
                    },
                    purchases: {
                        rewards_earned: 2,
                        discount: 8,
                        point_to_next_reward: 21,
                        value: 14
                    }
                }];

                rewardsCard = new App.Models.RewardsCard({
                    number: number,
                    captchaKey: captchaKey,
                    captchaValue: captchaValue
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function(opts) {
                    jqXHR = _.extend(jqXHR, opts);
                    jqXHR.fail(function() {
                        opts.errorResp(data);
                    });
                    jqXHR.done(function() {
                        opts.successResp(data);
                    });
                    return jqXHR;
                });

                spyOn(App.Data.settings, 'get').and.returnValue(est);
                spyOn(rewardsCard, 'trigger');
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

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, `data` param isn\'t array', function() {
                rewardsCard.getRewards();
                data = 213;
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases')).toBe(rewardsCard.defaults.purchases);
                expect(rewardsCard.get('visits')).toBe(rewardsCard.defaults.visits);
                expect(rewardsCard.get('points')).toBe(rewardsCard.defaults.points);
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, `data` param is array and its first element isn\'t object', function() {
                rewardsCard.getRewards();
                data = ['sdf'];
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases')).toBe(rewardsCard.defaults.purchases);
                expect(rewardsCard.get('visits')).toBe(rewardsCard.defaults.visits);
                expect(rewardsCard.get('points')).toBe(rewardsCard.defaults.points);
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, `data` param is array and its first element is object', function() {
                rewardsCard.getRewards();
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases').toJSON()).toEqual(_.extend(data[0].purchases, {selected: false}));
                expect(rewardsCard.get('visits').toJSON()).toEqual(_.extend(data[0].visits, {selected: false}));
                expect(rewardsCard.get('points').toJSON()).toEqual(_.extend(data[0].points, {selected: false}));
            });

            it('`number`, `captchaKey`, `captchaValue` are assigned, request is successful, `data` param is array and its first element is object, rewards types are disabled', function() {
                rewardsCard.getRewards();
                data = [{number: '131232'}];
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases')).toEqual(rewardsCard.defaults.purchases);
                expect(rewardsCard.get('visits')).toEqual(rewardsCard.defaults.visits);
                expect(rewardsCard.get('points')).toEqual(rewardsCard.defaults.points);
            });

            function expectRequestParameters() {
                expect(jqXHR.url).toBe(url);
                expect(jqXHR.type).toBe(type);
                expect(jqXHR.dataType).toBe(dataType);
                expect(JSON.parse(jqXHR.data)).toEqual({number: number, establishment: est, captchaKey : captchaKey, captchaValue : captchaValue});
            }
        });

        describe('selectRewardsType()', function() {
            beforeEach(function() {

            });

            it('`rewardsType` is invalid', function() {
                spyOn(rewardsCard, 'set');
                rewardsCard.selectRewardsType('dfsdf');
                expect(rewardsCard.set).toHaveBeenCalledWith('redemption_code', rewardsCard.defaults.redemption_code);
            });

            it('`rewardsType` is valid, `rewards_earned` >= 1', function() {
                var REDEMPTION_CODES = {
                    points: 1,
                    visits: 2,
                    purchases: 3
                };

                // check points
                rewardsCard.get('points').set('rewards_earned', 1);
                rewardsCard.selectRewardsType('points');
                expect(rewardsCard.get('redemption_code')).toBe(REDEMPTION_CODES.points);

                // check visits
                rewardsCard.get('visits').set('rewards_earned', 2);
                rewardsCard.selectRewardsType('visits');
                expect(rewardsCard.get('redemption_code')).toBe(REDEMPTION_CODES.visits);

                // check purchases
                rewardsCard.get('purchases').set('rewards_earned', 3);
                rewardsCard.selectRewardsType('purchases');
                expect(rewardsCard.get('redemption_code')).toBe(REDEMPTION_CODES.purchases);
            });

            it('`rewardsType` is valid, `rewards_earned` < 1', function() {
                // check points
                rewardsCard.get('points').set('rewards_earned', 0);
                rewardsCard.selectRewardsType('points');
                expect(rewardsCard.get('redemption_code')).toBe(rewardsCard.defaults.redemption_code);

                // check visits
                rewardsCard.get('visits').set('rewards_earned', 0.5);
                rewardsCard.selectRewardsType('visits');
                expect(rewardsCard.get('redemption_code')).toBe(rewardsCard.defaults.redemption_code);

                // check purchases
                rewardsCard.get('purchases').set('rewards_earned', 0.99);
                rewardsCard.selectRewardsType('purchases');
                expect(rewardsCard.get('redemption_code')).toBe(rewardsCard.defaults.redemption_code);
            });
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
                    redemption_code: 2,
                    points: {rewards_earned: 11, discount: 12, point_to_next_reward: 13, value: 14, selected: false},
                    visits: {rewards_earned: 21, discount: 22, point_to_next_reward: 23, value: 24, selected: true},
                    purchases: {rewards_earned: 31, discount: 32, point_to_next_reward: 33, value: 34, selected: false},
                    captchaKey: 'test',
                    captchaValue: 'test'
                }

                spyOn(window, 'getData').and.callFake(function() {
                    return data;
                });
                rewardsCard.loadData();

                expect(window.getData).toHaveBeenCalledWith('rewardsCard');
                expect(rewardsCard.get('number')).toBe(data.number);
                expect(rewardsCard.get('redemption_code')).toBe(data.redemption_code);
                expect(rewardsCard.get('captchaKey')).toBe(data.captchaKey);
                expect(rewardsCard.get('captchaValue')).toBe(data.captchaValue);
                expect(rewardsCard.get('points').toJSON()).toEqual(data.points);
                expect(rewardsCard.get('visits').toJSON()).toEqual(data.visits);
                expect(rewardsCard.get('purchases').toJSON()).toEqual(data.purchases);
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
                redemption_code: 2,
                points: {rewards_earned: 11, discount: 12, point_to_next_reward: 13, value: 14, selected: true},
                visits: {rewards_earned: 21, discount: 22, point_to_next_reward: 23, value: 24, selected: false},
                purchases: {rewards_earned: 31, discount: 32, point_to_next_reward: 33, value: 34, selected: false},
                captchaKey: 'test',
                captchaValue: 'test'
            };

            rewardsCard.set(data);
            expect(rewardsCard.get('number')).toBe(data.number);
            expect(rewardsCard.get('redemption_code')).toBe(data.redemption_code);
            expect(rewardsCard.get('captchaValue')).toBe(data.captchaValue);
            expect(rewardsCard.get('captchaKey')).toBe(data.captchaKey);
            expect(rewardsCard.get('points').toJSON()).toEqual(data.points);
            expect(rewardsCard.get('visits').toJSON()).toEqual(data.visits);
            expect(rewardsCard.get('purchases').toJSON()).toEqual(data.purchases);

            rewardsCard.resetData();
            expect(rewardsCard.toJSON()).toEqual(rewardsCard.defaults);
        });

        it('loadCaptcha()', function() {
            var captchaData = {captcha_image: 'aaaaaa', captcha_key: 'bbbbbbbb'},
                URL = '/weborders/captcha/?establishment=1',
                DATA = {},
                jsXHR, _url, _data;

            spyOn(Backbone.$, 'getJSON').and.callFake(function(url, data, cb) {
                jsXHR = Backbone.$.Deferred();
                jsXHR.always(function() {
                    cb(captchaData);
                });
                _url = url;
                _data = data;
            });

            spyOn(rewardsCard, 'set');

            // check success
            rewardsCard.loadCaptcha();
            jsXHR.resolve();
            expect(_url).toBe(URL);
            expect(_data).toEqual(DATA);
            expect(rewardsCard.set).toHaveBeenCalledWith('captchaImage', captchaData.captcha_image);
            expect(rewardsCard.set).toHaveBeenCalledWith('captchaKey', captchaData.captcha_key);
        });
    });
});
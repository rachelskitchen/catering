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
                value: 0
            };
        });

        it('Environment', function() {
            expect(App.Models.Rewards).toBeDefined();
        });

        it('Create model', function() {
            expect(rewards.toJSON()).toEqual(def);
        });

        it('isAvailable()', function() {
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
                redemption_code: null
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
                    value: 2
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
            var data, rewardsCard, number, jqXHR, url, type, dataType, postData, est;

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

                // data passed to server to get rewards card
                postData = {
                    establishment: est,
                    number: number
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
                    number: number
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

            it('`number` is assigned, request failed', function() {
                rewardsCard.getRewards();
                jqXHR.reject();
                expectRequestParameters();
            });

            it('`number` is assigned, request is successful, `data` param isn\'t array', function() {
                rewardsCard.getRewards();
                data = 213;
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases')).toBe(rewardsCard.defaults.purchases);
                expect(rewardsCard.get('visits')).toBe(rewardsCard.defaults.visits);
                expect(rewardsCard.get('points')).toBe(rewardsCard.defaults.points);
            });

            it('`number` is assigned, request is successful, `data` param is array and its first element isn\'t object', function() {
                rewardsCard.getRewards();
                data = ['sdf'];
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases')).toBe(rewardsCard.defaults.purchases);
                expect(rewardsCard.get('visits')).toBe(rewardsCard.defaults.visits);
                expect(rewardsCard.get('points')).toBe(rewardsCard.defaults.points);
            });

            it('`number` is assigned, request is successful, `data` param is array and its first element is object', function() {
                rewardsCard.getRewards();
                jqXHR.resolve();
                expectRequestParameters();
                expect(rewardsCard.trigger).toHaveBeenCalledWith('onRewardsReceived');
                expect(rewardsCard.get('purchases').toJSON()).toEqual(data[0].purchases);
                expect(rewardsCard.get('visits').toJSON()).toEqual(data[0].visits);
                expect(rewardsCard.get('points').toJSON()).toEqual(data[0].points);
            });

            it('`number` is assigned, request is successful, `data` param is array and its first element is object, rewards types are disabled', function() {
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
                expect(jqXHR.data).toEqual({number: number, establishment: est});
            }
        });

        describe('selectRewardsType()', function() {
            beforeEach(function() {

            });

            it('`rewardsType` is invalid', function() {
                spyOn(rewardsCard, 'set');
                rewardsCard.selectRewardsType('dfsdf');
                expect(rewardsCard.set).not.toHaveBeenCalled();
            });

            it('`rewardsType` is valid', function() {
                var REDEMPTION_CODES = {
                    points: 1,
                    visits: 2,
                    purchases: 3
                };

                // check points
                rewardsCard.selectRewardsType('points');
                expect(rewardsCard.get('redemption_code')).toBe(REDEMPTION_CODES.points);

                // check visits
                rewardsCard.selectRewardsType('visits');
                expect(rewardsCard.get('redemption_code')).toBe(REDEMPTION_CODES.visits);

                // check purchases
                rewardsCard.selectRewardsType('purchases');
                expect(rewardsCard.get('redemption_code')).toBe(REDEMPTION_CODES.purchases);
            });
        });
    });
});
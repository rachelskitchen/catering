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
    });

    describe("App.Models.RewardsCard", function() {
        var rewardsCard, def, visits, purchases, points;

        beforeEach(function() {
            rewardsCard = new App.Models.RewardsCard();
            def = {
                purchases: new App.Models.Rewards,
                visits: new App.Models.Rewards,
                points: new App.Models.Rewards,
                number: ''
            };
        });

        it('Environment', function() {
            expect(App.Models.RewardsCard).toBeDefined();
        });

        it('Create model', function() {
            expect(rewardsCard.get('number')).toEqual(def.number);
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
                spyOn(rewardsCard, 'get');
            });

            it('`rewardType` parameter value isn\'t one of "purchases", "visits", "points"`', function() {
                rewardsCard.updateRewardsType('dsf', {value:12});
                expect(rewardsCard.set).not.toHaveBeenCalled();
            });

            it('`rewardType` parameter value is one of "purchases", "visits", "points"`, `data` isn\'t passed', function() {
                //check purchases
                rewardsCard.updateRewardsType('purchases');
console.log('purchases', rewardsCard.get('purchases'), rewardsCard.toJSON())
                expect(rewardsCard.get).toHaveBeenCalledWith('purchases');
                expect(rewardsCard.set).toHaveBeenCalledWith('purchases', rewardsCard.get('purchases'));

                //check visits
                // rewardsCard.updateRewardsType('visits');

                // expect(rewardsCard.get).toHaveBeenCalledWith('visits');
                // expect(rewardsCard.set).toHaveBeenCalledWith('visits', rewardsCard.get('visits'));

                //check visits
                // rewardsCard.updateRewardsType('visits');

                // expect(rewardsCard.get).toHaveBeenCalledWith('points');
                // expect(rewardsCard.set).toHaveBeenCalledWith('points', rewardsCard.get('points'));
            });

            // it('`rewardType` parameter value is one of "purchases", "visits", "points"`, `data` is simple object', function() {
            //     var data = {
            //         rewards_earned: 2,
            //         discount: 12,
            //         point_to_next_reward: 4,
            //         value: 2
            //     }

            //     // check purchases
            //     rewardsCard.updateRewardsType('purchases', data);
            //     var purchases = this.get('purchases');

            //     expect(purchases instanceof App.Models.Rewards).toBe(true);
            //     expect(rewardsCard.set).toHaveBeenCalled();
            //     expect(purchases.toJSON()).toEqual(data);

            //     // check visits
            //     rewardsCard.updateRewardsType('visits', data);
            //     var visits = this.get('visits');

            //     expect(visits instanceof App.Models.Rewards).toBe(true);
            //     expect(rewardsCard.set).toHaveBeenCalled();
            //     expect(visits.toJSON()).toEqual(data);

            //     // check points
            //     rewardsCard.updateRewardsType('points', data);
            //     var points = this.get('points');

            //     expect(points instanceof App.Models.Rewards).toBe(true);
            //     expect(rewardsCard.set).toHaveBeenCalled();
            //     expect(points.toJSON()).toEqual(data);
            // });
        });
    });
});
define(['stanfordcard', 'js/utest/data/StanfordCard'], function(stanfordcard, data) {
    'use strict';

    describe("App.Models.StanfordCardPlan", function() {
        var plan;

        beforeEach(function() {
            plan = new App.Models.StanfordCardPlan();
        });

        it('Environment', function() {
            expect(App.Models.StanfordCardPlan).toBeDefined();
        });

        it('Create model', function() {
            expect(plan.toJSON()).toEqual(data.PLAN_DEFAULT);
        });
    });

    describe("App.Collections.StanfordCardPlans", function() {
        var plans;

        beforeEach(function() {
            plans = new App.Collections.StanfordCardPlans([data.PLAN_1, data.PLAN_2]);
        });

        it('Environment', function() {
            expect(App.Models.StanfordCardPlan).toBeDefined();
        });

        it('Create model', function() {
            expect(plans.model).toBe(App.Models.StanfordCardPlan);
        });

        it('initialize()', function() {
            spyOn(plans, 'listenTo');
            plans.initialize();
            expect(plans.listenTo).toHaveBeenCalledWith(plans, 'change:selected',  plans.unselect, plans);
        });

        describe('unselect(model, value)', function() {
            it('value is false', function() {
                spyOn(plans, 'each');
                plans.unselect(plans.at(0), false);
                expect(plans.each).not.toHaveBeenCalled();
            });

            it('value is true', function() {
                var plan1 = plans.at(0),
                    plan2 = plans.at(1);

                plan1.set('selected', true, {silent: true})
                spyOn(plan1, 'set').and.callFake(set.bind(plan1));
                spyOn(plan2, 'set').and.callFake(set.bind(plan2));
                plans.unselect(plan2, true);

                expect(plan2.set).not.toHaveBeenCalled();
                expect(plan1.set).toHaveBeenCalledWith('selected', false);
                expect(plan1.get('selected')).toBe(false);

                function set() {
                    return Backbone.Model.prototype.set.apply(this, arguments);
                }
            });
        });
    });

    describe("App.Models.StanfordCard", function() {
        var card;

        beforeEach(function() {
            card = new App.Models.StanfordCard();
        });

        it('Environment', function() {
            expect(App.Models.StanfordCard).toBeDefined();
        });

        it('Create model', function() {
            expect(card.defaults).toEqual(data.CARD_DEFAULT);
        });

        describe('initialize()', function() {
            beforeEach(function() {
                spyOn(card, 'get').and.callFake(function() {
                    return Backbone.Model.prototype.get.apply(card, arguments);
                });

                spyOn(card, 'set').and.callFake(function() {
                    return Backbone.Model.prototype.set.apply(card, arguments);
                });

                spyOn(card, 'listenTo');
            });

            it('`plans` is an instance of App.Collections.StanfordCardPlans', function() {
                var plans = new App.Collections.StanfordCardPlans([data.PLAN_1, data.PLAN_2]);

                // directly set to attributes to avoid fake 'set' spyOn calling
                card.attributes.plans = plans;
                card.initialize();

                commonExpectations(plans);
            });

            it('`plans` is not an instance of App.Collections.StanfordCardPlans and not an array', function() {
                var plans = 123;

                // directly set to attributes to avoid fake 'set' spyOn calling
                card.attributes.plans = plans;
                card.initialize();
                plans = card.attributes.plans;

                commonExpectations(plans);
                expect(plans instanceof App.Collections.StanfordCardPlans).toBe(true);
                expect(plans.length).toBe(0);
            });

            it('`plans` is an array', function() {
                var plansData = [data.PLAN_1, data.PLAN_2],
                    plans;

                // directly set to attributes to avoid fake 'set' spyOn calling
                card.attributes.plans = plansData;
                card.initialize();
                plans = card.attributes.plans;

                commonExpectations(plans);
                expect(plans instanceof App.Collections.StanfordCardPlans).toBe(true);
                expect(plans.at(0).toJSON()).toEqual(plansData[0]);
                expect(plans.at(1).toJSON()).toEqual(plansData[1]);
            });

            function commonExpectations(plans) {
                expect(card.get).toHaveBeenCalledWith('plans');
                expect(card.set).toHaveBeenCalledWith('plans', plans);
                expect(card.listenTo).toHaveBeenCalledWith(plans, 'change:selected', card.updatePlanId, card);
                expect(card.listenTo).toHaveBeenCalledWith(card, 'change:validated', card.doNotAskStudentStatus, card);
            }
        });

        describe('updatePlanId()', function() {
            var plans, selected;

            beforeEach(function() {
                selected = [];
                plans = new App.Collections.StanfordCardPlans([data.PLAN_1, data.PLAN_2]);
                card.set('plans', plans);

                spyOn(card, 'getSelectedPlan').and.callFake(function() {
                    return selected;
                });

                spyOn(card, 'selectFirstAvailablePlan').and.callFake(function() {
                    return selected;
                });

                spyOn(card, 'get').and.callFake(function() {
                    return Backbone.Model.prototype.get.apply(card, arguments);
                });

                spyOn(card, 'set').and.callFake(function() {
                    return Backbone.Model.prototype.set.apply(card, arguments);
                });
            });

            it('no plan is selected', function() {
                selected = undefined;
                card.updatePlanId();
                
                expect(card.getSelectedPlan).toHaveBeenCalled();
                expect(card.selectFirstAvailablePlan).toHaveBeenCalled();
                expect(card.set).toHaveBeenCalledWith('planId', null);
            });

            it('a plan is selected', function() {
                selected = plans.at(1);
                card.updatePlanId();

                expect(card.getSelectedPlan).toHaveBeenCalled();
                expect(card.selectFirstAvailablePlan).not.toHaveBeenCalled();
                expect(card.set).toHaveBeenCalledWith('planId', plans.at(1).get('id'));
            });
        });

        it('reset()', function() {
            card.set(_.extend(data.CARD_1, {
                plans: new App.Collections.StanfordCardPlans([data.PLAN_1, data.PLAN_2])
            }));
            card.reset();

            var result = card.toJSON();
            expect(result.number).toBe(data.CARD_DEFAULT.number);
            expect(result.planId).toBe(data.CARD_DEFAULT.planId);
            expect(result.captchaValue).toBe(data.CARD_DEFAULT.captchaValue);
            expect(result.captchaImage).toBe(data.CARD_DEFAULT.captchaImage);
            expect(result.captchaKey).toBe(data.CARD_DEFAULT.captchaKey);
            expect(result.validated).toBe(data.CARD_DEFAULT.validated);
            expect(result.plans.length).toBe(0);
        });

        describe('getPlans()', function() {
            var ajax, ajaxData, ajaxOpts, result;

            beforeEach(function() {
                card = new App.Models.StanfordCard(data.CARD_1);
                ajax = Backbone.$.Deferred();
                result = Backbone.$.Deferred();

                spyOn(Backbone.$, 'ajax').and.callFake(function(opts) {
                    ajaxOpts = opts;
                    ajax.always(result.resolve.bind(result));
                    ajax.done(opts.success.bind(window, ajaxData));
                    return ajax
                });

                spyOn(Backbone.$, 'Deferred').and.callFake(function() {
                    return result;
                });

                spyOn(card, 'trigger').and.callFake(function() {
                    return Backbone.Model.prototype.trigger.apply(card, arguments);
                });

                spyOn(card, 'selectFirstAvailablePlan').and.callFake(function() {
                    return;
                });               

                spyOn(card.get('plans'), 'reset').and.callFake(function() {
                    return Backbone.Collection.prototype.reset.apply(card.get('plans'), arguments);
                });

                spyOn(card, 'set').and.callFake(function() {
                    return Backbone.Model.prototype.set.apply(card, arguments);
                });
            });

            it('`number` type is not string', function() {
                card.set('number', 123123);
                abortAjaxRequest();
            });

            it('`number` is empty string', function() {
                card.set('number', '');
                abortAjaxRequest();
            });

            it('`number` is valid, `captchaKey` is invalid', function() {
                card.set('captchaKey', '');
                abortAjaxRequest();
            });

            it('`number` is valid, `captchaKey` is valid, `captchaValue` is invalid', function() {
                card.set('captchaValue', '');
                abortAjaxRequest();
            });

            it('request failed', function() {
                card.getPlans();
                ajax.reject();

                checkAjaxParams();
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(result.state()).toBe('resolved');
            });

            it('request is successful, data.status is "OK", data.data is not an array', function() {
                ajaxData = _.clone(data.RESPONSE_1);
                card.getPlans();
                ajax.resolve();

                checkAjaxParams();
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(result.state()).toBe('resolved');
                expect(card.trigger).toHaveBeenCalledWith('onStanfordCardError', undefined);
            });

            it('request is successful, data.status is "OK", data.data is an empty array', function() {
                ajaxData = _.clone(data.RESPONSE_2);
                card.getPlans();
                ajax.resolve();

                checkAjaxParams();
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(result.state()).toBe('resolved');
                expect(card.trigger).toHaveBeenCalledWith('onStanfordCardError', _loc.STANFORD_NO_PLANS);
                expect(card.get('plans').reset).toHaveBeenCalled();
                expect(card.set).toHaveBeenCalledWith('validated', true);
            });

            it('request is successful, data.status is "OK", data.data is an array with items', function() {
                ajaxData = _.extend({}, data.RESPONSE_2, {data: [data.PLAN_1, data.PLAN_2]});
                card.getPlans();
                ajax.resolve();

                checkAjaxParams();
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(result.state()).toBe('resolved');
                expect(card.get('plans').reset).toHaveBeenCalledWith(ajaxData.data);
                expect(card.selectFirstAvailablePlan).toHaveBeenCalled();
                expect(card.set).toHaveBeenCalledWith('validated', true);
            });

            it('request is successful, data.status is "ERROR"', function() {
                ajaxData = _.clone(data.RESPONSE_1);
                card.getPlans();
                ajax.resolve();

                checkAjaxParams();
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(result.state()).toBe('resolved');
                expect(card.trigger).toHaveBeenCalledWith('onStanfordCardError', ajaxData.errorMsg);
            });

            function abortAjaxRequest() {
                card.getPlans();
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
                expect(result.state()).toBe('resolved');
            }

            function checkAjaxParams() {
                var _data = JSON.parse(ajaxOpts.data);
                expect(ajaxOpts.url).toBe(data.API.url);
                expect(ajaxOpts.type).toBe(data.API.type);
                expect(ajaxOpts.dataType).toBe(data.API.dataType);
                expect(_data.establishment).toBe(App.Data.settings.get('establishment'));
                expect(_data.number).toBe(card.get('number'));
                expect(_data.captchaKey).toBe(card.get('captchaKey'));
                expect(_data.captchaValue).toBe(card.get('captchaValue'));
            }
        });

        describe('getSelectedPlan()', function() {
            var plans;

            beforeEach(function() {
                plans = new App.Collections.StanfordCardPlans([data.PLAN_1, data.PLAN_2]);
                card.set('plans', plans);
            });

            it('no plan is selected', function() {
                var plan1 = plans.at(0),
                    plan2 = plans.at(1);
                plan1.set('selected', false);
                plan2.set('selected', false);
                expect(card.getSelectedPlan()).toBe(undefined);
            });

            it('a plan is selected', function() {
                var plan1 = plans.at(0),
                    plan2 = plans.at(1);
                plan1.set('selected', false);
                plan2.set('selected', true);
                expect(card.getSelectedPlan()).toBe(plan2);
            });
        });

        describe('updatePlans(data)', function() {
            it('data is not an array', function() {
                var plans = card.get('plans');
                spyOn(plans, 'set');
                card.updatePlans();
                expect(plans.set).not.toHaveBeenCalled();
            });

            it('data is an array', function() {
                card.updatePlans([data.PLAN_1, data.PLAN_2]);
                expect(card.get('plans').at(0).toJSON()).toEqual(data.PLAN_1);
                expect(card.get('plans').at(1).toJSON()).toEqual(data.PLAN_2);
            });
        });

        describe('doNotAskStudentStatus(model, value)', function() {
            beforeEach(function() {
                spyOn(card, 'set');
            });

            it('model is valid, value is false', function() {
                card.doNotAskStudentStatus(card, false);
                expect(card.set).not.toHaveBeenCalled();
            });

            it('model is valid, value is true', function() {
                card.doNotAskStudentStatus(card, true);
                expect(card.set).toHaveBeenCalledWith('needToAskStudentStatus', false);
            });

            it('model is invalid', function() {
                card.doNotAskStudentStatus();
                expect(card.set).toHaveBeenCalledWith('needToAskStudentStatus', false);
            });
        });

        it('saveCard()', function() {
            var _data, _key;
            spyOn(window, 'setData').and.callFake(function(key, data) {
                _data = data;
                _key = key;
            });
            card.saveCard();

            expect(window.setData).toHaveBeenCalled();
            expect(_key).toBe('stanfordcard');
            expect(_data).toEqual(_.extend(card.toJSON(), {
                plans: card.get('plans').toJSON()
            }));
        });

        describe('restoreCard()', function() {
            var storageData, plans;

            beforeEach(function() {
                plans = card.get('plans');
                storageData = null;

                spyOn(window, 'getData').and.callFake(function() {
                    return storageData;
                });

                spyOn(card, 'set').and.callFake(function() {
                    return Backbone.Model.prototype.set.apply(card, arguments);
                });

                spyOn(plans, 'reset');
            });

            it('storage data is null', function() {
                card.restoreCard();

                expect(window.getData).toHaveBeenCalledWith('stanfordcard');
                expect(card.set).not.toHaveBeenCalled();
                expect(plans.reset).not.toHaveBeenCalled();
            });

            it('storage data is literal object, plans is not an array', function() {
                storageData = {
                    number: '213234',
                    plans: null,
                    planId: null,
                    validated: true,
                    needToAskStudentStatus: false
                }
                card.restoreCard();

                expect(window.getData).toHaveBeenCalledWith('stanfordcard');
                expect(card.set).toHaveBeenCalled();
                expect(card.get('plans')).toBe(plans);
                expect(plans.reset).not.toHaveBeenCalled();
            });

            it('storage data is literal object, plans is an array', function() {
                var plansArray = [];
                storageData = {
                    number: '213234',
                    plans: plansArray,
                    planId: null,
                    validated: true,
                    needToAskStudentStatus: false
                }
                card.restoreCard();

                expect(window.getData).toHaveBeenCalledWith('stanfordcard');
                expect(card.set).toHaveBeenCalled();
                expect(card.get('plans')).toBe(plans);
                expect(plans.reset).toHaveBeenCalledWith(plansArray);
            });
        });
    });
});
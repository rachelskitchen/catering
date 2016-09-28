define(['tip'], function() {
    'use strict';

    describe('App.Models.Tip', function() {
        var def, model;

        beforeEach(function() {

            model = new App.Models.Tip();
            spyOn(window, "getData");
            spyOn(window, "setData");

            def = {
                type: false, // tip in cash (false) or credit card (true)
                amount: true, // true - %, false - $
                percents : [10,15,20], // percent variant
                sum : 0, // sum if amount false
                percent : 0, // percent if amount true
                tipTotal: 0, // the result tip amount
                subtotal: 0, // last applied subtotal
                discounts: 0,
                serviceFee: 0
            };
        });

        it('Environment', function() {
            expect(App.Models.Tip).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        it('initialize()', function() {
            spyOn(App.Models.Tip.prototype, 'listenTo').and.callThrough();
            var model = new App.Models.Tip();
            expect(App.Models.Tip.prototype.listenTo).toHaveBeenCalledWith(model, 'change', model.update_tip, model);
        });

        it('update_tip()', function() {
            var subtotal = 12,
                tip = 1;

            spyOn(model, 'set').and.callThrough();
            spyOn(model, 'get_tip').and.returnValue(tip);
            spyOn(model, 'get').and.returnValue(subtotal);

            model.update_tip();

            expect(model.get).toHaveBeenCalledWith('subtotal');
            expect(model.get_tip).toHaveBeenCalledWith(subtotal);
            expect(model.set).toHaveBeenCalledWith('tipTotal', tip);
        });

        describe('get_tip()', function() {
            var subtotalValue = 185,
                discountsValue = 20,
                serviceFeeValue = 5;
                // total is 185 + 20 - 5 = 200

            beforeEach(function() {
                model.set({
                    discounts: discountsValue,
                    serviceFee: serviceFeeValue
                });
            });

            it('`type` is false (tips in cash)', function() {
                expect(model.get_tip(subtotalValue)).toBe(0);
            });

            it('`type` is true, `amount` is true', function() {
                model.set({type: true, percent: 25, amount: true});
                expect(model.get_tip(subtotalValue)).toBe(50);
            });

            it('`type is true, `amount` is false', function() {
                model.set({type: true, amount: false, sum: 12});
                expect(model.get_tip(subtotalValue)).toBe(12);
            });
        });

        it('empty()', function() {
            model.set({
                type: true,
                amount: false,
                percents: [10],
                sum : 10,
                percent : 20
            });
            model.empty();
            expect(model.toJSON()).toEqual(def);
        });

        it('saveTip()', function() {
            model.saveTip();
            expect(setData).toHaveBeenCalledWith('tip', model);
        });

        it('loadTip()', function() {
            model.loadTip();
            expect(getData).toHaveBeenCalledWith('tip');
        });

        it('get_discounts_str()', function() {
            model.set('discounts', 12);
            expect(model.get_discounts_str()).toBe('12.00');
        });

        it('get_service_fee_str()', function() {
            model.set('serviceFee', 12);
            expect(model.get_service_fee_str()).toBe('12.00');
        });
    });
});
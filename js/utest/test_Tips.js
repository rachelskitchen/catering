define(['tip'], function() {
    'use strict';

    describe('App.Models.Tip', function() {
        var model, def;

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
                tipTotal: 0
            };
        });

        it('Environment', function() {
            expect(App.Models.Tip).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        describe('get_tip()', function() {
            it('`type` is false (tips in cash)', function() {
                expect(model.get_tip(12)).toBe(0);
            });

            it('`type` is true, `amount` is true', function() {
                model.set({type: true, percent: 25, amount: true});
                expect(model.get_tip(200)).toBe(50);
            });

            it('`type is true, `amount` is false', function() {
                model.set({type: true, amount: false, sum: 12});
                expect(model.get_tip(200)).toBe(12);
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
    });
});
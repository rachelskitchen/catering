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

        it('change:is_applied event', function() {
            debugger;
            model.collection = new Backbone.Collection();
            spyOn(model.collection, 'trigger');
            App.Data.myorder.checkout = new Backbone.Model();
            App.Data.myorder.get_cart_totals = jasmine.createSpy();

            model.set({
                code: '123',
                is_applied: true
            });

            expect(model.collection.trigger).toHaveBeenCalledWith('onPromotionApply');
            expect(App.Data.myorder.checkout.get('discount_code')).toBe('123');
            expect(App.Data.myorder.get_cart_totals).toHaveBeenCalledWith({apply_discount: true});
        });
    });

    describe('App.Collections.Promotions', function() {
        var collection;

        beforeEach(function() {
            collection = new App.Collections.Rewards();
        });

        it('Environment', function() {
            expect(App.Collections.Promotions).toBeDefined();
        });

        it('Create collection', function() {
            collection = new App.Collections.Promotions({name: 'test', code: '123'});
            expect(collection.models[0] instanceof App.Models.Promotion).toBe(true);
        });

        it('initialize()', function() {
            App.Data.myorder = new Backbone.Model();
            collection = new App.Collections.Rewards();
            App.Data.myorder.trigger('add');
            expect(collection.needToUpdate).toBe(true);
        });

    });

});

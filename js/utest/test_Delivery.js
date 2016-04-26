define(['delivery'], function() {
    describe("App.Models.Delivery", function() {
        
        var model, def, opts, set;
        
        beforeEach(function() {
            model = new App.Models.Delivery();
            this.settings = App.Data.settings.get('settings_system');
            def = {
                charge: 0,
                charges: null, // delivery cost
                enable: false, // enable delivery for online ordering apps
                max_distance: 0, // delivery max distance
                min_amount: 0 // min total amount for delivery enable. Only sum of products and modifiers
            },
            opts = {
                charge: 5,
                charges: [{
                    amount: 5,
                    max_threshold: null,
                    min_threshold: 0,
                    type: 0
                }, {
                    amount: 0,
                    max_threshold: null,
                    min_threshold: 20,
                    type: 0
                }],
                enable: false,
                max_distance: 0,
                min_amount: 1
            },
            set = {
                charge: 5,
                charges: [{
                    amount: 5,
                    max_threshold: null,
                    min_threshold: 0,
                    type: 0
                }, {
                    amount: 0,
                    max_threshold: null,
                    min_threshold: 20,
                    type: 0
                }, {
                    amount: 10,
                    max_threshold: 40,
                    min_threshold: 20,
                    type: 1
                }],
                enable: true,
                max_distance: 2,
                min_amount: 3                
            };
        });
        
        afterEach(function() {
            App.Data.settings.set('settings_system', this.settings);
        });

        it('Environment', function() {
            expect(App.Models.Delivery).toBeDefined();
        });

        it('Create model with undefined settings_system', function() {
            App.Data.settings.get('settings_system').delivery_charge = undefined;
            App.Data.settings.get('settings_system').delivery_for_online_orders = undefined;
            App.Data.settings.get('settings_system').max_delivery_distance = undefined;
            App.Data.settings.get('settings_system').min_delivery_amount = undefined;
            model = new App.Models.Delivery();
            expect(model.toJSON()).toEqual(def);
        });

        it('Create model with undefined settings_system and opts', function() {
            App.Data.settings.get('settings_system').delivery_charge = undefined;
            App.Data.settings.get('settings_system').delivery_for_online_orders = undefined;
            App.Data.settings.get('settings_system').max_delivery_distance = undefined;
            App.Data.settings.get('settings_system').min_delivery_amount = undefined;
            model = new App.Models.Delivery(opts);
            expect(model.toJSON()).toEqual(opts);
        });

        it('Create model with settings_system without opts', function() {
            model = new App.Models.Delivery();
            expect(model.toJSON()).toEqual(def);
        });

        it('Create model with settings_system and with opts', function() {
            model = new App.Models.Delivery(opts);
            expect(model.toJSON()).toEqual(opts);
        });

        describe('getCharge()', function() {
            it('`enable` is false', function() {
                expect(model.getCharge()).toBe(0);
            });

            it('`enable` is true', function() {
                model.set(set);
                expect(model.getCharge()).toBe(5);
            });
        });

        describe('getRemainingAmount', function() {
            it('`enable` is false', function() {
                expect(model.getRemainingAmount()).toBeNull();
            });

            it('`enable` is true', function() {
                model.set(set);
                expect(model.getRemainingAmount(7)).toBe(1); // 3 - (7 - 5) = 1

                model.set(set);
                expect(model.getRemainingAmount(50)).toBe(-47); // 3 - (50 - 0) = -47

                model.set(set);
                expect(model.getRemainingAmount(30)).toBe(-24); // 3 - (30 - 30/100*10) = -24
            });
        });
    });
});
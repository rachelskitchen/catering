define(['delivery'], function() {
    describe("App.Models.Delivery", function() {
        
        var model, def, opts, set;
        
        beforeEach(function() {
            model = new App.Models.Delivery();
            this.settings = App.Data.settings.get('settings_system');
            def = {
                charge: 0, // delivery cost
                enable: false, // enable delivery for online ordering apps
                max_distance: 0, // delivery max distance
                min_amount: 0 // min total amount for delivery enable. Only sum of products and modifiers
            },
            opts = {
                charge: 1,
                enable: false,
                max_distance: 0,
                min_amount: 1
            },
            set = {
                charge: 1,
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
                expect(model.getCharge()).toBe(1);
            });
        });

        describe('getRemainingAmount', function() {
            it('`enable` is false', function() {
                expect(model.getRemainingAmount()).toBeNull();
            });

            it('`enable` is true', function() {
                var subtotal = 2;
                model.set(set);
                expect(model.getRemainingAmount(subtotal)).toBe(2); // 4 - (3 - 1) = 2
            });
        });
    });
});
define(['checkout'], function() {
    describe("App.Models.Checkout", function() {

        var model, def;

        beforeEach(function() {
            model = new App.Models.Checkout();
            spyOn(window, "getData");
            spyOn(window, "setData");
            def = {
                img : App.Data.settings.get("img_path"),
                pickupTime : '',
                pickupTS: null,
                isPickupASAP: false,
                special : '',
                section : "",
                row : "",
                seat : "",
                email : "",
                level: "",
                dining_option: '',
                rewardCard: '',
                selected_dining_option: '',
                notes : ''
            };
        });

        it('Environment', function() {
            expect(App.Models.Checkout).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        // App.Models.Customer function saveCheckout
        it('Function saveCheckout', function() {
            model.saveCheckout(); // save current state model in storage (detected automatic)
            expect(setData).toHaveBeenCalledWith('checkout', model);
        });

        // App.Models.Customer function loadCheckout
        it('Function loadCheckout', function() {
            model.loadCheckout(); // load state model from storage (detected automatic)
            expect(getData).toHaveBeenCalledWith('checkout');
        });
        
        it('Function revert_dining_option', function() {
            model.set('selected_dining_option', '');
            model.revert_dining_option();
            expect(model.get('dining_option', 'DINING_OPTION_TOGO'));
            
            model.set('selected_dining_option', 'test');
            model.revert_dining_option();
            expect(model.get('dining_option', 'test'));
        });

        it('dining_option changed on "DINING_OPTION_ONLINE"', function() {
            var prev = model.get('dining_option'),
                dining_option = 'test';
            model.set('dining_option', dining_option);
            model.set('dining_option', 'DINING_OPTION_ONLINE')
            expect(model.get('selected_dining_option')).toBe(dining_option);
            model.set('dining_option', prev);
        });

        // App.Models.Customer function loadCheckout
        describe('Function check', function() {

            beforeEach(function() {
                this.skin = App.Data.settings.get('skin');
            });

            afterEach(function() {
                App.Data.settings.set('skin', this.skin);
            });

            it('skin mlb', function() {
                App.Data.settings.set('skin', 'mlb');

                expect(model.check().errorMsg.indexOf('Section')).not.toBe(-1);

                model.set('section', '123R');
                expect(model.check().errorMsg.indexOf('Section')).toBe(-1);

                expect(model.check().errorMsg.indexOf('Row')).not.toBe(-1);

                model.set('row', '123');
                expect(model.check().errorMsg.indexOf('Row')).toBe(-1);

                expect(model.check().errorMsg.indexOf('Seat')).not.toBe(-1);

                model.set('seat', '123');
                expect(model.check().status).toBe('OK');
            });

            it('skin paypal not order from seat', function() {
                App.Data.settings.set('skin', 'paypal');

                expect(model.check().errorMsg.indexOf(MSG.ERROR_STORE_IS_CLOSED)).not.toBe(-1);

                model.set('pickupTS', 123457);
                expect(model.check().status).toBe('OK');
            });

            it('skin paypal order from seat dining', function() {
                App.Data.settings.set('skin', 'paypal');
                this.seat = App.Data.orderFromSeat;
                App.Data.orderFromSeat = {};
                model.set('dining_option', 'DINING_OPTION_DELIVERY_SEAT');

                expect(model.check().errorMsg.indexOf('Seat')).not.toBe(-1);
                expect(model.check().status).toBe('ERROR_EMPTY_FIELDS');
                expect(Array.isArray(model.check().errorList)).toBe(true);

                model.set('seat', '123');
                expect(model.check().status).toBe('OK');

                App.Data.orderFromSeat.enable_sector = true;
                expect(model.check().errorMsg.indexOf('Section')).not.toBe(-1);

                model.set('section', '123');
                expect(model.check().status).toBe('OK');

                App.Data.orderFromSeat.enable_row = true;
                expect(model.check().errorMsg.indexOf('Row')).not.toBe(-1);

                model.set('row', '123');
                expect(model.check().status).toBe('OK');

                App.Data.orderFromSeat.enable_level = true;
                expect(model.check().errorMsg.indexOf('Level')).not.toBe(-1);

                model.set('level', '123');
                expect(model.check().status).toBe('OK');

                App.Data.orderFromSeat = this.seat;
            });

            it('skin dining option online', function() {
                App.Data.settings.set('skin', 'weborder');
                model.set('dining_option', 'DINING_OPTION_ONLINE');

                expect(model.check().status).toBe('OK');
            });

            it('skin weborder', function() {
                App.Data.settings.set('skin', 'weborder');

                expect(model.check().errorMsg.indexOf(MSG.ERROR_STORE_IS_CLOSED)).not.toBe(-1);

                model.set('pickupTS', 123457);
                expect(model.check().status).toBe('OK');
            });

            it('skin weborder_mobile', function() {
                App.Data.settings.set('skin', 'weborder_mobile');

                expect(model.check().errorMsg.indexOf(MSG.ERROR_STORE_IS_CLOSED)).not.toBe(-1);

                model.set('pickupTS', 123457);
                expect(model.check().status).toBe('OK');
            });
        });
    });
});
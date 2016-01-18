define(['checkout'], function() {
    'use strict';

    describe("App.Models.Checkout", function() {

        var model, def,
            settings;

        beforeEach(function() {
            model = new App.Models.Checkout();
            settings = App.Data.settings;
            this.skin = settings.get('skin');
            spyOn(window, "getData");
            spyOn(window, "setData");
            def = {
                img: settings.get('img_path'),
                pickupTime: '',
                pickupTS: null,
                isPickupASAP: false,
                special: '',
                section: '',
                row: '',
                seat: '',
                level: '',
                email: '',
                rewardCard: '',
                dining_option: '',
                selected_dining_option: '',
                other_dining_options: new App.Collections.DiningOtherOptions( App.Settings.other_dining_option_details ),
                notes : '',
                discount_code: '',
                last_discount_code: ''
            };
        });

        afterEach(function() {
            settings.set('skin', this.skin);
        });

        it('Environment', function() {
            expect(App.Models.Checkout).toBeDefined();
        });

        it('Create model', function() {
            var modelJson = model.toJSON();
            expect(modelJson.other_dining_options instanceof App.Collections.DiningOtherOptions).toBe(true);
            modelJson.other_dining_options = def.other_dining_options;
            expect(modelJson).toEqual(def);
        });

        // App.Models.Customer function saveCheckout
        it('saveCheckout()', function() {
            model.saveCheckout(); // save current state model in storage (detected automatic)
            expect(setData).toHaveBeenCalledWith('checkout', model);
        });

        // App.Models.Customer function loadCheckout
        it('loadCheckout()', function() {
            model.loadCheckout(); // load state model from storage (detected automatic)
            expect(getData).toHaveBeenCalledWith('checkout');
        });

        it('revert_dining_option()', function() {
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
        describe('check()', function() {

            it('isStoreClosed', function() {
                spyOn(model, 'isStoreClosed').and.returnValue('checkOrderFromSeat');
                spyOn(model, 'checkOrderFromSeat');
                spyOn(model, 'checkOtherDiningOptions');

                expect(model.check()).toBe('checkOrderFromSeat');
            });

            it('checkOrderFromSeat', function() {
                spyOn(model, 'isStoreClosed');
                spyOn(model, 'checkOrderFromSeat').and.returnValue('checkOrderFromSeat');
                spyOn(model, 'checkOtherDiningOptions');

                expect(model.check()).toBe('checkOrderFromSeat');
            });

            it('checkOtherDiningOptions', function() {
                spyOn(model, 'isStoreClosed');
                spyOn(model, 'checkOrderFromSeat');
                spyOn(model, 'checkOtherDiningOptions').and.returnValue('checkOtherDiningOptions');

                expect(model.check()).toBe('checkOtherDiningOptions');
            });

            it('OK', function() {
                spyOn(model, 'isStoreClosed');
                spyOn(model, 'checkOrderFromSeat');
                spyOn(model, 'checkOtherDiningOptions');

                expect(model.check()).toEqual({ status : 'OK' });
            });

        });

        describe('isStoreClosed()', function() {
            var skinBackup;

            beforeEach(function() {
                skinBackup = App.Skin;
            });

            afterEach(function() {
                App.Skin = skinBackup;
            });

            it('skin is retail', function() {
                App.skin = App.Skins.RETAIL;
                expect(model.isStoreClosed()).toBe(false);
            });

            it('skin isn\`t retail', function() {
                App.skin = App.Skins.PAYPAL;
                expect(model.isStoreClosed().errorMsg.indexOf(MSG.ERROR_STORE_IS_CLOSED)).not.toBe(-1);

                model.set('pickupTS', 123457);
                expect(model.isStoreClosed()).toBeUndefined();
            });

            it('dining option online', function() {
                settings.set('skin', 'weborder');
                model.set('dining_option', 'DINING_OPTION_ONLINE');

                expect(model.isStoreClosed()).toBeUndefined();
            });
        });

        describe('checkOtherDiningOptions()', function() {
            it('`dining_option` isn\'t DINING_OPTION_OTHER', function() {
                expect(model.checkOtherDiningOptions()).toBeUndefined();
            });

            it('`dining_option` is DINING_OPTION_OTHER, `other_dining_options` are present', function() {
                model.set('dining_option', 'DINING_OPTION_OTHER');
                var other_dining_options = [
                    {
                        choices: "1,2,3,4,5",
                        name: "Level"
                    },
                    {
                        choices: "A,B,C,D,E",
                        name: "Section"
                    }
                ];
                model.set('other_dining_options', new App.Collections.DiningOtherOptions(other_dining_options));

                expect(model.checkOtherDiningOptions().errorMsg.indexOf('Level')).not.toBe(-1);
                expect(model.checkOtherDiningOptions().errorMsg.indexOf('Section')).not.toBe(-1);
            });
        });

        describe('isColdUntaxable()', function() {
            it('dining option isn\'t set', function() {
                expect(model.isColdUntaxable()).toBe(false);
            });

            it('dining option is To Go or Delivery or Catering', function() {
                var dining_options = [
                    'DINING_OPTION_TOGO',
                    'DINING_OPTION_DELIVERY',
                    'DINING_OPTION_SHIPPING',
                    'DINING_OPTION_CATERING'
                ],
                    delivery_cold_untaxed = App.Settings.delivery_cold_untaxed;
                App.Settings.delivery_cold_untaxed = true;

                $.each(dining_options, function(index, dining_option) {
                    model.set('dining_option', dining_option);
                    expect(model.isColdUntaxable()).toBe(true);
                });
                App.Settings.delivery_cold_untaxed = delivery_cold_untaxed;
            });
        });

        it('isDiningOptionOnline()', function() {
            model.set('dining_option', '');
            expect(model.isDiningOptionOnline()).toBe(false);

            model.set('dining_option', 'DINING_OPTION_ONLINE');
            expect(model.isDiningOptionOnline()).toBe(true);
        });

        describe('App.Collections.DiningOtherOptions', function() {
            it('initialize()', function() {
                var choices = '1,2,3,4,5',
                    collection = new App.Collections.DiningOtherOptions({choices: choices}),
                    model = collection.models[0];

                expect(model.get('choices')).toEqual(choices.split(','));
            });

            it('reset()', function() {
                var collection = new App.Collections.DiningOtherOptions({value: 'value is set'}),
                    model = collection.models[0];
                model.reset();
                expect(model.get('value')).toBeFalsy();
            });
        });

    });
});
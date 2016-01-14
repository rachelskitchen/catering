define(['giftcard'], function() {
    'use strict';

    describe("App.Models.GiftCard", function() {
        var model, def,
            locale = App.Data.locale.toJSON(),
            spyGetData;

        beforeEach(function() {
            model = new App.Models.GiftCard();
            def = {
                captchaImage: '',
                captchaKey: '',
                captchaValue: '',
                cardNumber: '',
                storageKey: 'giftcard'
            };

            spyOn(window, 'setData');
            spyGetData = spyOn(window, 'getData');
        });

        it('Environment', function() {
            expect(App.Models.GiftCard).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        it('saveCard()', function() {
            model.saveCard();
            expect(window.setData).toHaveBeenCalledWith('giftcard', model);
        });

        it('loadCard()', function() {
            expect(model.loadCard().toJSON()).toEqual(def);
            expect(window.getData).toHaveBeenCalledWith('giftcard');
            expect(model.toJSON()).toEqual(def);

            spyGetData.and.returnValue({cardNumber: '12345'});
            expect(model.loadCard().toJSON().cardNumber).toBe('12345');
        });

        describe('check()', function() {
            var result;

            it('cardNumber is not set', function() {
                result = model.check();
                expect(result.status).not.toBe('OK');
                expect(result.errorMsg.indexOf(locale.GIFTCARD_NUMBER)).not.toBe(-1);
            });

            it('captchaValue is not set', function() {
                result = model.check();
                expect(result.status).not.toBe('OK');
                expect(model.check().errorMsg.indexOf(locale.GIFTCARD_CAPTCHA)).not.toBe(-1);
            });

            it('cardNumber and captchaValue are set', function() {
                model.set('cardNumber', '1234567812345678');
                model.set('captchaValue', 'captcha value');

                expect(model.check().status).toBe('OK');
            });
        });
    });
});
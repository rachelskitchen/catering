define(['card'], function() {
    'use strict';

    describe("App.Models.Card", function() {

        var model, def,
            locale = App.Data.locale.toJSON();

        beforeEach(function() {
            model = new App.Models.Card();
            spyOn(window, "getData");
            spyOn(window, "setData");
            def = {
                firstName: '',
                secondName: '',
                cardNumber: '',
                securityCode: '',
                expMonth: '01',
                expDate: new Date().getFullYear().toString(),
                expTotal: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                img: App.Data.settings.get('img_path')
            };
        });

        it('Environment', function() {
            expect(App.Models.Card).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        describe('trim()', function() {
            it('firstName and secondName are strings', function() {
                model.set({
                    firstName: ' first ',
                    secondName: ' second '
                });
                model.trim();

                expect(model.get('firstName')).toBe('first');
                expect(model.get('secondName')).toBe('second');
            });

            it('firstName and secondName are not strings', function() {
                model.set({
                    firstName: 123,
                    secondName: null
                });
                model.trim();

                expect(model.get('firstName')).toBe('');
                expect(model.get('secondName')).toBe('');
            });
        });

        it('saveCard()', function() {
            model.saveCard(); // save current state model in storage (detected automatic)
            expect(setData).toHaveBeenCalledWith('card', model);
        });

        it('empty_card_number()', function() {
            model.set({
                cardNumber: '4234567890123456',
                expDate: 2999,
                expMonth: 12,
                securityCode: '777'
            });
            model.empty_card_number(); // removing card information
            expect(model.toJSON()).toEqual(def);
        });

        it('loadCard()', function() {
            model.loadCard(); // load state model from storage (detected automatic)
            expect(getData).toHaveBeenCalledWith('card');
        });

        it('clearData()', function() {
            model.set({
                cardNumber: '4234567890123456',
                expDate: 2999,
                expMonth: 12,
                securityCode: '777'
            });
            model.clearData(); // removal of information about credit card
            expect(model.toJSON()).toEqual(def);
            expect(setData).toHaveBeenCalledWith('card', model);
        });

        describe("Functions check", function() {

            var payment = {};

            beforeEach(function() {
                spyOn(App.Data.settings, 'get_payment_process').and.returnValue(payment);
                payment.paypal = false;
                payment.paypal_direct_credit_card = false;
            });

            it("Card number", function() {
                // empty card number
                expect(model.check().errorMsg.indexOf(locale.CARD_NUMBER)).not.toBe(-1);
                expect(model.check().status).toBe('ERROR_EMPTY_FIELDS');
                expect(Array.isArray(model.check().errorList)).toBe(true);

                // incorrect first number
                model.set('cardNumber', '12345678901234567');
                expect(model.check().errorMsg.indexOf(locale.CARD_NUMBER)).not.toBe(-1);

                // valid card number
                model.set('cardNumber', '5555555555555555');
                expect(model.check().errorMsg.indexOf(locale.CARD_NUMBER)).toBe(-1);

                // very long card number
                model.set('cardNumber', '12345678901234567890');
                expect(model.check().errorMsg.indexOf(locale.CARD_NUMBER)).not.toBe(-1);

                // very short card number
                model.set('cardNumber', '123456789012');
                expect(model.check().errorMsg.indexOf(locale.CARD_NUMBER)).not.toBe(-1);
            });

            it("Security code", function() {
                // valid card number
                model.set('cardNumber', '5555555555555555');
                model.set('securityCode', '123');
                expect(model.check().errorMsg).toBeUndefined();

                model.set('securityCode', '1234');
                expect(model.check().errorMsg).toBeUndefined();

                model.set('securityCode', '12345');
                expect(model.check().errorMsg.indexOf(locale.CARD_SECURITY_CODE)).not.toBe(-1);

                model.set('securityCode', 'abc');
                expect(model.check().errorMsg.indexOf(locale.CARD_SECURITY_CODE)).not.toBe(-1);
            });

            it('Credit card payments', function() {
                this.skin = App.Data.settings.get('skin');
                App.Data.settings.set('skin', 'weborder');
                // not paypal direct credit card
                expect(model.check().errorMsg.indexOf(locale.CARD_FIRST_NAME)).toBe(-1);
                expect(model.check().errorMsg.indexOf(locale.CARD_LAST_NAME)).toBe(-1);

                // paypal direct credit card, but empty fields
                payment.paypal = true;
                payment.paypal_direct_credit_card = true;
                expect(model.check().errorMsg.indexOf(locale.CARD_FIRST_NAME)).not.toBe(-1);
                expect(model.check().errorMsg.indexOf(locale.CARD_LAST_NAME)).not.toBe(-1);

                // paypal direct credit card and not empty fields
                model.set({
                    firstName: 'first',
                    secondName: 'second'
                });
                expect(model.check().errorMsg.indexOf(locale.CARD_FIRST_NAME)).toBe(-1);
                expect(model.check().errorMsg.indexOf(locale.CARD_LAST_NAME)).toBe(-1);

                App.Data.settings.set('skin', this.skin);
            });

            it("Exp date", function() {
                model.set('cardNumber', '5555555555555555');
                model.set('securityCode', '444');

                // current month is not January
                // (card.expMonth is '01', card.expDate is the current year by default)
                if (new Date().getMonth() > 0) {
                    // empty month and year
                    expect(model.check().errorMsg.indexOf(MSG.ERROR_CARD_EXP)).not.toBe(-1);

                    // empty year
                    model.set('expMonth', '2');
                    expect(model.check().errorMsg.indexOf(MSG.ERROR_CARD_EXP)).not.toBe(-1);

                    // empty month
                    model.set('expDate', '2000');
                    expect(model.check().errorMsg.indexOf(MSG.ERROR_CARD_EXP)).not.toBe(-1);
                }

                // current month is January
                else {
                    // empty month and year
                    expect(model.check().errorMsg).toBeUndefined();

                    // empty year
                    model.set('expMonth', '2');
                    expect(model.check().errorMsg).toBeUndefined();
                }

                // early exp date
                model.set('expMonth', new Date().getMonth());
                model.set('expDate', new Date().getFullYear());
                expect(model.check().errorMsg.indexOf(MSG.ERROR_CARD_EXP)).not.toBe(-1);

                // correct date, everything is ok
                model.set('expMonth', new Date().getMonth() + 1);
                model.set('expDate', new Date().getFullYear());
                expect(model.check().status).toBe('OK');
            });

        });

    });
});
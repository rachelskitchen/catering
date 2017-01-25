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
                remainingBalance: null,
                selected: false,
                storageKey: 'giftcard',
                token: ''
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

        describe('linkToCustomer()', function() {
            var authHeader = { Authorization: 'Bearer XXX' },
                ajaxReq, ajaxParams;

            beforeEach(function() {
                model.set({
                    cardNumber: '1111222233334444',
                    captchaValue: 'Q1w23er',
                    captchaKey: 'supersecret'
                });

                ajaxReq = Backbone.$.Deferred();

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxParams = arguments[0];
                    ajaxReq.done(ajaxParams.success);
                    return ajaxReq;
                });
            });

            it('authorizationHeader is not passed', function() {
                expect(model.linkToCustomer()).not.toEqual(jasmine.any(Object));
            });

            it('authorizationHeader is not an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    expect(model.linkToCustomer(value)).not.toEqual(jasmine.any(Object));
                });
            });

            it('cardNumber is not set', function() {
                model.set('cardNumber', '');
                expect(model.linkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('captchaValue is not set', function() {
                model.set('captchaValue', '');
                expect(model.linkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('captchaKey is not set', function() {
                model.set('captchaKey', '');
                expect(model.linkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('request params are valid', function() {
                var req = model.linkToCustomer(authHeader);

                expect(req).toBe(ajaxReq);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(ajaxParams.url).toBe('/weborders/v1/giftcard/' + model.get('cardNumber') + '/link/');
                expect(ajaxParams.method).toBe('POST');
                expect(ajaxParams.headers).toBe(authHeader);
                expect(ajaxParams.dataType).toBe('json');
                expect(ajaxParams.contentType).toBe('application/json');
                expect(ajaxParams.data).toBe(JSON.stringify({
                    captchaValue: model.get('captchaValue')
                }));
                expect(ajaxParams.success).toEqual(jasmine.any(Function));
                expect(ajaxParams.error).toEqual(jasmine.any(Function));
            });

            it('request is successful, `data` is not an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    var req = model.linkToCustomer(authHeader);
                    ajaxReq.resolve(value);
                    expect(value).not.toBe(jasmine.any(Object));
                });
            });

            it('request is successful, `data` is object and `data.status` is `OK`', function() {
                var req = model.linkToCustomer(authHeader),
                    data = { status: 'OK', data: { token: 'sometoken' } };

                ajaxReq.resolve(data);
                expect(model.get('token')).toEqual(data.data.token);
            });

            it('request is successful, `data` is object and `data.status` is not `OK`', function() {
                var req = model.linkToCustomer(authHeader),
                    data = { status: 'ERROR' };

                ajaxReq.resolve(data);
                expect(model.get('token')).not.toBeTruthy();
            });
        });

        describe('unlinkToCustomer()', function() {
            var authHeader = { Authorization: 'Bearer XXX' },
                ajaxReq, ajaxParams;

            beforeEach(function() {
                model.set({
                    cardNumber: '1111222233334444'
                });

                ajaxReq = Backbone.$.Deferred();

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxParams = arguments[0];
                    ajaxReq.done(ajaxParams.success);
                    return ajaxReq;
                });
            });

            it('authorizationHeader is not passed', function() {
                expect(model.unlinkToCustomer()).not.toEqual(jasmine.any(Object));
            });

            it('authorizationHeader is not an object', function() {
                var values = ['a', '', -1, 0, 1, NaN, -Infinity, null, undefined, false, true];

                values.forEach(function(value) {
                    expect(model.unlinkToCustomer(value)).not.toEqual(jasmine.any(Object));
                });
            });

            it('cardNumber is not set', function() {
                model.set('cardNumber', '');
                expect(model.unlinkToCustomer(authHeader)).not.toEqual(jasmine.any(Object));
            });

            it('request params are valid', function() {
                var req = model.unlinkToCustomer(authHeader);

                expect(req).toBe(ajaxReq);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                expect(ajaxParams.url).toBe('/weborders/v1/giftcard/' + model.get('cardNumber') + '/unlink/');
                expect(ajaxParams.method).toBe('GET');
                expect(ajaxParams.headers).toBe(authHeader);
                expect(ajaxParams.success).toEqual(jasmine.any(Function));
                expect(ajaxParams.error).toEqual(jasmine.any(Function));
            });

            it('request is successful, `data.status` is `OK` and `this.collection` exists', function() {
                model.collection = new Backbone.Collection();
                model.collection.add(model);

                var req = model.unlinkToCustomer(authHeader),
                    data = { status: 'OK' };

                ajaxReq.resolve(data);
                expect(model.collection).not.toBeTruthy();
            });
        });

        describe('reset()', function() {
            it('Set values should be the same as defaults', function() {
                var defaults = model.defaults;
                model.reset();

                expect(model.get('cardNumber')).toEqual(defaults.cardNumber);
                expect(model.get('storageKey')).toEqual(defaults.storageKey);
                expect(model.get('remainingBalance')).toEqual(defaults.remainingBalance);
                expect(model.get('token')).toEqual(defaults.token);
                expect(model.get('selected')).toEqual(defaults.selected);
            });
        });
    });
});
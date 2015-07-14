define(['captcha'], function() {
    'use strict';

    describe("App.Models.Captcha", function() {
        var captcha, def;

        beforeEach(function() {
            captcha = new App.Models.Captcha();
            def = {
                captchaImage: '',
                captchaKey: '',
                captchaValue: ''
            };
        });

        it('Environment', function() {
            expect(App.Models.Captcha).toBeDefined();
        });

        it('Create model', function() {
            expect(captcha.toJSON()).toEqual(def);
        });

        it('loadCaptcha()', function() {
            var captchaData = {captcha_image: 'aaaaaa', captcha_key: 'bbbbbbbb'},
                URL = '/weborders/captcha/?establishment=' + App.Data.settings.get('establishment'),
                DATA = {},
                jsXHR, _url, _data;

            spyOn(Backbone.$, 'getJSON').and.callFake(function(url, data, cb) {
                jsXHR = Backbone.$.Deferred();
                jsXHR.always(function() {
                    cb(captchaData);
                });
                _url = url;
                _data = data;
            });

            spyOn(captcha, 'set');

            // check success
            captcha.loadCaptcha();
            jsXHR.resolve();
            expect(_url).toBe(URL);
            expect(_data).toEqual(DATA);
            expect(captcha.set).toHaveBeenCalledWith('captchaImage', captchaData.captcha_image);
            expect(captcha.set).toHaveBeenCalledWith('captchaKey', captchaData.captcha_key);
        });
    });
});
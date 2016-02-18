define(['js/utest/data/Settings', 'about'], function(settingsData) {
    'use strict';

    describe('App.Models.AboutModel', function() {
        var model, settings, settingsBak, spySpinner;

        beforeEach(function() {
            settings = deepClone(settingsData.all);
            spySpinner = spyOn(window, 'loadSpinner').and.callFake(function(img) {return img;});
            settingsBak = App.Settings;
            App.Settings = settings.settings_system;
            model = new App.Models.AboutModel();
        });

        afterEach(function() {
            App.Settings = settingsBak;
        });

        it('Environment', function() {
            expect(App.Models.AboutModel).toBeDefined();
        });

        it('initialize()', function() {
            var images = [
                Backbone.$('<img src="https://revelup-images-test.s3.amazonaws.com/weborder-dev-branch/132c9071-00d3-4301-b8a8-321cebbd6154.jpg">'), // logo img
                Backbone.$('<img src="https://revelup-images-test.s3.amazonaws.com/weborder-dev-branch/3f9c290a-5229-4d2f-ade7-433783335f9e.png">'),
                Backbone.$('<img src="https://revelup-images-test.s3.amazonaws.com/weborder-dev-branch/b81723c1-93d1-4bce-b425-caa0042395e7.png">')
            ],
                descr = settings.settings_system.about_description.replace(/\r\n/g,"<br>");

            expect(model.get('images')).toEqual(images);
            expect(model.get('title')).toBe(settings.settings_system.about_title);
            expect(model.get('content')).toBe(descr);
            expect(model.get('curImageIndex')).toBe(0);
        });
    });

});
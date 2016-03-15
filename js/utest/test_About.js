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
                Backbone.$('<img src="' + (window._phantom ? 'base/' : '') + 'js/utest/data/test_picture1.png">'),
                Backbone.$('<img src="' + (window._phantom ? 'base/' : '') + 'js/utest/data/test_picture2.png">'),
                Backbone.$('<img src="' + (window._phantom ? 'base/' : '') + 'js/utest/data/test_picture3.png">')
            ],

            descr = settings.settings_system.about_description.replace(/\r\n/g,"<br>");
            expect(model.get('images')).toEqual(images);
            expect(model.get('title')).toBe(settings.settings_system.about_title);
            expect(model.get('content')).toBe(descr);
            expect(model.get('curImageIndex')).toBe(0);
        });
    });

});
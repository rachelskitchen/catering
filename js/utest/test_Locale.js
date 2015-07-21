define(['locale'], function() {
    'use strict';

    describe('App.Models.Locale', function() {

        var model, def;

        beforeEach(function() {
            model = new App.Models.Locale();
            spyOn(window, "getData");
            spyOn(window, "setData");
        });

        it('Environment', function() {
            expect(App.Models.Locale).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual({});
        });

    });
});
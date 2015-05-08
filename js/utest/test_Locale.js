define(['locale'], function() {
    describe('App.Models.Locale', function() {

        var model, def;

        beforeEach(function() {
            model = new App.Models.Locale();
            spyOn(window, "getData");
            spyOn(window, "setData");
        });

        it('Environment', function() {
            model.loadLanguagePack();
            expect(App.Models.Card).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual({});
        });

    });
});
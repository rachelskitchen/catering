define([], function() {
    describe("App.Models.Error", function() {
        
        var model, def, def2, num, reload;
        
        beforeEach(function() {
            spyOn(window, "generate_random_number").and.returnValue(100);
            model = new App.Models.Errors();
            def = {
                message: "",
                random_number: App.Models.Errors.prototype.defaults.random_number,
                reload_page: false
            }, def2 = {
                message: "",
                random_number: 100,
                reload_page: false
            }, num = {
                message: '123',
                random_number: 100,
                reload_page: false
            }, reload = {
                message: '123',
                random_number: 100,
                reload_page: true                
            };
            spyOn(window, 'alert_message');
        });

        it('Environment', function() {
            expect(App.Models.Errors).toBeDefined();
        });

        it("Create model", function() {
            expect(model.toJSON()).toEqual(def);
        });

        describe("App.Models.Errors Function alert", function() {
            
            it('Alert empty arguments', function() {
                expect(model.alert().toJSON()).toEqual(def2);
            });
            
            it('Alert only message argument as number', function() {
                expect(model.alert(123).toJSON()).toEqual(num);
            });
            
            it('Alert only message argument as string', function() {
                expect(model.alert('123').toJSON()).toEqual(num);
            });
            
            it('Alert message argument as string and reload_page as number (12)', function() {
                expect(model.alert('123', 12).toJSON()).toEqual(reload);
            });
            
            it('Alert message argument as string and reload_page as null', function() {
                expect(model.alert('123', null).toJSON()).toEqual(num);
            });
            
            it('Alert message argument as string and reload_page as boolean (true)', function() {
                expect(model.alert('123', true).toJSON()).toEqual(reload);
            });
        });
    });
});
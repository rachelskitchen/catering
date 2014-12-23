define(['tip'], function() {
    
    describe('App.Models.Tip', function() {
        
        var model, def;
        
        beforeEach(function() {
            model = new App.Models.Tip();
            spyOn(window, "getData");
            spyOn(window, "setData");
            def = {
                type: false, // tip in cash (false) or credit card (true)
                amount: true, // true - %, false - $
                percents : [10,15,20], // percent variant
                sum : 0, // sum if amount false
                percent : 0, // percent if amount true
                img : App.Data.settings.get("img_path")
            };
        });

        it('Environment', function() {
            expect(App.Models.Tip).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        // App.Models.Customer function saveCheckout
        it('App.Models.Tip Function saveTip', function() {
            model.saveTip(); // save current state model in storage (detected automatic)
            expect(setData).toHaveBeenCalledWith('tip', model);
        });

        // App.Models.Customer function loadCheckout
        it('App.Models.Tip Function loadTip', function() {
            model.loadTip(); // load state model from storage (detected automatic)
            expect(getData).toHaveBeenCalledWith('tip');
        });
        
        describe('App.Models.Tip Function get_tip', function() {
            
            it('get_tip "tip in cash" is checked.', function() { 
                // Test `get_tip` method. Case 'tip in cash' is checked.
                expect(model.get_tip(12)).toBe(0);
            });

            it('get_tip "tip in credit" is checked and percent is checked.', function() { 
                // Test `get_tip` method. Case 'tip in credit' is checked and percent is checked.
                model.set({type: true, percent: 25});
                expect(model.get_tip(200)).toBe(50);
            });

            it('get_tip "tip in credit" is checked and sum is present.', function() { 
                // Test `get_tip` method. Case 'tip in credit' is checked and amount is present.
                model.set({type: true, amount: false, sum: 12});
                expect(model.get_tip(200)).toBe(12);
            });
            
        });
    });
});
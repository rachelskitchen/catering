define(['categories'], function() {
    describe("App.Models.Categories", function() {
        var def, model;
            
        beforeEach(function() {
            model = new App.Models.Category();
            def = {
                description : '',
                id: null,
                image: 'test/img_default',
                name: null,
                parent_name: null,
                parent_sort: null,
                sort: null,
                img : 'test/path/',
                active: true
            };
        });
        
        it('Environment', function() {
            expect(App.Models.Category).toBeDefined();
        });
        
        it('Create default App.Models.Category', function() {
            expect(model.toJSON()).toEqual(def);
        });
    });
    
    describe("App.Collections.Categories", function() {
        var def, model, categories, success, error, id, arg,
            ajaxStub = function() {
                success = arguments[0].successResp;
                error = arguments[0].error;
                arg = arguments;
            };
        
        $.ajax({
            type: "GET",
            url: "js/utest/data/Categories.json",
            dataType: "json",
            async: false,
            success: function(data) {
                categories = data;
            }
        });
        
        beforeEach(function() {
            model = new App.Collections.Categories();
            def = {
                id: null,
                name: null,
                image: 'test/img_default',
                sort: null,
                img : 'test/path/',
                description : ''
            }, id = {
                sort: 1,
                parent_name: "Menu2",
                description: null,
                parent_sort: 5,
                image: 'test/img_default',
                img : 'test/path/',
                id: 50,
                name: "sub2",
                active: true
            };
        });
        
        it('Environment', function() {
            expect(App.Collections.Categories).toBeDefined();
        });
        
        // App.Collections.Categories function get_categories
        it('Function get_categories ', function() {
            expect(model.selected).toBeNull();
            expect(model.parent_selected).toBeNull();
            spyOn($,'ajax').and.callFake(ajaxStub);
            model.get_categories();
            success(categories);
            expect(model.length).toBe(4);
            expect(arg[0].url).toBe("testHost/weborders/product_categories/");
            expect(model.get(50).toJSON()).toEqual(id);
            expect(model.selected).toBe(0);
            expect(model.parent_selected).toBe(0);
        });
        
        it('Function set_inactive', function() {
            model.add(categories);
            model.set_inactive(50);
            expect(model.get(50).get('active')).toBe(false);
        });
    });
});
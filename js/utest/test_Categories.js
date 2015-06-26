define(['categories'], function() {
    'use strict';

    describe("App.Models.Categories", function() {

        var def, model;

        beforeEach(function() {
            model = new App.Models.Category();
            def = {
                description : '',
                id: null,
                image: './skins/weborder/img/none.png',
                name: null,
                parent_name: null,
                parent_sort: null,
                sort: null,
                sort_val: null,
                img : './skins/weborder/img/',
                active: true,
                timetables: null
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

        var model, categories, success, error, id, arg,
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
            id = {
                description: null,
                id: 50,
                image: './skins/weborder/img/none.png',
                name: 'sub2',
                parent_name: 'Menu2',
                parent_sort: 5,
                sort: 1,
                sort_val: 5001,
                img : './skins/weborder/img/',
                active: true,
                timetables: null
            };
        });

        it('Environment', function() {
            expect(App.Collections.Categories).toBeDefined();
        });

        it("Get_categories Function", function() {
            expect(model.selected).toBeNull();
            expect(model.parent_selected).toBeNull();
            spyOn($,'ajax').and.callFake(ajaxStub);
            model.get_categories();
            error();
            success(categories);
            expect(model.length).toBe(4);
            expect(arg[0].url).toBe("testHost/weborders/product_categories/");
            expect(model.get(50).toJSON()).toEqual(id);
            expect(model.selected).toBe(0);
            expect(model.parent_selected).toBe(0);
        });

        it("Set_inactive Function", function() {
            model.add(categories);
            model.set_inactive(50);
            expect(model.get(50).get('active')).toBe(false);
        });

    });
});
define(['js/utest/data/ProductSets', 'product_sets'], function(data) {
    'use strict';

    describe('App.Models.ProductSet', function() {
        var model, dataJson, addJson;

        beforeEach(function() {
            model = new App.Models.ProductSet();
            dataJson = deepClone(data.ajaxJson);
            addJson = deepClone(data.addJson[0]);
        });

        it('Enviroment', function() {
            expect(App.Models.ProductSet).toBeDefined();
        });

        it('addJSON()', function() {
            model.addJSON(addJson);

            var modelJson = model.toJSON();
            expect(modelJson.order_products.models[0] instanceof App.Models.Myorder).toBe(true);
            expect(modelJson.order_products.models[1] instanceof App.Models.Myorder).toBe(true);
            expect(modelJson.id).toBe(addJson.id);
            expect(modelJson.name).toBe(addJson.name);
            expect(modelJson.sort).toBe(addJson.sort);
            expect(modelJson.quantity).toBe(addJson.quantity);
            expect(modelJson.is_combo_saving).toBe(addJson.is_combo_saving);
        });

        it('addAjaxJSON()', function() {
            model.addAjaxJSON(dataJson);

            var modelJson = model.toJSON();
            expect(modelJson.id).toBe(dataJson.id);
            expect(modelJson.name).toBe(dataJson.name);
            expect(modelJson.sort).toBe(dataJson.sort);
            expect(modelJson.quantity).toBe(dataJson.quantity);
            expect(modelJson.is_combo_saving).toBe(dataJson.is_combo_saving);
            expect(modelJson.order_products.length).toBe(dataJson.products.length);
        });

        it('get_selected_qty()', function() {
            var order_products = new App.Collections.ProductSetModels();

            model.set('order_products', order_products);
            expect(model.get_selected_qty()).toBe(0);

            order_products.add([new App.Models.Myorder({selected: true}), new App.Models.Myorder({selected: false})]);
            expect(model.get_selected_qty()).toBe(1);
        });

        it('get_selected_products()', function() {
            model.addAjaxJSON(dataJson);
            expect(model.get_selected_products()).toEqual([]);

            var product1 = model.get('order_products').models[0];
            product1.set('selected', true);
            expect(model.get_selected_products()).toEqual([product1]);
        });

        it('item_submit()', function() {
            model.addAjaxJSON(dataJson);
            var product1 = model.get('order_products').models[0];
            spyOn(product1, 'item_submit').and.returnValue('test');

            expect(model.item_submit()).toEqual({
                id: model.get('id'),
                name: model.get('name'),
                products: []
            });
            expect(product1.item_submit).not.toHaveBeenCalled();

            product1.set('selected', true);
            expect(model.item_submit()).toEqual({
                id: model.get('id'),
                name: model.get('name'),
                products: ['test']
            });
            expect(product1.item_submit).toHaveBeenCalled();
        });

        it('clone()', function() {
            model.addAjaxJSON(dataJson);
            var clone = model.clone()
            expect(clone.cid).not.toBe(model.cid);
            expect(clone.__proto__).toBe(model.__proto__);
        });
    });

    describe('App.Collections.ProductSets', function() {
        var model, addJson;

        beforeEach(function() {
            model = new App.Collections.ProductSets();
            addJson = deepClone(data.addJson);
        });

        it('Enviroment', function() {
            expect(App.Collections.ProductSets).toBeDefined();
        });

        it('onProductsError()', function() {
            spyOn(App.Data.errors, 'alert');
            model.onProductsError();
            expect(App.Data.errors.alert).toHaveBeenCalledWith(MSG.ERROR_PRODUCTS_LOAD, true);
        });
    });
});
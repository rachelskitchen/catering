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
            var product
            model.addJSON(addJson);

            var modelJson = model.toJSON();
            expect(modelJson.order_products.models[0] instanceof App.Models.Myorder).toBe(true);
            expect(modelJson.order_products.models[1] instanceof App.Models.Myorder).toBe(true);
            expect(modelJson.order_products.models[0].get('product').toJSON()).toEqual(addJson.order_products[0].product);
            expect(modelJson.order_products.models[1].get('product').toJSON()).toEqual(addJson.order_products[1].product);
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
            expect(modelJson.minimum_amount).toBe(dataJson.quantity);
            expect(modelJson.maximum_amount).toBe(dataJson.quantity);
            expect(modelJson.is_combo_saving).toBe(dataJson.is_combo_saving);
            expect(modelJson.order_products.length).toBe(dataJson.products.length);

            model = new App.Models.ProductSet();
            delete dataJson.quantity;
            model.addAjaxJSON(dataJson);
            var modelJson = model.toJSON();
            expect(modelJson.minimum_amount).toBe(1);
            expect(modelJson.maximum_amount).toBe(1);
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
            expect(clone.__proto__).toEqual(model.__proto__);
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

        describe('get_product_sets(product_id)', function() {
            var ajaxSpy, ajax, product_id;

            beforeEach(function() {
                ajaxSpy = spyOn($, 'ajax');
                product_id = 1;
            });

            it('success', function() {
                var response = [deepClone(data.ajaxJson)];
                ajaxSpy.and.callFake(function(opts) {
                    ajax = opts;
                    opts.successResp(response);
                });
                spyOn(App.Models.ProductSet.prototype, 'addAjaxJSON').and.callThrough();

                var result = model.get_product_sets(product_id);

                expect(ajax.data).toEqual({product: product_id});
                expect(ajax.url).toBe(App.Data.settings.get('host') + '/weborders/product_sets/');
                expect(result.state()).toBe('resolved');
                expect(App.Models.ProductSet.prototype.addAjaxJSON).toHaveBeenCalled();
                expect(model.models[0].get('name')).toBe('Product set 1');
            });

            it('error', function() {
                ajaxSpy.and.callFake(function(opts) {
                    opts.error();
                });
                spyOn(model, 'onProductsError');

                model.get_product_sets(product_id);
                expect(model.onProductsError).toHaveBeenCalled();
            });
        });

        it('addJSON()', function() {
            spyOn(App.Models.ProductSet.prototype, 'addJSON').and.callThrough();

            model.addJSON(addJson);
            expect(App.Models.ProductSet.prototype.addJSON).toHaveBeenCalled();
            expect(model.models[0].get('name')).toBe('Product set 1');
            expect(model.models[1].get('name')).toBe('Product set 2');
        });

        it('onProductsError()', function() {
            spyOn(App.Data.errors, 'alert');
            model.onProductsError();
            expect(App.Data.errors.alert).toHaveBeenCalledWith(MSG.ERROR_PRODUCTS_LOAD, true);
        });

        it('clone()', function() {
            model.addJSON(addJson);
            var clone = model.clone();

            expect(clone.models.length).toBe(model.models.length);
            expect(clone.__proto__).toEqual(model.__proto__);
            expect(clone.models[0].cid).not.toBe(model.models[0].cid);
            expect(clone.models[1].cid).not.toBe(model.models[1].cid);
            expect(clone.models[0].__proto__).toEqual(model.models[0].__proto__);
            expect(clone.models[0].__proto__).toEqual(model.models[0].__proto__);
        });

        it('get_selected_products()', function() {
            model.addJSON(addJson);
            var result = model.get_selected_products();
            expect(result instanceof App.Collections.ProductSetModels).toBe(true);
            expect(result.length).toBe(2);
        });

        it('find_product()', function() {
            expect(model.find_product(2078)).toBeUndefined();

            model.addJSON(addJson);
            expect(model.find_product(2078)).toEqual(model.models[0].get('order_products').models[0]);
        });

        describe('check_selected()', function() {
            beforeEach(function() {
                model.addJSON(addJson);
            });

            it('selected quantity is ok', function() {
                model.addJSON(addJson);
                expect(model.check_selected()).toBe(true);
            });

            it('selected quantity less than minimum amount', function() {
                model.addJSON(addJson);
                spyOn(model.models[0], 'get_selected_qty').and.returnValue(1);
                model.models[0].set({minimum_amount: 5, maximum_amount: 10}, {silent: true});
                expect(model.check_selected()).toBe(false);
            });

            it('selected quantity more than maximum amount', function() {
                model.addJSON(addJson);
                spyOn(model.models[0], 'get_selected_qty').and.returnValue(20);
                model.models[0].set({minimum_amount: 1, maximum_amount: 10}, {silent: true});
                expect(model.check_selected()).toBe(false);
            });
        });
    });

    describe('App.Collections.ProductSets.init(product_id)', function() {
        var product_id;

        beforeEach(function() {
            this.productSets = App.Data.productSets;
        });
        afterEach(function() {
            App.Data.productSets = this.productSets;
        });

        it('App.Data.productSets[product_id] doesn\'t exist', function() {
            delete App.Data.productSets[product_id];
            spyOn(App.Collections.ProductSets.prototype, 'get_product_sets').and.returnValue('result of get_product_sets()');
            var result = App.Collections.ProductSets.init(product_id);
            expect(result).toBe('result of get_product_sets()');
        });

        it('App.Data.productSets[product_id] exists', function() {
            product_id = 1;
            App.Data.productSets[product_id] = 'product set';
            var result = App.Collections.ProductSets.init(product_id);
            expect(result.state()).toBe('resolved');
        });
        
    });
});
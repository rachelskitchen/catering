define(['products', 'js/utest/data/Products'], function(products, data) {
    'use strict';

    describe("App.Models.Product", function() {

        var model, def, defInitialized;

        beforeEach(function() {
            def = deepClone(data.defaults);
            defInitialized = deepClone(data.defaults_initialized);

            spyOn(App.Data.settings, 'get_img_default').and.returnValue(defInitialized.image);
            spyOn(App.Data.settings, 'get').and.callFake(function(key) {
                if(key === 'img_path') {
                    return defInitialized.img;
                } else {
                    return Backbone.Model.prototype.get.apply(App.Data.settings, arguments);
                }
            });

            model = new App.Models.Product();
        });

        it('Environment', function() {
            expect(App.Models.Product).toBeDefined();
        });

        it('Create model', function() {
            if (App.skin == App.Skins.RETAIL) {
                expectationsRetail();
            }
            else {
                expect(model.toJSON()).toEqual(defInitialized);
            }

            var skinBackup = App.skin;
            App.skin = App.Skins.RETAIL;
            model = new App.Models.Product();
            expectationsRetail();
            App.skin = skinBackup;

            function expectationsRetail() {
                var result = Backbone.$.extend(defInitialized, {images: [defInitialized.image]});
                expect(model.toJSON()).toEqual(result);
            }
        });

        describe('initialize()', function() {
            var skin = App.skin,
                host;

            beforeEach(function() {
                host = App.Data.settings.get('host');
                spyOn(model, 'listenTo');
                spyOn(model, 'images');
            });

            afterEach(function() {
                App.skin = skin;
            });


            it('`image` is empty', function() {
                model.initialize();

                generalBehavior();
                expect(model.get('image')).toEqual(addHost(defInitialized.image));
            });

            it('`image` exists', function() {
                var productWithImage = data.product_with_image;

                model.addJSON(_.extend({}, productWithImage));
                model.initialize();

                generalBehavior();
                expect(model.get('image')).toEqual(addHost(productWithImage.image));
            });

            it('skin isn\'t RETAIL', function() {
                App.skin = !App.Skins.RETAIL;

                model.initialize();

                generalBehavior(model);
                expect(model.listenTo).not.toHaveBeenCalledWith(model, 'change:images change:image', model.images, model);
                expect(model.images).not.toHaveBeenCalled();
            });

            it('skin is RETAIL', function() {
                App.skin = App.Skins.RETAIL;

                model.initialize();

                generalBehavior();
                expect(model.listenTo).toHaveBeenCalled();
                expect(model.images).toHaveBeenCalled();
            });

            function generalBehavior() {
                expect(model.get('img')).toBe(defInitialized.img);
                expect(model.get('checked_gift_cards')).toEqual(defInitialized.checked_gift_cards);
            }

            function addHost(url) {
                return host + url.replace(/^([^\/])/, '/$1');
            }
        });

        describe('addJSON(data)', function() {
            var model, host;

            function generalBehavior() {
                expect(model.checkStockAmount).toHaveBeenCalled();
            }

            beforeEach(function() {
                model = new App.Models.Product();
                host = App.Data.settings.get('host');
                spyOn(model, 'checkStockAmount');
                spyOn(model, 'set').and.callFake(function() {
                    return App.Models.Product.prototype.set.apply(model, arguments);
                });
            });

            it('data.image is empty', function() {
                var modelData = _.clone(data.addJSON_without_image);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(_.extend({}, modelData, {image: defInitialized.image}));
                generalBehavior();
            });

            it('data.image exists', function() {
                var modelData = _.clone(data.addJSON_with_image);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(modelData);
                generalBehavior();
            });

            it('data.is_gift is false', function() {
                var modelData = _.clone(data.addJSON_is_gift_false);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(modelData);
                generalBehavior();
            });

            it('data.is_gift is true', function() {
                var modelData = _.clone(data.addJSON_is_gift_true);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(_.extend({}, modelData, {sold_by_weight: defInitialized.sold_by_weight}));
                generalBehavior();
            });

            it('data.created_date exists', function() {
                var modelData = _.clone(data.addJSON_with_created_date);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(modelData);
                generalBehavior();
            });

            it('data.created_date doesn\'t exist', function() {
                var modelData = _.clone(data.addJSON_without_created_date);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(_.extend({}, modelData, {created_date: defInitialized.created_date}));
                generalBehavior();
            });

            it('data.attribute_type isn\'t 1 (parent product), data.child_products doesn\'t exist', function() {
                var modelData = _.clone(data.addJSON_without_created_date);
                model.addJSON(_.clone(modelData));
                expect(model.get('child_products')).toBe(model.defaults.child_products);
                generalBehavior();
            });

            it('data.attribute_type is 1 (parent product), data.child_products is array', function() {
                var modelData = _.clone(data.addJSON_parent_with_child_products),
                    child_products,
                    child1,
                    child2;

                model.addJSON(_.clone(modelData));
                child_products = model.get('child_products');
                child1 = child_products.at(0).get('product').toJSON();
                child2 = child_products.at(1).get('product').toJSON();
                expect(child_products instanceof App.Collections.ChildProducts).toBe(true);
                modelData.child_products[0].product.image = addHost(modelData.child_products[0].product.image);
                modelData.child_products[1].product.image = addHost(modelData.child_products[1].product.image);
                expect(child1).toEqual(_.extend({}, defInitialized, modelData.child_products[0].product));
                expect(child2).toEqual(_.extend({}, defInitialized, modelData.child_products[1].product));
                generalBehavior();
            });

            it('data.attribute_type is 1 (parent product), data.child_products is an instance of App.Collections.ChildProducts', function() {
                var modelData = _.clone(data.addJSON_parent_with_child_products),
                    child_products,
                    child1,
                    child2;

                model.addJSON(_.extend({}, modelData, {child_products: new App.Collections.ChildProducts(modelData.child_products)}));

                child_products = model.get('child_products');
                child1 = child_products.at(0).get('product').toJSON();
                child2 = child_products.at(1).get('product').toJSON();

                expect(child_products instanceof App.Collections.ChildProducts).toBe(true);
                expect(child1).toEqual(_.extend({}, defInitialized, modelData.child_products[0].product));
                expect(child2).toEqual(_.extend({}, defInitialized, modelData.child_products[1].product));
                generalBehavior();
            });

            it('data.is_combo is true, data.product_sets is array', function() {
                var modelData = _.clone(data.addJSON_is_combo_true),
                    product_sets,
                    set1,
                    set2,
                    product1,
                    product2;
                model.addJSON(_.clone(modelData));

                product_sets = model.get('product_sets');
                set1 = product_sets.models[0].toJSON();
                product1 = product_sets.models[0].get('order_products').models[0].get('product').toJSON();
                product2 = product_sets.models[0].get('order_products').models[1].get('product').toJSON();

                expect(product_sets instanceof App.Collections.ProductSets).toBe(true);
                expect(product1).toEqual(_.extend({}, defInitialized, modelData.product_sets[0].order_products[0].product));
                expect(product2).toEqual(_.extend({}, defInitialized, modelData.product_sets[0].order_products[1].product));
            });

            function addHost(url) {
                return host + url.replace(/^([^\/])/, '/$1');
            }
        });

        describe('clone()', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.Product();
            });

            it('without child products', function() {
                var modelData = _.clone(data.addJSON_parent_without_child_products),
                    clone;

                model.addJSON(_.clone(modelData));
                clone = model.clone();

                expect(clone).not.toEqual(model);
                expect(clone.toJSON()).toEqual(model.toJSON());
            });

            it('with child products', function() {
                var modelData = _.clone(data.addJSON_parent_with_child_products),
                    modelWithoutChildProducts,
                    cloneWithoutChildProducts,
                    modelChild1, modelChild2,
                    cloneChild1, cloneChild2,
                    clone;

                model.addJSON(_.clone(modelData));
                clone = model.clone();

                modelWithoutChildProducts = _.extend({}, model.toJSON(), {child_products: ''});
                cloneWithoutChildProducts = _.extend({}, clone.toJSON(), {child_products: ''});
                modelChild1 = model.get('child_products').at(0);
                modelChild2 = model.get('child_products').at(1);
                cloneChild1 = clone.get('child_products').at(0);
                cloneChild2 = clone.get('child_products').at(1);

                expect(clone).not.toEqual(model);
                expect(cloneWithoutChildProducts).toEqual(modelWithoutChildProducts);
                expect(clone.get('child_products')).not.toEqual(model.get('child_products'));
                expect(cloneChild1).not.toEqual(modelChild1);
                expect(cloneChild1.get('product')).not.toEqual(modelChild1.get('product'));
                expect(cloneChild1.get('product').toJSON()).toEqual(modelChild1.get('product').toJSON());
                expect(cloneChild2).not.toEqual(modelChild2);
                expect(cloneChild2.get('product')).not.toEqual(modelChild2.get('product'));
                expect(cloneChild2.get('product').toJSON()).toEqual(modelChild2.get('product').toJSON());
            });
        });

        describe('update()', function() {
            var model;

            function updateWithProducts(model) {
                var modelData = _.clone(data.addJSON_parent_with_child_products),
                    clone = model.clone(),
                    initModel = model,
                    modelWithoutChildProducts,
                    modelChild1, modelChild2;

                clone.addJSON(_.clone(modelData));
                model.update(clone);

                modelWithoutChildProducts = _.extend({}, model.toJSON(), {child_products: null});
                modelChild1 = model.get('child_products').at(0).get('product').toJSON();
                modelChild2 = model.get('child_products').at(1).get('product').toJSON();

                expect(model).toBe(initModel);
                expect(modelWithoutChildProducts).toEqual(_.extend({}, defInitialized, modelData, {child_products: null}));
                expect(modelChild1).toEqual(_.extend({}, defInitialized, modelData.child_products[0].product));
                expect(modelChild2).toEqual(_.extend({}, defInitialized, modelData.child_products[1].product));
            }

            beforeEach(function() {
                model = new App.Models.Product();
            });

            it('without child products', function() {
                var modelData = _.clone(data.addJSON_parent_without_child_products),
                    clone = model.clone(),
                    initModel = model;

                clone.addJSON(_.clone(modelData));
                model.update(clone);

                expect(model).toBe(initModel);
                expect(model.toJSON()).toEqual(_.extend({}, defInitialized, modelData));
            });

            it('with child products, own `child_products` is null', function() {
                var initChildProducts = model.get('child_products');
                updateWithProducts(model);
                expect(model.get('child_products')).not.toBe(initChildProducts);
            });

            it('with child products, own `child_products` is an instance of App.Collections.ChildProducts', function() {
                var initChildProducts = new App.Collections.ChildProducts();
                model.set('child_products', initChildProducts);
                updateWithProducts(model);
                expect(model.get('child_products')).toBe(initChildProducts);
            });
        });

        describe('get_product(id)', function() {
            var model, id;

            beforeEach(function() {
                model = new App.Models.Product();
                id = 1;
            });

            it('id is passed, equal model.get("id")', function() {
                model.set('id', id);
                expect(model.get_product(id)).toBe(model);
            });

            it('id is passed, equal model.get("id"), types of id and model.get("id") are different', function() {
                model.set('id', String(id));
                expect(model.get_product(id)).toBe(model);

                model.set('id', id);
                expect(model.get_product(String(id))).toBe(model);
            });

            it('id is passed, not equal model.get("id"); `child_products` is null', function() {
                expect(model.get_product(id)).toBe(model.defaults.child_products);
            });

            it('id is passed, not equal model.get("id"); `child_products` exists', function() {
                model.addJSON(_.clone(data.addJSON_parent_with_child_products));
                var children = model.get('child_products');
                spyOn(children, 'get_product_id');
                model.get_product(id);

                expect(children.get_product_id).toHaveBeenCalledWith(id);
            });

            it('id is undefined, `attribute_type` is 0 (usual product)', function() {
                model.set('attribute_type', 0);
                expect(model.get_product()).toBe(model);
            });

            it('id is undefined, `attribute_type` is 2 (child product)', function() {
                model.set('attribute_type', 2);
                expect(model.get_product()).toBe(model);
            });

            it('id is undefined, `attribute_type` is 1 (parent product), `child_products` is null', function() {
                model.set('attribute_type', 1);
                expect(model.get_product()).toBe(model);
            });

            it('id is undefined, `attribute_type` is 1 (parent product), `child_products` is assigned, selected child exists', function() {
                var attrs = _.clone(data.get_product_attributes),
                    child = 2,
                    children;

                model.addJSON(_.clone(data.addJSON_parent_with_child_products));
                model.set(attrs);

                children = model.get('child_products');
                spyOn(children, 'get_product').and.callFake(function() {
                    return child;
                });

                model.get_product();

                expect(children.get_product).toHaveBeenCalledWith(attrs);
                expect(model.get_product()).toBe(child);
            });

            it('id is undefined, `attribute_type` is 1 (parent product), `child_products` is assigned, selected child doesn\'t exist', function() {
                var attrs = _.clone(data.get_product_attributes),
                    children;

                model.addJSON(_.clone(data.addJSON_parent_with_child_products));
                model.set(attrs);

                children = model.get('child_products');
                spyOn(children, 'get_product').and.callFake(function() {
                    return null;
                });

                model.get_product();

                expect(children.get_product).toHaveBeenCalledWith(attrs);
                expect(model.get_product()).toBe(model);
            });
        });

        describe('get_modifiers()', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.Product();
            });

            it('`attribute_type` is 0 (usual product)', function() {
                expect(model.get_modifiers()).toBeNull();
            });

            it('`attribute_type` is 2 (child product)', function() {
                model.set('attribute_type', 2);
                expect(model.get_modifiers()).toBeNull();
            });

            it('`attribute_type` = 1 (parent product), `child_products` is null (without children)', function() {
                model.set('attribute_type', 1);
                expect(model.get_modifiers()).toBeNull();
            });

            it('`attribute_type` = 1, `child_products` exists (with children)', function() {
                var attrs = _.clone(data.get_product_attributes),
                    children;

                model.addJSON(_.clone(data.addJSON_parent_with_child_products));
                model.set(attrs);

                children = model.get('child_products');
                spyOn(children, 'get_modifiers');
                model.get_modifiers();

                expect(children.get_modifiers).toHaveBeenCalledWith(attrs);
            });
        });

        describe('get_attributes_list()', function() {
            var model, defaultList;

            beforeEach(function() {
                model = new App.Models.Product();
                defaultList = {};
            });

            it('`attribute_type` is 0 (usual product)', function() {
                expect(model.get_attributes_list()).toEqual(defaultList);
            });

            it('`attribute_type` is 2 (child product)', function() {
                model.set('attribute_type', 2);
                expect(model.get_attributes_list()).toEqual(defaultList);
            });

            it('`attribute_type` = 1 (parent product), `child_products` is null (without children)', function() {
                model.set('attribute_type', 1);
                expect(model.get_attributes_list()).toEqual(defaultList);
            });

            it('`attribute_type` = 1, `child_products` exists (with children)', function() {
                model.addJSON(_.clone(data.addJSON_parent_with_child_products));

                var children = model.get('child_products');
                spyOn(children, 'get_attributes_list');
                model.get_attributes_list();

                expect(children.get_attributes_list).toHaveBeenCalledWith();
            });
        });

        describe('get_attribute(type)', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.Product();
            });

            it('type is neither 1 nor 2', function() {
                spyOn(model, 'get');
                model.get_attribute();
                expect(model.get).toHaveBeenCalledWith('attribute_1_enable');
            });

            it('type is 1 or 2, attribute is disabled', function() {
                spyOn(model, 'get_attributes_list');

                model.set('attribute_1_enable', false);
                model.get_attribute(1);
                expect(model.get_attributes_list).not.toHaveBeenCalled();

                model.set('attribute_2_enable', false);
                model.get_attribute(2);
                expect(model.get_attributes_list).not.toHaveBeenCalled();
            });

            it('type is 1 or 2, attribute is enabled', function() {
                var data1 = _.clone(data.get_attribute_1_data),
                    data2 = _.clone(data.get_attribute_2_data),
                    value1 = 1,
                    value2 = 2;

                spyOn(model, 'get_attributes_list').and.callFake(function() {
                    var res = {
                        attribute_1_all: {},
                        attribute_2_all: {}
                    };
                    res.attribute_1_all[data1.attribute_1_selected] = value1;
                    res.attribute_2_all[data2.attribute_2_selected] = value2;
                    return res;
                });

                model.set(data1);
                model.set(data2);

                expect(model.get_attribute(1)).toEqual({
                    name: data1.attribute_1_name,
                    value: value1,
                    selected: data1.attribute_1_selected
                });

                expect(model.get_attribute(2)).toEqual({
                    name: data2.attribute_2_name,
                    value: value2,
                    selected: data2.attribute_2_selected
                });
            });
        });

        describe('get_attributes()', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.Product();
                model.set(_.extend({}, data.get_attribute_1_data, data.get_attribute_2_data));
                spyOn(model, 'get_attribute').and.callFake(function(type) {
                    return model.get('attribute_' + type + '_enable') ? type : false;
                });
            });

            it('attribute1 is selected, attribute2 is unselected', function() {
                model.set('attribute_2_enable', false);

                expect(model.get_attributes()).toEqual([1])
                expect(model.get_attribute).toHaveBeenCalledWith(1);
                expect(model.get_attribute).toHaveBeenCalledWith(2);
            });

            it('attribute1 is unselected, attribute2 is selected', function() {
                model.set('attribute_1_enable', false);

                expect(model.get_attributes()).toEqual([2]);
                expect(model.get_attribute).toHaveBeenCalledWith(1);
                expect(model.get_attribute).toHaveBeenCalledWith(2);
            });

            it('attribute1 is selected, attribute2 is selected', function() {
                expect(model.get_attributes()).toEqual([1, 2]);
                expect(model.get_attribute).toHaveBeenCalledWith(1);
                expect(model.get_attribute).toHaveBeenCalledWith(2);
            });

            it('attribute1 is unselected, attribute2 is unselected', function() {
                model.set({
                    attribute_1_enable: false,
                    attribute_2_enable: false
                });
                expect(model.get_attributes()).toBe(undefined);
                expect(model.get_attribute).toHaveBeenCalledWith(1);
                expect(model.get_attribute).toHaveBeenCalledWith(2);
            });
        });

        describe('get_child_products()', function() {
            var model, def, ajax, ajaxData, child, childPassed, initInventory, ajaxOpts,
                ajaxOptsPattern = {
                    url: "/weborders/attributes/"
                };

            beforeEach(function() {
                model = new App.Models.Product();
                def = Backbone.$.Deferred();
                ajax = Backbone.$.Deferred();
                child = new App.Collections.ChildProducts;
                childPassed = undefined;

                spyOn(Backbone.$, 'Deferred').and.callFake(function() {
                    return def;
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function(options) {
                    ajax.done(options.success.bind(window, ajaxData));
                    ajaxOpts = options;
                    return ajax;
                });

                spyOn(model, 'set').and.callFake(function(prop, value) {
                    if(prop === 'child_products') {
                        childPassed = value;
                    }
                    return Backbone.Model.prototype.set.apply(model, arguments);
                });

                spyOn(model, 'get').and.callFake(function(prop) {
                    if(prop === 'child_products' && childPassed) {
                        return child;
                    }
                    return Backbone.Model.prototype.get.apply(model, arguments);
                });

                spyOn(model, 'listenTo');
                spyOn(child, 'add_child');

                initInventory = App.Data.settings.get("settings_system").cannot_order_with_empty_inventory;

            });

            afterEach(function() {
                App.Data.settings.get("settings_system").cannot_order_with_empty_inventory = initInventory;
            });

            it('`attribute_type` is 0 (usual product)', function() {
                model.set('attribute_type', 0);
                model.get_child_products();

                expect(model.set).not.toHaveBeenCalledWith('child_products');
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
                expect(def.state()).toBe('resolved');
            });

            it('`attribute_type` is 2 (child product)', function() {
                model.set('attribute_type', 2);
                model.get_child_products();

                expect(model.set).not.toHaveBeenCalledWith('child_products');
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
                expect(def.state()).toBe('resolved');
            });

            it('`attribute_type` is 1 (parent product), `child_products` exists', function() {
                model.addJSON(_.clone(data.addJSON_parent_with_child_products));
                model.get_child_products();

                expect(model.set).not.toHaveBeenCalledWith('child_products');
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
                expect(def.state()).toBe('resolved');
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, failure response', function() {
                model.addJSON(_.clone(data.addJSON_parent_without_child_products));
                model.get_child_products();
                ajax.reject();

                expect(model.set).toHaveBeenCalledWith('child_products', childPassed);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                checkAjaxRequest();
                expect(def.state()).toBe('pending');
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status isn\'t "OK"', function() {
                ajaxData = {status: 'ERROR'};
                spyOn(App.Data.errors, 'alert');

                model.addJSON(_.clone(data.addJSON_parent_without_child_products));
                model.get_child_products();
                ajax.resolve();

                expect(model.set).toHaveBeenCalledWith('child_products', childPassed);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                checkAjaxRequest();
                expect(App.Data.errors.alert).toHaveBeenCalledWith(MSG.ERROR_GET_CHILD_PRODUCTS, true);
                expect(def.state()).toBe('resolved');
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", "cannot_order_with_empty_inventory" is false', function() {
                ajaxData = deepClone(data.get_child_products);

                App.Data.settings.get("settings_system").cannot_order_with_empty_inventory = false;
                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.stock_amount).toBe(999);
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", "cannot_order_with_empty_inventory" is true', function() {
                ajaxData = deepClone(data.get_child_products);
                var stockAmount = ajaxData.data[0].product.stock_amount;

                App.Data.settings.get("settings_system").cannot_order_with_empty_inventory = true;
                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.stock_amount).toBe(stockAmount);
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", response.data[i].product.image is empty', function() {
                ajaxData = deepClone(data.get_child_products);
                ajaxData.data[0].product.image = '';

                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.image).toBe(model.get('image'));
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", response.data[i].product.image exists', function() {
                var image = '/test1111.png';
                ajaxData = deepClone(data.get_child_products);
                ajaxData.data[0].product.image = image;

                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.image).toBe(image);
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", response.data[i].product.image exists, response.data[i].product.images is null', function() {
                var image = '/test1111.png';
                ajaxData = deepClone(data.get_child_products);
                ajaxData.data[0].product.image = image;
                ajaxData.data[0].product.images = null;

                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.images).toBe(null);
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", response.data[i].product.image is empty, response.data[i].product.images isn\'t array', function() {
                ajaxData = deepClone(data.get_child_products);
                ajaxData.data[0].product.image = '';
                ajaxData.data[0].product.images = 12312;

                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.images).toBe(12312);
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", response.data[i].product.image is empty, response.data[i].product.images is empty array', function() {
                ajaxData = deepClone(data.get_child_products);
                ajaxData.data[0].product.image = '';
                ajaxData.data[0].product.images = [];
                model.set('images', ['test1.png', 'test2.png']);

                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.images).toEqual(model.get('images'));
            });

            it('`attribute_type` is 1 (parent product), `child_products` is null, response.status is "OK", response.data[i].product.image is empty, response.data[i].product.images is array (length > 0)', function() {
                var images = ['test1.png', 'test2.png'];
                ajaxData = deepClone(data.get_child_products);
                ajaxData.data[0].product.image = '';
                ajaxData.data[0].product.images = images;

                successResponse(ajaxData.data);
                expect(ajaxData.data[0].product.images).toEqual(images);
            });

            function checkAjaxRequest() {
                expect(ajaxOpts.url).toBe(ajaxOptsPattern.url);
            }

            function successResponse(ajaxData) {
                model.addJSON(_.clone(data.addJSON_parent_without_child_products));
                model.get_child_products();
                ajax.resolve();

                expect(Backbone.$.ajax).toHaveBeenCalled();
                checkAjaxRequest();
                expect(model.set).toHaveBeenCalledWith('child_products', childPassed);
                expect(model.get).toHaveBeenCalledWith('child_products');
                expect(model.listenTo).toHaveBeenCalledWith(child, 'change:active', model.update_active);
                Array.isArray(ajaxData) && ajaxData.forEach(function(item) {
                    expect(child.add_child).toHaveBeenCalledWith(item);
                });
                expect(def.state()).toBe('resolved');
            }
        });

        describe('update_active()', function() {
            var model, child, active;

            beforeEach(function() {
                model = new App.Models.Product(),
                child = new App.Collections.ChildProducts();

                spyOn(child, 'check_active').and.callFake(function() {
                    return active;
                });
                spyOn(model, 'get').and.callFake(function() {
                    return child;
                });
                spyOn(model, 'set');
            });

            it('`child_products` is null', function() {
                child = null;
                expect(model.update_active()).toBe(false);
            });

            it('`child_products` exists, child.check_active() returns false', function() {
                checkActive(false);
            });

            it('`child_products` exists, child.check_active() returns true', function() {
                checkActive(true);
            });

            function checkActive(value) {
                active = value;
                model.update_active();
                expect(model.set).toHaveBeenCalledWith('active', active);
            }
        });

        describe('check_selected()', function() {
            var model, attrs;

            beforeEach(function() {
                model = new App.Models.Product(),
                attrs = _.clone(data.get_product_attributes);

                spyOn(model, 'get').and.callFake(function(prop) {
                    return attrs[prop];
                });
            });

            it('attribute1 is enabled and selected, attribute2 is enabled and selected', function() {
                expect(model.check_selected()).toBe(true);
            });

            it('attribute1 is disabled and selected, attribute2 is enabled and selected', function() {
                attrs.attribute_1_enable = false;
                expect(model.check_selected()).toBe(true);

                attrs.attribute_1_selected = null;
                expect(model.check_selected()).toBe(true);
            });

            it('attribute1 is enabled and unselected, attribute2 is enabled and selected', function() {
                attrs.attribute_1_selected = null;
                expect(model.check_selected()).toBe(false);
            });

            it('attribute1 is enabled and selected, attribute2 is disabled and selected', function() {
                attrs.attribute_2_enable = false;
                expect(model.check_selected()).toBe(true);

                attrs.attribute_2_selected = null;
                expect(model.check_selected()).toBe(true);
            });

            it('attribute1 is enabled and selected, attribute2 is enabled and unselected', function() {
                attrs.attribute_2_selected = null;
                expect(model.check_selected()).toBe(false);
            });

            it('attribute1 is disabled and selected, attribute2 is disabled and selected', function() {
                attrs.attribute_1_enable = false;
                attrs.attribute_2_enable = false;
                expect(model.check_selected()).toBe(true);

                attrs.attribute_1_selected = null;
                attrs.attribute_2_selected = null;
                expect(model.check_selected()).toBe(true);
            });

            it('attribute1 is enabled and unselected, attribute2 is enabled and unselected', function() {
                attrs.attribute_1_selected = null;
                attrs.attribute_2_selected = null;
                expect(model.check_selected()).toBe(false);
            });
        });

        describe('check_gift(success, error)', function() {
            var ajaxOpts, checkedGiftCards, ajax, ajaxData,
                obj = {
                    success: function() {},
                    error: function() {}
                },
                ajaxOptsPattern = {
                    type: "POST",
                    url: "/weborders/check_gift/",
                    dataType: 'JSON'
                };

            beforeEach(function() {
                model = new App.Models.Product();
                model.set({
                    is_gift: true,
                    gift_card_number: '123',
                    price: 12
                });

                ajax = Backbone.$.Deferred();
                checkedGiftCards = {};

                spyOn(obj, 'success');
                spyOn(obj, 'error');
                spyOn(Backbone.$, 'ajax').and.callFake(function(opts) {
                    ajaxOpts = opts;
                    ajax.done(opts.success.bind(window, ajaxData));
                    return ajax;
                });
                spyOn(model, 'get').and.callFake(function(prop) {
                    if(prop === 'checked_gift_cards') {
                        return checkedGiftCards;
                    }
                    return Backbone.Model.prototype.get.apply(model, arguments);
                });
            });

            it('product isn\'t gift', function() {
                model.set('is_gift', false) ;
                model.check_gift(obj.success, obj.error);
                expect(obj.success).toHaveBeenCalled();
            });

            it('product is gift, gift card number is undefined', function() {
                model.set('gift_card_number', '');
                model.check_gift(obj.success, obj.error);
                expect(obj.error).toHaveBeenCalled();
            });

            it('product is gift, gift card number is valid, price is 0', function() {
                model.set('price', '0.00');
                model.check_gift(obj.success, obj.error);
                expect(obj.error).toHaveBeenCalled();
            });

            it('product is gift, gift card number is valid, price isn\'t 0', function() {
                model.check_gift(obj.success, obj.error);
                expect(Backbone.$.ajax).toHaveBeenCalled();
                checkAjaxOpts();
            });

            it('product is gift, gift card number has been already checked with `false` result', function() {
                checkedGiftCards = {'123': false};
                model.check_gift(obj.success, obj.error);
                expect(obj.error).toHaveBeenCalled();
            });

            it('product is gift, gift card number has been already checked with `true` result', function() {
                checkedGiftCards = {'123': true};
                model.check_gift(obj.success, obj.error);
                expect(obj.success).toHaveBeenCalled();
            });

            it('product is gift, gift card number is valid, price isn\'t 0, failure request', function() {
                ajaxData = {status: 'ERROR'};
                model.check_gift(obj.success, obj.error);
                ajax.reject();

                checkAjaxOpts();
                expect(obj.success).not.toHaveBeenCalled();
                expect(obj.error).not.toHaveBeenCalled();
            });

            it('product is gift, gift card number is valid, price isn\'t 0, response.status isn\'t "OK"', function() {
                ajaxData = {status: 'ERROR'};
                model.check_gift(obj.success, obj.error);
                ajax.resolve();

                checkAjaxOpts();
                expect(obj.success).not.toHaveBeenCalled();
                expect(obj.error).toHaveBeenCalled();
                expect(checkedGiftCards[model.get('gift_card_number')]).toBe(false);
            });

            it('product is gift, gift card number is valid, price isn\'t 0, response.status is "OK"', function() {
                ajaxData = {status: 'OK'};
                model.check_gift(obj.success, obj.error);
                ajax.resolve();

                checkAjaxOpts();
                expect(obj.success).toHaveBeenCalled();
                expect(obj.error).not.toHaveBeenCalled();
                expect(checkedGiftCards[model.get('gift_card_number')]).toBe(true);
            });

            function checkAjaxOpts() {
                expect(ajaxOpts.type).toBe(ajaxOptsPattern.type);
                expect(ajaxOpts.url).toBe(ajaxOptsPattern.url);
                expect(ajaxOpts.dataType).toBe(ajaxOptsPattern.dataType);
                expect(ajaxOpts.data).toEqual({
                    card: model.get('gift_card_number'),
                    establishment: App.Data.settings.get("establishment")
                });
            }
        });

        describe('images()', function() {
            var model, defImg, host;

            beforeEach(function() {
                model = new App.Models.Product();
                defImg = App.Data.settings.get('settings_skin').img_default;
                host = App.Data.settings.get('host');
                model.addJSON(_.clone(data.addJSON_with_image));
            });

            it('`images` isn\'t array', function() {
                emptyImages();
            });

            it('`images` is empty array', function() {
                emptyImages();
            });

            it('`images` is array with data, images[i] is default image', function() {
                // defImg is array
                testUrl([defImg[0]]);

                // defImg is url
                var testImage = 'test2.png';
                App.Data.settings.get('settings_skin').img_default = testImage;
                testUrl([testImage]);
                App.Data.settings.get('settings_skin').img_default = defImg;
            });

            it('`images` is array with data, images[i] isn\'t default image, images[i] has absolute path', function() {
                // http protocol
                testUrl(['http://test.revelup.com/test.png']);

                // https protocol
                testUrl(['https://test.revelup.com/test.png']);
            });

            it('`images` is array with data, images[i] isn\'t default image, images[i] has relative path', function() {
                var images = ['test.png', '/path/to/test.png']
                model.set('images', images);
                model.images();
                expect(model.get('images')).toEqual(images.map(addHost));
                expect(model.get('image')).toEqual(addHost(images[0]));

                function addHost(url) {
                    return host + url.replace(/^([^\/])/, '/$1');
                }
            });

            function testUrl(images) {
                model.set('images', images);
                model.images();
                expect(model.get('images')).toEqual(images);
                expect(model.get('image')).toBe(images[0]);
            }

            function emptyImages() {
                var image = model.get('image');
                model.set('images', null);
                model.images();
                expect(model.get('images')).toEqual([image]);
                expect(model.get('image')).toBe(image);
            }
        });

        describe('isParent()', function() {
            var model;

            beforeEach(function() {
                model = new App.Models.Product();
            });

            it('`attribute_type` is 0 (usual product)', function() {
                model.set('attribute_type', 0);
                expect(model.isParent()).toBe(false);
            });

            it('`attribute_type` is 1 (parent product)', function() {
                model.set('attribute_type', 1);
                expect(model.isParent()).toBe(true);
            });

            it('`attribute_type` is 2 (child product)', function() {
                model.set('attribute_type', 2);
                expect(model.isParent()).toBe(false);
            });
        });

        describe('checkStockAmount()', function() {
            var model, inventory;

            beforeEach(function() {
                model = new App.Models.Product();
                inventory = App.Data.settings.get("settings_system").cannot_order_with_empty_inventory;
            });

            afterEach(function() {
                App.Data.settings.get("settings_system").cannot_order_with_empty_inventory = inventory;
            });

            it('system_settings.cannot_order_with_empty_inventory is false', function() {
                App.Data.settings.get("settings_system").cannot_order_with_empty_inventory = false;
                model.checkStockAmount();

                expect(model.get('stock_amount')).toBe(999);
            });

            it('system_settings.cannot_order_with_empty_inventory is true', function() {
                var stockAmount = 5;
                App.Data.settings.get("settings_system").cannot_order_with_empty_inventory = true;
                model.set('stock_amount', stockAmount);
                model.checkStockAmount();

                expect(model.get('stock_amount')).toBe(stockAmount);
            });
        });

        describe('convertTimetables()', function() {
            var timetable;

            $.ajax({
                type: "GET",
                url: "js/utest/data/Timetable.json",
                dataType: "json",
                async: false,
                success: function(data) {
                    timetable = data.timetable;
                }
            });

            beforeEach(function() {
                spyOn(window, 'format_timetables');
            });

            it('timetables isn\'t set', function() {
                model.convertTimetables();
                expect(window.format_timetables).not.toHaveBeenCalled();
            });

            it('timetables is set', function() {
                model.set('timetables', timetable)
                model.convertTimetables();
                expect(window.format_timetables).toHaveBeenCalledWith(timetable);
            });
        });

        it('isComboBased()', function() {
            model.set({
                is_combo: true,
                has_upsell: false
            });
            expect(model.isComboBased()).toBe(true);

            model.set({
                is_combo: false,
                has_upsell: true
            });
            expect(model.isComboBased()).toBe(true);

            model.set({
                is_combo: false,
                has_upsell: false
            });
            expect(model.isComboBased()).toBe(false);
        });
    });

    describe("App.Collections.Products", function() {
        var collection;

        beforeEach(function() {
            collection = new App.Collections.Products();
        });

        it('Environment', function() {
            expect(App.Collections.Products).toBeDefined();
        });

        it('Create collection', function() {
            var constructorPrototype = App.Collections.Products.prototype;
            expect(collection.toJSON()).toEqual([]);
            expect(collection.sortStrategy).toBe(constructorPrototype.sortStrategy);
            expect(collection.sortKey).toBe(constructorPrototype.sortKey);
            expect(collection.sortOrder).toBe(constructorPrototype.sortOrder);
            expect(collection.model).toBe(constructorPrototype.model);
        });

        describe('modelId(attrs)', function() {
            var collection;

            beforeEach(function() {
                collection = new App.Collections.Products();
            });

            it('item doesn\'t have `compositeId` attribute', function() {
                var itemData = _.clone(data.modelId_item_without_compositeId)
                collection.add(itemData);
                expect(collection.modelId(itemData)).toBe(itemData.id);
            });

            it('item has `compositeId` attribute', function() {
                var itemData = _.clone(data.modelId_item_with_compositeId)
                collection.add(itemData);
                expect(collection.modelId(itemData)).toBe(itemData.compositeId);
            });
        });

        it('initialize()', function() {
            spyOn(collection, 'listenTo');
            collection.initialize();
            expect(collection.listenTo).toHaveBeenCalledWith(collection, 'change:active', collection.check_active);
        });

        describe('get_product(id)', function() {
            var collection, item, result;

            beforeEach(function() {
                collection = new App.Collections.Products();
                item = new App.Models.Product();
                collection.add(item);
                result = undefined;
                spyOn(item, 'get_product').and.callFake(function() {
                    return result;
                });
            });

            it('id is valid', function() {
                var id = 12;
                result = item;

                expect(collection.get_product(id)).toBe(item);
                expect(item.get_product).toHaveBeenCalledWith(id);
            });

            it('id is invalid', function() {
                var id = 12;

                expect(collection.get_product(id)).toBe(result);
                expect(item.get_product).toHaveBeenCalledWith(id);
            });
        });

        describe('get_products(id_category, search)', function() {
            var collection, ajaxData, ajax, ajaxOpts, fetching, skin,
                ajaxPattern = {
                    type: 'GET',
                    url: "/weborders/products/",
                    dataType: 'json'
                };

            beforeEach(function() {
                collection = new App.Collections.Products();
                ajax = Backbone.$.Deferred();
                fetching = Backbone.$.Deferred();
                ajaxData = undefined;

                spyOn(Backbone.$, 'Deferred').and.callFake(function(options) {
                    return fetching;
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function(options) {
                    ajaxOpts = options;
                    ajax.fail(options.error);
                    ajax.done(options.successResp.bind(window, ajaxData));
                    return ajax;
                });

                spyOn(window, 'format_timetables').and.callFake(function(timetables) {
                    return timetables;
                });

                spyOn(App.Data.settings, 'get').and.callFake(function(prop) {
                    if(prop === 'skin') {
                        return skin;
                    }
                    return Backbone.Model.prototype.get.apply(App.Data.settings, arguments);
                });
            });

            it('failure request', function() {
                spyOn(collection, 'onProductsError');
                var id_category = 12;
                collection.get_products(id_category);

                ajax.reject();

                checkAjaxRequest();
                expect(fetching.state()).toBe('pending');
                expect(collection.onProductsError).toHaveBeenCalled();
            });

            it('request with no product_id or search param', function() {
                spyOn(collection, 'onProductsError');
                var deferred = collection.get_products();
                expect(deferred.state()).toBe('resolved');
            });

            it('id_category is passed, response.status is "OK"', function() {
                var id_category = 12;
                ajaxData = _.clone(data.get_products_without_gift_card);
                collection.get_products(id_category);
                ajax.resolve();

                successfulResponse();
                expect(ajaxOpts.data.category).toBe(id_category);
            });

            it('search is passed, response.status is "OK"', function() {
                var search = 'product';
                ajaxData = _.clone(data.get_products_without_gift_card);
                collection.get_products(undefined, search);
                ajax.resolve();

                successfulResponse();
                expect(ajaxOpts.data.search).toBe(search);
            });

            it('response.status is "OK", response.data[i].is_gift is true, skin isn\'t `mlb`', function() {
                ajaxData = _.clone(data.get_products_without_gift_card);
                ajaxData[0].is_gift = true;
                skin = 'retail';
                collection.get_products(12);
                ajax.resolve();

                successfulResponse();
            });

            it('response.status is "OK", response.data[i].is_gift is true, skin is `mlb`', function() {
                ajaxData = _.clone(data.get_products_without_gift_card);
                ajaxData[0].is_gift = true;
                skin = 'mlb';
                collection.get_products(12);
                ajax.resolve();

                checkAjaxRequest();
                expect(fetching.state()).toBe('resolved');
                expect(window.format_timetables).not.toHaveBeenCalled();
                expect(collection.length).toBe(0);
            });

            function successfulResponse() {
                checkAjaxRequest();
                expect(fetching.state()).toBe('resolved');
                expect(collection.length).toBe(1);
                expect(collection.at(0).get('compositeId')).toBe(ajaxData[0].id + '_' + ajaxData[0].id_category);
            }

            function checkAjaxRequest() {
                expect(ajaxOpts.type).toBe(ajaxPattern.type);
                expect(ajaxOpts.url).toBe(ajaxPattern.url);
                expect(ajaxOpts.dataType).toBe(ajaxPattern.dataType);
                expect(ajaxOpts.data.establishment).toBe(App.Data.settings.get('establishment'));
            }
        });

        it('onProductsError()', function() {
            spyOn(App.Data.errors, 'alert');
            collection.onProductsError();
            expect(App.Data.errors.alert).toHaveBeenCalledWith(MSG.ERROR_PRODUCTS_LOAD, true);
        });

        describe('check_active(model)', function() {
            var collection, product, categories;

            beforeEach(function() {
                collection = new App.Collections.Products();
                product = new App.Models.Product();
                collection.add(product);
                categories = App.Data.categories;
                App.Data.categories = {set_inactive: new Function()};

                spyOn(App.Data.categories, 'set_inactive');
            });

            afterEach(function() {
                App.Data.categories = categories;
            });

            it('all items are inactive', function() {
                product.set('active', false);
                collection.check_active(product);

                expect(App.Data.categories.set_inactive).toHaveBeenCalledWith(product.get('id_category'));
            });

            it('at least one item is active', function() {
                product.set('active', true);
                collection.check_active(product);

                expect(App.Data.categories.set_inactive).not.toHaveBeenCalled();
            });
        });

        describe('check_active(model)', function() {
            var collection, product, categories;

            beforeEach(function() {
                collection = new App.Collections.Products();
                product = new App.Models.Product();
                collection.add(product);
                categories = App.Data.categories;
                App.Data.categories = {set_inactive: new Function()};

                spyOn(App.Data.categories, 'set_inactive');
            });

            afterEach(function() {
                App.Data.categories = categories;
            });

            it('all items are inactive', function() {
                product.set('active', false);
                collection.check_active(product);

                expect(App.Data.categories.set_inactive).toHaveBeenCalledWith(product.get('id_category'));
            });

            it('at least one item is active', function() {
                product.set('active', true);
                collection.check_active(product);

                expect(App.Data.categories.set_inactive).not.toHaveBeenCalled();
            });
        });

        describe('getAttributeValues(type)', function() {
            var collection;

            beforeEach(function() {
                collection = new App.Collections.Products();
            });

            it('no items', function() {
                expectEmptyResult();
            });

            it('items exist, no parent items', function() {
                var items = deepClone(data.getAttributeValues_items);
                items[0].attribute_type = 0;
                items[1].attribute_type = 2;
                collection.add(items);

                expectResult(items);
            });

            it('item exists, `attribute_1_name` and `attribute_1_name` are not set', function() {
                var item = deepClone(data.product_with_image);
                collection.add(item);

                expectEmptyResult();
            });

            it('items exist, parent items exist, `attribute_1_values` and `attribute_2_values` aren\'t array', function() {
                var items = deepClone(data.getAttributeValues_items);
                items[0].attribute_1_values = null;
                items[0].attribute_2_values = null;
                items[1].attribute_1_values = null;
                items[1].attribute_2_values = null;
                collection.add(items);

                expect(collection.getAttributeValues(0)).toEqual({'Attribute 1': []});
                expect(collection.getAttributeValues(1)).toEqual({'Attribute 1': []});
                expect(collection.getAttributeValues(2)).toEqual({'Attribute 2': []});
            });

            it('items exist, parent items exist, `attribute_1_values` and `attribute_2_values` are array', function() {
                var items = deepClone(data.getAttributeValues_items);

                collection.add(items);
                expectResult(items);
            });

            function expectEmptyResult() {
                expect(collection.getAttributeValues(0)).toEqual({});
                expect(collection.getAttributeValues(1)).toEqual({});
                expect(collection.getAttributeValues(2)).toEqual({});
            }

            function expectResult(items) {
                var result1 = {},
                    result2 = {};

                result1[items[0].attribute_1_name] = _.union(items[0].attribute_1_values, items[1].attribute_1_values).sort();
                result2[items[0].attribute_2_name] = _.union(items[0].attribute_2_values, items[1].attribute_2_values).sort();

                expect(collection.getAttributeValues(0)).toEqual(result1);
                expect(collection.getAttributeValues(1)).toEqual(result1);
                expect(collection.getAttributeValues(2)).toEqual(result2);
            }
        });
    });

    describe("App.Collections.Products.init(id_category)", function() {
        var collection, products,
            category = 12;

        beforeEach(function() {
            collection = new App.Collections.Products();
            products = App.Data.products;
            App.Data.products = {};
            App.Data.products[category] = {};

            spyOn(App.Collections.Products.prototype, 'get_products').and.returnValue(Backbone.$.Deferred());
        });

        afterEach(function() {
            App.Data.products = products;
        });

        it("collection already exists", function() {
            var result = App.Collections.Products.init(category);

            expect(result.state()).toBe('resolved');
            expect(App.Collections.Products.prototype.get_products).not.toHaveBeenCalled();
        });

        it("collection doesn\'t exist", function() {
            var category = 1,
                result = App.Collections.Products.init(category);

            expect(result.state()).toBe('pending');
            expect(App.Data.products[category] instanceof App.Collections.Products).toBe(true);
            expect(App.Collections.Products.prototype.get_products).toHaveBeenCalledWith(category);
        });
    });

    describe("App.Collections.Products.get_slice_products(ids)", function() {
        var collection, products, def, ids,
            category = 12;

        beforeEach(function() {
            collection = new App.Collections.Products();
            products = App.Data.products;
            App.Data.products = {};
            App.Data.products[category] = {};
            def = Backbone.$.Deferred();

            spyOn(App.Collections.Products.prototype, 'get_products').and.callFake(function(categories) {
                ids = categories;
                return def;
            });
        });

        afterEach(function() {
            App.Data.products = products;
        });

        it("collections already exist", function() {
            var result = App.Collections.Products.get_slice_products([category]);

            expect(result.state()).toBe('resolved');
            expect(App.Collections.Products.prototype.get_products).not.toHaveBeenCalled();
        });

        it("collections don\'t exist", function() {
            var category2 = 1,
                result = App.Collections.Products.get_slice_products([category, category2]);
            def.resolve();

            expect(result.state()).toBe('resolved');
            expect(App.Collections.Products.prototype.get_products).toHaveBeenCalled();
            expect(ids).toEqual([category2]);
            expect(App.Data.products[category2] instanceof App.Collections.Products).toBe(true);
        });
    });
});
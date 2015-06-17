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
            expect(model.toJSON()).toEqual(defInitialized);
        });

        describe('initialize()', function() {
            var skin = App.skin;

            beforeEach(function() {
                spyOn(model, 'listenTo');
                spyOn(model, 'images');
            });

            afterEach(function() {
                App.skin = skin;
            });


            it('`image` is empty', function() {
                model.initialize();

                generalBehavior();
                expect(model.get('image')).toEqual(defInitialized.image);
            });

            it('`image` exists', function() {
                var productWithImage = data.product_with_image;

                model.addJSON(_.extend({}, productWithImage));
                model.initialize();

                generalBehavior();
                expect(model.get('image')).toEqual(productWithImage.image);
            });

            it('skin isn\'t RETAIL', function() {
                App.skin = !App.Skins.RETAIL;

                model.initialize();

                generalBehavior(model);
                expect(model.listenTo).not.toHaveBeenCalled();
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
        });

        describe('addJSON(data)', function() {
            var model;

            function generalBehavior() {
                expect(model.checkStockAmount).toHaveBeenCalled();
            }

            beforeEach(function() {
                model = new App.Models.Product();
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

            it('parseInt(data.original_tax, 10) isn\'t NaN', function() {
                var modelData = _.clone(data.addJSON_with_original_tax1);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(modelData);

                modelData = _.clone(data.addJSON_with_original_tax2);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(modelData);

                generalBehavior();
            });

            it('parseInt(data.original_tax, 10) is NaN', function() {
                var modelData = _.clone(data.addJSON_without_original_tax);
                model.addJSON(_.clone(modelData));
                expect(model.set).toHaveBeenCalledWith(_.extend({}, modelData, {original_tax: modelData.tax}));
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

        // describe('get_child_products()', function() {
        //     var arg,
        //         ajaxStub = function() {
        //             arg = arguments;
        //         },
        //         childAjaxJSON, addChild;

        //     beforeEach(function() {
        //         childAjaxJSON = deepClone(products.childAjaxJSON);

        //         spyOn($,'ajax').and.callFake(ajaxStub);
        //         addChild = spyOn(App.Collections.ChildProducts.prototype, 'add_child').and.returnValue(new App.Models.ChildProduct);
        //     });

        //     it('try to get child for not parent product', function() {
        //         model.get_child_products();
        //         expect($.ajax).not.toHaveBeenCalled();
        //     });

        //     it('get child for parent product', function() {
        //         model.set('attribute_type', 1);
        //         model.get_child_products();
        //         var data = {status: "OK", data: childAjaxJSON};
        //         arg[0].success(data);

        //         expect(addChild.calls.count()).toBe(childAjaxJSON.length);
        //         expect(addChild.calls.mostRecent().args[0]).toBe(childAjaxJSON[1]);
        //     });
        // });



    //     // get child products
    //     describe('Function update_active', function() {

    //         var attr;

    //         beforeEach(function() {
    //            attr = false;
    //            spyOn(App.Collections.ChildProducts.prototype, 'check_active').and.callFake(function() {
    //                 return attr;
    //             });
    //         });

    //         it('without child', function() {
    //             expect(model.update_active()).toBe(false);
    //         });

    //         it('with child, return false', function() {
    //             model.set('child_products', new App.Collections.ChildProducts());
    //             model.update_active();
    //             expect(model.get('active')).toBe(false);
    //         });

    //         it('with child, return true', function() {
    //             model.set('child_products', new App.Collections.ChildProducts());
    //             attr = true;
    //             model.update_active();
    //             expect(model.get('active')).toBe(true);
    //             expect(App.Collections.ChildProducts.prototype.check_active).toHaveBeenCalled();
    //         });
    //     });

    //     //create model from ajax
    //     describe('Function create', function() {

    //         it('with image', function() {
    //             spyOn(model, 'set');
    //             model.create(defJSON);
    //             expect(model.set).toHaveBeenCalledWith(defJSON);
    //         });

    //         it('without image', function() {
    //             spyOn(model, 'set');
    //             model.create(defJSON2);
    //             defJSON2.image = App.Data.settings.get("settings_skin").img_default;
    //             expect(model.set).toHaveBeenCalledWith(defJSON2);
    //         });
    //     });

    //     //check if all attributes selected
    //     describe('Function check_selected', function() {

    //         var childSelectedJSON;

    //         beforeEach(function() {
    //             spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
    //             childSelectedJSON = deepClone(products.childSelectedJSON);
    //             model.addJSON(childSelectedJSON);
    //         });

    //         it('attribute_1 disable, attribute_2 unchecked', function() {
    //             model.set('attribute_1_enable', false);
    //             expect(model.check_selected()).toBe(false);
    //         });

    //         it('attribute_1 disable, attribute_2 checked', function() {
    //             model.set('attribute_1_enable', false);
    //             model.set('attribute_2_selected', 2);
    //             expect(model.check_selected()).toBe(true);
    //         });

    //         it('attribute_2 disable, attribute_1 unchecked', function() {
    //             model.unset('attribute_2_name');
    //             expect(model.check_selected()).toBe(false);
    //         });

    //         it('attribute_2 disable, attribute_1 checked', function() {
    //             model.set('attribute_2_enable', false);
    //             model.set('attribute_1_selected', 2);
    //             expect(model.check_selected()).toBe(true);
    //         });

    //         it('attribute_1 and attribute_2 enable, attribute_1 checked, attribute_2 unchecked', function() {
    //             model.set('attribute_1_selected', 1);
    //             expect(model.check_selected()).toBe(false);
    //         });

    //         it('attribute_1 and attribute_2 enable, attribute_1 checked, attribute_2 checked', function() {
    //             model.set('attribute_1_selected', 1);
    //             model.set('attribute_2_selected', 2);
    //             expect(model.check_selected()).toBe(true);
    //         });
    //     });

    //     //check if gift card number setted if product is gift
    //     describe('Function check_gift', function() {

    //         var obj = {
    //                 success: function() {},
    //                 error: function() {}
    //             };

    //         beforeEach(function() {
    //             spyOn(obj, 'success');
    //             spyOn(obj, 'error');
    //         });

    //         it('for not gift product', function() {
    //            model.set('is_gift', false) ;
    //            model.check_gift(obj.success, obj.error);
    //            expect(obj.success).toHaveBeenCalled();
    //         });

    //         it('for gift product without gift card number', function() {
    //            model.set('is_gift', true) ;
    //            model.set('gift_card_number', '');
    //            model.check_gift(obj.success, obj.error);
    //            expect(obj.error).toHaveBeenCalled();
    //         });

    //         it('for gift product with gift card number, but price is 0', function() {
    //            model.set('is_gift', true) ;
    //            model.set('gift_card_number', '123');
    //            model.set('price', '0.00');
    //            model.check_gift(obj.success, obj.error);
    //            expect(obj.error).toHaveBeenCalled();
    //         });

    //         it('for gift product with gift card number, price not 0', function() {
    //            var args;
    //            model.set('is_gift', true) ;
    //            model.set('gift_card_number', '123');
    //            model.set('price', 123);
    //            spyOn($, 'ajax').and.callFake(function() {
    //                args = arguments[0];
    //            });
    //            model.check_gift(obj.success, obj.error);
    //            args.success({status: 'OK'});
    //            expect(obj.success).toHaveBeenCalled();
    //         });

    //         describe('for gift product. Check ajax request.', function() {
    //             var args;

    //             beforeEach(function() {
    //                 args = null;
    //                 spyOn($, 'ajax').and.callFake(function() {
    //                     args = arguments[0];
    //                 });
    //                 model.set('is_gift', true) ;
    //                 model.set('gift_card_number', '123');
    //                 model.set('price', 123);
    //             });

    //             it('invalid card. Not checked before', function() {
    //                 model.check_gift(obj.success, obj.error);
    //                 args.success({status: 'ERROR'});
    //                 expect(obj.error).toHaveBeenCalled();
    //                 expect(model.get('checked_gift_cards')['123']).toBe(false);
    //             });

    //             it('invalid card. Checked before', function() {
    //                 model.set('checked_gift_cards', {'123': false});
    //                 model.check_gift(obj.success, obj.error);
    //                 expect(args).toBeNull();
    //                 expect(obj.error).toHaveBeenCalled();
    //             });

    //             it('correct card. Not checked before', function() {
    //                 model.check_gift(obj.success, obj.error);
    //                 args.success({status: 'OK'});
    //                 expect(obj.success).toHaveBeenCalled();
    //                 expect(model.get('checked_gift_cards')['123']).toBe(true);
    //             });

    //             it('correct card. Checked before', function() {
    //                 model.set('checked_gift_cards', {'123': true});
    //                 model.check_gift(obj.success, obj.error);
    //                 expect(args).toBeNull();
    //                 expect(obj.success).toHaveBeenCalled();
    //             });
    //         });
    //     });

    //     describe('Function check_repeat', function() {
    //         var obj = {
    //                 total: {
    //                     get_bag_charge: function() {},
    //                     get_delivery_charge: function() {}
    //                 },
    //                 checkout: {
    //                     get: function() {}
    //                 }
    //             },
    //             bag_charge,
    //             delivery_charge,
    //             dining_option,
    //             actual_data;

    //         beforeEach(function() {
    //             bag_charge = 10;
    //             delivery_charge = 5;
    //             dining_option = 'DINING_OPTION_TOGO';
    //             actual_data = {
    //                 available: true,
    //                 is_gift: false,
    //                 is_cold: false,
    //                 price: 8,
    //                 uom: 'uom',
    //                 tax: 9,
    //                 sold_by_weight : false
    //             };
    //             model.set(actual_data);
    //             model.set('actual_data', actual_data);
    //             spyOn(obj.total, 'get_bag_charge').and.callFake(function() {
    //                 return bag_charge;
    //             });
    //             spyOn(obj.total, 'get_delivery_charge').and.callFake(function() {
    //                 return delivery_charge;
    //             });
    //             spyOn(obj.checkout, 'get').and.callFake(function() {
    //                 return dining_option;
    //             });
    //         });

    //         it('no changes', function() {
    //             expect(model.check_repeat(obj)).toBe(0);
    //         });

    //         it('is bag charge item, not change price', function() {
    //             model.set('name', MSG.BAG_CHARGE_ITEM);
    //             model.set('price', bag_charge);
    //             expect(model.check_repeat(obj)).toBe('remove');
    //         });

    //         it('is bag charge item, change price', function() {
    //             model.set('name', MSG.BAG_CHARGE_ITEM);
    //             model.set('price', bag_charge + 1);
    //             expect(model.check_repeat(obj)).toBe('remove changed');
    //         });

    //         it('is delivery charge item, not change price', function() {
    //             model.set('name', MSG.DELIVERY_ITEM);
    //             model.set('price', delivery_charge);
    //             expect(model.check_repeat(obj)).toBe('remove');
    //         });

    //         it('is delivery charge item, change price', function() {
    //             model.set('name', MSG.DELIVERY_ITEM);
    //             model.set('price', delivery_charge + 1);
    //             expect(model.check_repeat(obj)).toBe('remove changed');
    //         });

    //         it('is unavailable', function() {
    //             model.get('actual_data').available = false;
    //             expect(model.check_repeat(obj)).toBe('remove changed');
    //         });

    //         it('from gift to not gift', function() {
    //             model.set('is_gift', true);
    //             expect(model.check_repeat(obj)).toBe('changed');
    //         });

    //         it('from not gift to gift', function() {
    //             model.get('actual_data').is_gift = true;
    //             expect(model.check_repeat(obj)).toBe('remove changed');
    //         });

    //         it('changed is_cold', function() {
    //             model.set('is_cold', true);
    //             expect(model.check_repeat(obj)).toBe('changed');
    //         });

    //         it('changed price', function() {
    //             model.set('price', 100);
    //             expect(model.check_repeat(obj)).toBe('changed');
    //         });

    //         it('changed tax for gift product', function() {
    //             model.set('is_gift', true);
    //             model.get('actual_data').is_gift = true;
    //             model.set('tax', 10);
    //             expect(model.check_repeat(obj)).toBe(0);
    //         });

    //         it('changed tax for is_cold and dining options to go', function() {
    //             model.set('is_cold', true);
    //             model.get('actual_data').is_cold = true;
    //             model.set('tax', 10);
    //             expect(model.check_repeat(obj)).toBe(0);
    //         });

    //         it('changed tax for other', function() {
    //             model.set('tax', 10);
    //             expect(model.check_repeat(obj)).toBe('changed');
    //         });
    //     });

    });

    // describe("App.Collections.Products", function() {

    //     var model, defColl, defCollAns, defCollAnsLoad;

    //     beforeEach(function() {
    //         model = new App.Collections.Products();
    //         defColl = deepClone(products.defColl);
    //         defCollAns = deepClone(products.defCollAns);
    //         defCollAnsLoad = deepClone(products.defCollAnsLoad);
    //     });

    //     it('Environment', function() {
    //         expect(App.Collections.Products).toBeDefined();
    //     });

    //     it('Create model', function() {
    //         expect(model.toJSON()).toEqual([]);
    //     });

    //     it('Function comparator', function() {
    //         model.add(defColl);
    //         expect(model.at(0).toJSON().id).toEqual(defCollAns[1].id);
    //         expect(model.at(1).toJSON().id).toEqual(defCollAns[0].id);
    //     });

    //     it('Function get_product', function() {
    //         var prod1 = new App.Models.Product({id: 1}),
    //             prod2 = new App.Models.Product({id: 20});
    //             prod3 = new App.Models.Product({id: 300});

    //         model.add(prod1);
    //         model.add([prod2, prod3]);

    //         // product with this id is not in the collection
    //         expect(model.get_product(3)).toBeUndefined();

    //         // product with this id is in the collection
    //         expect(model.get_product(20)).toBe(prod2);
    //     });

    //     it('Function get_products', function() {
    //         var arg,
    //             ajaxStub = function() {
    //                 arg = arguments;
    //             };

    //         spyOn($,'ajax').and.callFake(ajaxStub);
    //         var create = spyOn(App.Models.Product.prototype, 'create').and.returnValue(new App.Models.Product);

    //         model.get_products(50);

    //         arg[0].successResp(defColl);
    //         expect(create.calls.count()).toBe(2);
    //         expect(create.calls.mostRecent().args[0]).toEqual(defColl[1]);
    //         expect(arg[0].url).toBe("testHost/weborders/products/");
    //     });

    //     describe('Function check_active', function() {

    //         beforeEach(function() {
    //             model.add(deepClone(products.check_active));
    //             App.Data.categories = {
    //                 set_inactive: function() {}
    //             };
    //             spyOn(App.Data.categories, 'set_inactive');
    //         });

    //         it('one active, one inactive', function() {
    //             model.check_active(model.get({id: 1}));
    //             expect(App.Data.categories.set_inactive).not.toHaveBeenCalled();
    //         });

    //         it('all inactive', function() {
    //             model.check_active(model.get({id: 3}));
    //             expect(App.Data.categories.set_inactive).toHaveBeenCalledWith(56);
    //         });
    //     });
    // });

    // describe("App.Collections.Products static methods", function() {

    //     beforeEach(function() {
    //         this.products = App.Data.products;
    //         App.Data.products = [];
    //     });

    //     afterEach(function() {
    //         App.Data.products = this.products;
    //     });

    //     it("Function init", function() {
    //         spyOn(App.Collections.Products.prototype, 'get_products');
    //         App.Collections.Products.init(5);

    //         expect(App.Data.products[5]).toBeDefined();
    //         expect(App.Collections.Products.prototype.get_products).toHaveBeenCalledWith(5);
    //         var count = App.Collections.Products.prototype.get_products.callCount;

    //         App.Collections.Products.init(5);
    //         expect(App.Collections.Products.prototype.get_products.callCount).toBe(count);
    //     });

    //     it("Function get_slice_products", function() {
    //         var dfd = $.Deferred();
    //         spyOn(App.Collections.Products.prototype, 'get_products').and.returnValue(dfd);
    //         spyOn(App.Collections.Products.prototype, 'where').and.returnValue({name: 'test'});
    //         App.Data.products[6] = 'defined';
    //         App.Collections.Products.get_slice_products([5, 6]);

    //         expect(App.Collections.Products.prototype.get_products).toHaveBeenCalledWith([5]);
    //         dfd.resolve();

    //         expect(App.Data.products[5]).toBeDefined();
    //         expect(App.Data.products[5].length).toBe(1);
    //         expect(App.Data.products[5].at(0).get('name')).toBe('test');
    //     });
    // });
});
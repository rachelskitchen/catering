define(['products'], function() {
    
    var products;
    
    $.ajax({
        type: "GET",
        url: "js/utest/data/Products.json",
        dataType: "json",
        async: false,
        success: function(data) {
            products = data;
        }
    });
        
    describe("App.Models.Product", function() {
        
        var model, def, ex, defJSON, defJSONansw, defJSON2, defJSON2answ, childJSON;
        
        beforeEach(function() {
            model = new App.Models.Product();
            def = deepClone(products.def);
            ex = deepClone(products.ex);
            defJSON = deepClone(products.defJSON);
            defJSONansw = deepClone(products.defJSONansw);
            defJSON2 = deepClone(products.defJSON2);
            defJSON2answ = deepClone(products.defJSON2answ);   
            childJSON = deepClone(products.childJSON);            
        });

        it('Environment', function() {
            expect(App.Models.Product).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        describe('Function addJSON', function() {
            
            it('field image not empty', function() {
                spyOn(model, 'set');
                model.addJSON(defJSON);
                expect(model.set).toHaveBeenCalledWith(defJSON);
            });
            
            it('field image empty', function() {
                model.set('image', 'test');
                model.addJSON(defJSON2);
                expect(model.toJSON().image).toEqual('test');
            });
            
            it('load child products', function() {
                var add = spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                expect(add).toHaveBeenCalledWith(childJSON.child_products);
                expect(model.get('child_products').__proto__).toBe(App.Collections.ChildProducts.prototype);
            });
        });
        
        describe('Function clone', function() {
            
            it('clone without child', function() {
                model.addJSON(ex);
                var clone = model.clone();
                expect(clone.toJSON()).toEqual(ex);
                expect(clone.cid).not.toBe(model.cid);
                expect(clone.__proto__).toBe(model.__proto__);
            });
            
            it('clone child products', function() {
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                var clon = spyOn(model.get('child_products'), 'clone').and.returnValue(new App.Collections.ChildProducts);
                var clone = model.clone();
                expect(clon).toHaveBeenCalled();
                expect(clone.get('child_products').__proto__).toBe(App.Collections.ChildProducts.prototype);
                expect(clone.get('child_products').models).not.toBe(model.get('child_products').models);
            });
        });
        
        describe('Function update', function() {
            
            it('update without child', function() {
                var clone = model.clone().addJSON(ex);
                expect(model.toJSON()).toEqual(def);
                expect(model.update(clone).toJSON()).toEqual(ex);
            });
            
            it('update with child', function() {
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                var update = spyOn(model.get('child_products'), 'update').and.returnValue(new App.Collections.ChildProducts);
                model.update(model);
                expect(update).toHaveBeenCalledWith(model.get('child_products'));                
            });
        });
        
        // get active product, depends on child and selected attributes
        describe('Function get_product', function() {
            
            it('without child. attribute_type = 0', function() {
                expect(model.get_product()).toBe(model);
            });
            
            it('without child. attribute_type = 2', function() {
                model.set('attribute_type', 2);
                expect(model.get_product()).toBe(model);
            });
            
            it('without child. attribute_type = 1', function() {
                model.set('attribute_type', 1);
                expect(model.get_product()).toBe(model);
            });
            
            it('attribute_type = 1. get by id', function() {
                // don't have model with this id
                expect(model.get_product(176)).toBeNull();

                // current model with this id
                model.set('id', 176);
                expect(model.get_product(176)).toBe(model);
                
                // child model with this id
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                var obj = {};
                spyOn(App.Collections.ChildProducts.prototype, 'get_product_id').and.returnValue(obj);
                expect(model.get_product(176)).toBe(obj);
                expect(App.Collections.ChildProducts.prototype.get_product_id).toHaveBeenCalledWith(176);
            });
            
            it('with child. attribute_type = 1', function() {
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                var get = spyOn(model.get('child_products'), 'get_product').and.returnValue(new App.Models.Product);
                expect(model.get_product().__proto__).toBe(App.Models.Product.prototype);
                expect(get).toHaveBeenCalledWith({
                    attribute_1_selected: childJSON.attribute_1_selected,
                    attribute_2_selected: childJSON.attribute_2_selected,
                    attribute_1_enable: childJSON.attribute_1_enable,
                    attribute_2_enable: childJSON.attribute_2_enable
                });
            });
        });
        
        // get active modifiers, depends on child and selected attributes
        describe('Function get_modifiers', function() {
            
            it('without child. attribute_type = 0', function() {
                expect(model.get_modifiers()).toBeNull();
            });
            
            it('without child. attribute_type = 2', function() {
                model.set('attribute_type', 2);
                expect(model.get_modifiers()).toBeNull();
            });
            
            it('without child. attribute_type = 1', function() {
                model.set('attribute_type', 1);
                expect(model.get_modifiers()).toBeNull();
            });
            
            it('with child. attribute_type = 1', function() {
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                var get = spyOn(model.get('child_products'), 'get_modifiers').and.returnValue(new App.Models.Product);
                expect(model.get_modifiers().__proto__).toBe(App.Models.Product.prototype);
                expect(get).toHaveBeenCalledWith({
                    attribute_1_selected: childJSON.attribute_1_selected,
                    attribute_2_selected: childJSON.attribute_2_selected,
                    attribute_1_enable: childJSON.attribute_1_enable,
                    attribute_2_enable: childJSON.attribute_2_enable
                });
            });
        });
        
        // get enabled attributes pair
        describe('Function get_attributes_list', function() {
            
            it('get_attributes_list without child or attribute_type != 1', function() {
                expect(model.get_attributes_list()).toEqual({});
                model.set('attribute_type', 1);
                expect(model.get_attributes_list()).toEqual({});
                model.set('attribute_type', 2);
                expect(model.get_attributes_list()).toEqual({});
            });
            
            it('get_attributes_list with child and attribute_type = 1', function() {
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                model.addJSON(childJSON);
                var get = spyOn(model.get('child_products'), 'get_attributes_list').and.returnValue({});
                expect(model.get_attributes_list()).toEqual({});
                expect(get).toHaveBeenCalled();
            });
            
        });
        
        // get child products
        describe('Function get_child_products', function() {
            
            var arg,
                ajaxStub = function() {
                    arg = arguments;
                },
                childAjaxJSON, addChild;
            
            beforeEach(function() {
                childAjaxJSON = deepClone(products.childAjaxJSON);

                spyOn($,'ajax').and.callFake(ajaxStub);
                addChild = spyOn(App.Collections.ChildProducts.prototype, 'add_child').and.returnValue(new App.Models.ChildProduct);
            });
            
            it('try to get child for not parent product', function() {
                model.get_child_products();
                expect($.ajax).not.toHaveBeenCalled();
            });
            
            it('get child for parent product', function() {
                model.set('attribute_type', 1);
                model.get_child_products();
                var data = {status: "OK", data: childAjaxJSON};
                arg[0].success(data);

                expect(addChild.calls.count()).toBe(childAjaxJSON.length);
                expect(addChild.calls.mostRecent().args[0]).toBe(childAjaxJSON[1]);
            });
        });
        
        
        
        // get child products
        describe('Function update_active', function() {
            
            var attr;

            beforeEach(function() {
               attr = false;
               spyOn(App.Collections.ChildProducts.prototype, 'check_active').and.callFake(function() {
                    return attr;
                });
            });
            
            it('without child', function() {
                expect(model.update_active()).toBe(false);
            });
            
            it('with child, return false', function() {
                model.set('child_products', new App.Collections.ChildProducts());
                model.update_active();
                expect(model.get('active')).toBe(false);
            });
            
            it('with child, return true', function() {
                model.set('child_products', new App.Collections.ChildProducts());
                attr = true;
                model.update_active();
                expect(model.get('active')).toBe(true);
                expect(App.Collections.ChildProducts.prototype.check_active).toHaveBeenCalled();
            });            
        });
        
        //create model from ajax
        describe('Function create', function() {
            
            it('with image', function() {
                spyOn(model, 'set');
                model.create(defJSON);
                expect(model.set).toHaveBeenCalledWith(defJSON);
            });
            
            it('without image', function() {
                spyOn(model, 'set');
                model.create(defJSON2);
                defJSON2.image = App.Data.settings.get("settings_skin").img_default;
                expect(model.set).toHaveBeenCalledWith(defJSON2);
            });
        });
        
        //check if all attributes selected
        describe('Function check_selected', function() {
            
            var childSelectedJSON;
            
            beforeEach(function() {
                spyOn(App.Collections.ChildProducts.prototype, 'addJSON').and.returnValue(new App.Collections.ChildProducts);
                childSelectedJSON = deepClone(products.childSelectedJSON);
                model.addJSON(childSelectedJSON);
            });
            
            it('attribute_1 disable, attribute_2 unchecked', function() {
                model.set('attribute_1_enable', false);
                expect(model.check_selected()).toBe(false);
            });
            
            it('attribute_1 disable, attribute_2 checked', function() {
                model.set('attribute_1_enable', false);
                model.set('attribute_2_selected', 2);
                expect(model.check_selected()).toBe(true);
            });
            
            it('attribute_2 disable, attribute_1 unchecked', function() {
                model.unset('attribute_2_name');
                expect(model.check_selected()).toBe(false);
            });
            
            it('attribute_2 disable, attribute_1 checked', function() {
                model.set('attribute_2_enable', false);
                model.set('attribute_1_selected', 2);
                expect(model.check_selected()).toBe(true);
            });
            
            it('attribute_1 and attribute_2 enable, attribute_1 checked, attribute_2 unchecked', function() {
                model.set('attribute_1_selected', 1);
                expect(model.check_selected()).toBe(false);
            });
            
            it('attribute_1 and attribute_2 enable, attribute_1 checked, attribute_2 checked', function() {
                model.set('attribute_1_selected', 1);
                model.set('attribute_2_selected', 2);
                expect(model.check_selected()).toBe(true);
            });
        });
        
        //check if gift card number setted if product is gift
        describe('Function check_gift', function() {
            
            var obj = { 
                    success: function() {}, 
                    error: function() {}
                };
            
            beforeEach(function() {
                spyOn(obj, 'success');
                spyOn(obj, 'error');
            });
            
            it('for not gift product', function() {
               model.set('is_gift', false) ;
               model.check_gift(obj.success, obj.error);
               expect(obj.success).toHaveBeenCalled();
            });
            
            it('for gift product without gift card number', function() {
               model.set('is_gift', true) ;
               model.set('gift_card_number', '');
               model.check_gift(obj.success, obj.error);
               expect(obj.error).toHaveBeenCalled();
            });
            
            it('for gift product with gift card number, but price is 0', function() {
               model.set('is_gift', true) ;
               model.set('gift_card_number', '123');
               model.set('price', '0.00');
               model.check_gift(obj.success, obj.error);
               expect(obj.error).toHaveBeenCalled();
            });
            
            it('for gift product with gift card number, price not 0', function() {
               var args;
               model.set('is_gift', true) ;
               model.set('gift_card_number', '123');
               model.set('price', 123);
               spyOn($, 'ajax').and.callFake(function() {
                   args = arguments[0];
               });
               model.check_gift(obj.success, obj.error);
               args.success({status: 'OK'});
               expect(obj.success).toHaveBeenCalled();
            });
            
            describe('for gift product. Check ajax request.', function() {
                var args;

                beforeEach(function() {
                    args = null;
                    spyOn($, 'ajax').and.callFake(function() {
                        args = arguments[0];
                    });  
                    model.set('is_gift', true) ;
                    model.set('gift_card_number', '123');
                    model.set('price', 123);
                });
                
                it('invalid card. Not checked before', function() {
                    model.check_gift(obj.success, obj.error);
                    args.success({status: 'ERROR'});
                    expect(obj.error).toHaveBeenCalled();
                    expect(model.get('checked_gift_cards')['123']).toBe(false);
                });
                
                it('invalid card. Checked before', function() {
                    model.set('checked_gift_cards', {'123': false});
                    model.check_gift(obj.success, obj.error);
                    expect(args).toBeNull();
                    expect(obj.error).toHaveBeenCalled();
                });
                
                it('correct card. Not checked before', function() {
                    model.check_gift(obj.success, obj.error);
                    args.success({status: 'OK'});
                    expect(obj.success).toHaveBeenCalled();
                    expect(model.get('checked_gift_cards')['123']).toBe(true);
                });
                
                it('correct card. Checked before', function() {
                    model.set('checked_gift_cards', {'123': true});
                    model.check_gift(obj.success, obj.error);
                    expect(args).toBeNull();
                    expect(obj.success).toHaveBeenCalled();
                });
            });
        });
        
        describe('Function check_repeat', function() {
            var obj = {
                    total: {
                        get_bag_charge: function() {},
                        get_delivery_charge: function() {}
                    },
                    checkout: {
                        get: function() {}
                    }
                },
                bag_charge,
                delivery_charge,
                dining_option,
                actual_data;
            
            beforeEach(function() {
                bag_charge = 10;
                delivery_charge = 5;
                dining_option = 'DINING_OPTION_TOGO';
                actual_data = {
                    available: true,
                    is_gift: false,
                    is_cold: false,
                    price: 8,
                    uom: 'uom',
                    tax: 9,
                    sold_by_weight : false
                };
                model.set(actual_data);
                model.set('actual_data', actual_data);
                spyOn(obj.total, 'get_bag_charge').and.callFake(function() {
                    return bag_charge;
                });
                spyOn(obj.total, 'get_delivery_charge').and.callFake(function() {
                    return delivery_charge;
                });
                spyOn(obj.checkout, 'get').and.callFake(function() {
                    return dining_option;
                });
            });

            it('no changes', function() {
                expect(model.check_repeat(obj)).toBe(0);
            });
            
            it('is bag charge item, not change price', function() {
                model.set('name', MSG.BAG_CHARGE_ITEM);
                model.set('price', bag_charge);
                expect(model.check_repeat(obj)).toBe('remove');
            });
            
            it('is bag charge item, change price', function() {
                model.set('name', MSG.BAG_CHARGE_ITEM);
                model.set('price', bag_charge + 1);
                expect(model.check_repeat(obj)).toBe('remove changed');
            });

            it('is delivery charge item, not change price', function() {
                model.set('name', MSG.DELIVERY_ITEM);
                model.set('price', delivery_charge);
                expect(model.check_repeat(obj)).toBe('remove');
            });

            it('is delivery charge item, change price', function() {
                model.set('name', MSG.DELIVERY_ITEM);
                model.set('price', delivery_charge + 1);
                expect(model.check_repeat(obj)).toBe('remove changed');
            });

            it('is unavailable', function() {
                model.get('actual_data').available = false;
                expect(model.check_repeat(obj)).toBe('remove changed');
            });

            it('from gift to not gift', function() {
                model.set('is_gift', true);
                expect(model.check_repeat(obj)).toBe('changed');
            });

            it('from not gift to gift', function() {
                model.get('actual_data').is_gift = true;
                expect(model.check_repeat(obj)).toBe('remove changed');
            });

            it('changed is_cold', function() {
                model.set('is_cold', true);
                expect(model.check_repeat(obj)).toBe('changed');
            });

            it('changed price', function() {
                model.set('price', 100);
                expect(model.check_repeat(obj)).toBe('changed');
            });

            it('changed tax for gift product', function() {
                model.set('is_gift', true);
                model.get('actual_data').is_gift = true;
                model.set('tax', 10);
                expect(model.check_repeat(obj)).toBe(0);
            });

            it('changed tax for is_cold and dining options to go', function() {
                model.set('is_cold', true);
                model.get('actual_data').is_cold = true;
                model.set('tax', 10);
                expect(model.check_repeat(obj)).toBe(0);
            });

            it('changed tax for other', function() {
                model.set('tax', 10);
                expect(model.check_repeat(obj)).toBe('changed');
            });
        });
        
    });
    
    describe("App.Collections.Products", function() {
        
        var model, defColl, defCollAns, defCollAnsLoad;
        
        beforeEach(function() {
            model = new App.Collections.Products();
            defColl = deepClone(products.defColl);
            defCollAns = deepClone(products.defCollAns);
            defCollAnsLoad = deepClone(products.defCollAnsLoad);
        });
        
        it('Environment', function() {
            expect(App.Collections.Products).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual([]);
        });
        
        it('Function comparator', function() {
            model.add(defColl);
            expect(model.at(0).toJSON().id).toEqual(defCollAns[1].id);
            expect(model.at(1).toJSON().id).toEqual(defCollAns[0].id);
        });
        
        it('Function get_product', function() {
            var prod1 = new App.Models.Product({id: 1}),
                prod2 = new App.Models.Product({id: 20});
                prod3 = new App.Models.Product({id: 300});

            model.add(prod1);
            model.add([prod2, prod3]);
            
            // product with this id is not in the collection
            expect(model.get_product(3)).toBeUndefined();
            
            // product with this id is in the collection
            expect(model.get_product(20)).toBe(prod2);
        });
        
        it('Function get_products', function() {
            var arg,
                ajaxStub = function() {
                    arg = arguments;
                };
                
            spyOn($,'ajax').and.callFake(ajaxStub);
            var create = spyOn(App.Models.Product.prototype, 'create').and.returnValue(new App.Models.Product);
            
            model.get_products(50);
            
            arg[0].successResp(defColl);
            expect(create.calls.count()).toBe(2);
            expect(create.calls.mostRecent().args[0]).toEqual(defColl[1]);
            expect(arg[0].url).toBe("testHost/weborders/products/");
        });
        
        describe('Function check_active', function() {
            
            beforeEach(function() {
                model.add(deepClone(products.check_active));
                App.Data.categories = {
                    set_inactive: function() {}
                };
                spyOn(App.Data.categories, 'set_inactive');
            });
            
            it('one active, one inactive', function() {
                model.check_active(model.get({id: 1}));
                expect(App.Data.categories.set_inactive).not.toHaveBeenCalled();
            });
            
            it('all inactive', function() {
                model.check_active(model.get({id: 3}));
                expect(App.Data.categories.set_inactive).toHaveBeenCalledWith(56);
            });
        });
    });
    
    describe("App.Collections.Products static methods", function() {
        
        beforeEach(function() {
            this.products = App.Data.products;
            App.Data.products = [];
        });
        
        afterEach(function() {
            App.Data.products = this.products;
        });
        
        it("Function init", function() {
            spyOn(App.Collections.Products.prototype, 'get_products');
            App.Collections.Products.init(5);
            
            expect(App.Data.products[5]).toBeDefined();
            expect(App.Collections.Products.prototype.get_products).toHaveBeenCalledWith(5);
            var count = App.Collections.Products.prototype.get_products.callCount;
            
            App.Collections.Products.init(5);
            expect(App.Collections.Products.prototype.get_products.callCount).toBe(count);
        });
        
        it("Function get_slice_products", function() {
            var dfd = $.Deferred();
            spyOn(App.Collections.Products.prototype, 'get_products').and.returnValue(dfd);
            spyOn(App.Collections.Products.prototype, 'where').and.returnValue({name: 'test'});
            App.Data.products[6] = 'defined';
            App.Collections.Products.get_slice_products([5, 6]);
            
            expect(App.Collections.Products.prototype.get_products).toHaveBeenCalledWith([5]);
            dfd.resolve();

            expect(App.Data.products[5]).toBeDefined();
            expect(App.Data.products[5].length).toBe(1);
            expect(App.Data.products[5].at(0).get('name')).toBe('test');
        });
    });    
});
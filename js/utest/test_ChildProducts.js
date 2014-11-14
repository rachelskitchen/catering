define(['childproducts'], function() {
    
    var child;
    
    $.ajax({
        type: "GET",
        url: "js/utest/data/ChildProducts.json",
        dataType: "json",
        async: false,
        success: function(data) {
            child = data;
        }
    });
        
    describe("App.Models.ChildProduct", function() {
        
        var model, def, exJSON, prod, modif, exJSON2, prodCreate, childJSON;
        
        beforeEach(function() {
            model = new App.Models.ChildProduct();
            def = deepClone(child.def);   
            exJSON = deepClone(child.exJSON);
            exJSON2 = deepClone(child.exJSON2);
            childJSON = deepClone(child.childJSON);
            prod = spyOn(App.Models.Product.prototype, 'addJSON').and.returnValue(new App.Models.Product),
            prodCreate = spyOn(App.Models.Product.prototype, 'create').and.returnValue(new App.Models.Product),
            modif = spyOn(App.Collections.ModifierBlocks.prototype, 'addJSON').and.returnValue(new App.Collections.ModifierBlocks);
        });

        it('Environment', function() {
            expect(App.Models.ChildProduct).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        it('Function addJSON', function() {
            model.addJSON(exJSON);
            expect(model.get('attributes')).toEqual(exJSON.attributes);
            expect(prod).toHaveBeenCalledWith(exJSON.product);
            expect(modif).toHaveBeenCalledWith(exJSON.modifiers);
        });
        
        it('Function clone', function() {
            model.addJSON(exJSON);
            var prodClon = spyOn(model.get('product'), 'clone').and.returnValue(new App.Models.Product),
                modClon = spyOn(model.get('modifiers'), 'clone').and.returnValue(new App.Collections.ModifierBlocks),
                clone = model.clone();
                
            expect(clone.__proto__).toBe(model.__proto__);
            expect(clone.cid).not.toBe(model.cid);
            expect(prodClon).toHaveBeenCalled();
            expect(modClon).toHaveBeenCalled();
            expect(clone.get('attributes')).not.toBe(model.get('attributes'));
            expect(clone.get('attributes')).toEqual(model.get('attributes'));
        });
        
        it('Function update', function() {
            model.addJSON(exJSON);
            var prodUp = spyOn(model.get('product'), 'update').and.returnValue(new App.Models.Product),
                modUp = spyOn(model.get('modifiers'), 'update').and.returnValue(new App.Collections.ModifierBlocks),
                clone = model.clone().addJSON(exJSON2);
            
            model.update(clone);                
            
            expect(prodUp).toHaveBeenCalledWith(clone.get('product'));
            expect(modUp).toHaveBeenCalledWith(clone.get('modifiers'));
            expect(model.get('attributes')).not.toBe(clone.get('attributes'));
            expect(model.get('attributes')).toEqual(clone.get('attributes'));
        });
        
        it('Function create', function() {
             model.create(childJSON);
             
             expect(prodCreate).toHaveBeenCalledWith(childJSON.product);
             expect(modif).toHaveBeenCalledWith(childJSON.modifiers);
             expect(model.get('attributes')).not.toBe(childJSON.attributes);
             expect(model.get('attributes')).toEqual(childJSON.attributes);
        });
        
        describe('Function get_attributes', function() {

            it('Function get_attributes active product', function() {
                 model.set('product', new App.Models.Product());
                 expect(model.get_attributes()).toEqual(model.get('attributes'));
            });

            it('Function get_attributes not active product', function() {
                 model.set('product', new App.Models.Product({active: false}));
                 expect(model.get_attributes()).toBe(false);
            });
        });
        
        it('Function is_active', function() {
             var obj = {};
             model.set('product', new App.Models.Product({active: obj}));
             expect(model.is_active()).toBe(obj);
        });
    });
        
    describe("App.Collections.ChildProducts", function() {
        
        var model, exJSON, add, clon, updat, exJSONCol2;
        
        beforeEach(function() {
            model = new App.Collections.ChildProducts();
            exJSON = deepClone(child.exJSONCol);
            exJSONCol2 = deepClone(child.exJSONCol2);
            add = spyOn(App.Models.ChildProduct.prototype, 'addJSON').and.returnValue(new App.Models.ChildProduct),
            clon = spyOn(App.Models.ChildProduct.prototype, 'clone').and.callFake(function() {
                return new App.Models.ChildProduct({id: Math.random()*1000|0});
            }),
            updat = spyOn(App.Models.ChildProduct.prototype, 'update').and.returnValue(new App.Models.ChildProduct);
        });

        it('Environment', function() {
            expect(App.Collections.ChildProducts).toBeDefined();
        });

        it('Function addJSON', function() {
            model.addJSON(exJSON);
            expect(model.length).toBe(2);
            expect(add.calls.count()).toBe(2);
            expect(add.calls.mostRecent().args[0]).toBe(exJSON[1]);
        });
        
        it('Function clone', function() {
            model.addJSON(exJSON);
            var clone = model.clone();
                
            expect(clone.__proto__).toBe(model.__proto__);
            expect(clone.length).toBe(model.length);
            expect(clon.calls.count()).toBe(2);
            expect(clon.calls.mostRecent().object).toBe(model.at(1));
        });
        
        it('Function update', function() {
            model.addJSON(exJSON);
            
            model.update(model);                
            
            expect(updat.calls.count()).toBe(2);
            expect(updat.calls.mostRecent().object).toBe(model.at(1));
            expect(updat.calls.mostRecent().args[0]).toBe(model.at(1));
            
            model.update(model.clone());
            expect(clon.calls.count()).toBe(4);
        });
        
        it('Function get_product_id', function() {
            var child = new App.Models.ChildProduct(),
                product = new App.Models.Product({id: 176});
            child.set('product', product);
            model.add(child);
            expect(model.get_product_id(176)).toBe(product);
            expect(model.get_product_id(177)).toBeUndefined();
        });
        
        describe('Function get_product', function() {
            
            var get_not_find, get_find;
            
            beforeEach(function() {
                get_not_find = deepClone(child.get_not_find);
                get_find = deepClone(child.get_find);
                model.add(exJSON);
            });
            
            it('both enable, both selected, not find', function() {
                expect(model.get_product(get_not_find)).toBeUndefined();
            });
            
            it('both enable, both selected, find', function() {
                expect(model.get_product(get_find)).toBe(model.at(1).get('product'));
            });
            
            it('both enable, one selected, not find', function() {
                get_find.attribute_1_selected = null;
                expect(model.get_product(get_find)).toBeUndefined();
            });
            
            it('one enable, both selected, find', function() {
                get_find.attribute_1_enable = false;
                expect(model.get_product(get_find)).toBe(model.at(1).get('product'));
            });
            
            it('one enable, one selected, find', function() {
                get_find.attribute_1_enable = false;
                get_find.attribute_1_selected = null;
                expect(model.get_product(get_find)).toBe(model.at(1).get('product'));
            });
            
            it('one enable, other selected, not find', function() {
                get_find.attribute_1_enable = false;
                get_find.attribute_2_selected = null;
                expect(model.get_product(get_find)).toBeUndefined();
            });
            
            it('one enable, one selected, find only one', function() {
                get_find.attribute_2_enable = false;
                expect(model.get_product(get_find)).toBe(model.at(0).get('product'));
            });
        });
        
        describe('Function get_modifiers', function() {
            
            var get_not_find, get_find;
            
            beforeEach(function() {
                get_not_find = deepClone(child.get_not_find);
                get_find = deepClone(child.get_find);
                model.add(exJSON);
            });
            
            it('both enable, both selected, not find', function() {
                expect(model.get_modifiers(get_not_find)).toBeUndefined();
            });
            
            it('both enable, both selected, find', function() {
                expect(model.get_modifiers(get_find)).toBe(model.at(1).get('modifiers'));
            });
            
            it('both enable, one selected, not find', function() {
                get_find.attribute_1_selected = null;
                expect(model.get_modifiers(get_find)).toBeUndefined();
            });
            
            it('one enable, both selected, find', function() {
                get_find.attribute_1_enable = false;
                expect(model.get_modifiers(get_find)).toBe(model.at(1).get('modifiers'));
            });
            
            it('one enable, one selected, find', function() {
                get_find.attribute_1_enable = false;
                get_find.attribute_1_selected = null;
                expect(model.get_modifiers(get_find)).toBe(model.at(1).get('modifiers'));
            });
            
            it('one enable, other selected, not find', function() {
                get_find.attribute_1_enable = false;
                get_find.attribute_2_selected = null;
                expect(model.get_modifiers(get_find)).toBeUndefined();
            });
            
            it('one enable, one selected, find only one', function() {
                get_find.attribute_2_enable = false;
                get_find.attribute_2_selected = null;
                expect(model.get_modifiers(get_find)).toBe(model.at(0).get('modifiers'));
            });
        });
        
        describe('Function get_attributes_list', function() {
            
            var attr, attr1, attr2, attr3, attrEx, attrEx2, attrEx3;
            
            beforeEach(function() {
                exJSON = deepClone(child.exJSON);
                model.add(exJSON);
                attr1 = deepClone(child.attr1);
                attr2 = deepClone(child.attr2);
                attr3 = deepClone(child.attr3);
                attrEx = deepClone(child.attrEx);
                attrEx2 = deepClone(child.attrEx2);
                attrEx3 = deepClone(child.attrEx3);
                spyOn(App.Models.ChildProduct.prototype, 'get_attributes').and.callFake(function() {
                    return attr;
                });
            });
            
            it('whole attributes get', function() {
                attr = attrEx;
                expect(model.get_attributes_list()).toEqual(attr1);
            });
            
            it('only first attribute defined', function() {
                attr = attrEx2;
                expect(model.get_attributes_list()).toEqual(attr2);
            });
            
            it('only second attribute defined', function() {
                attr = attrEx3;
                expect(model.get_attributes_list()).toEqual(attr3);
                
            });
        });
        
        it('Function add_child', function() {
            var create = spyOn(App.Models.ChildProduct.prototype, 'create').and.returnValue(new App.Models.ChildProduct),
                obj = {};
            
            expect(model.length).toBe(0);
            model.add_child(obj);
            expect(model.length).toBe(1);
            expect(create).toHaveBeenCalledWith(obj);
        });
        
        describe('Function check_active', function() {
            
            var attr;
            beforeEach(function() {
                model.add(new App.Models.ChildProduct());
                model.add(new App.Models.ChildProduct());
            });
            
            it('all inactive', function() {
                spyOn(App.Models.ChildProduct.prototype, 'is_active').and.returnValue(false);
                expect(model.check_active()).toBe(false);
            });
            
            it('one active', function() {
                spyOn(App.Models.ChildProduct.prototype, 'is_active').and.callFake(function() {
                    attr = !attr;
                    return attr;
                });
                expect(model.check_active()).toBe(true);
            });
        });
    });
    
});
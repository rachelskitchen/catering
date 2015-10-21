define(['myorder'], function() {
            
    describe("App.Models.Myorder", function() {
        var model, change, special;
            
        beforeEach(function() {
            model = new App.Models.Myorder();            
        });

        it('Environment', function() {
            expect(App.Models.Myorder).toBeDefined();
        });

        it('check initial listener', function() {
            change = spyOn(App.Models.Myorder.prototype, 'change'),
            model = new App.Models.Myorder();
            model.set('id_product', 'test');
            expect(change).toHaveBeenCalled();
        });
        
        it('Function get_product', function() {
            var obj = {
                get_product: function() {}
            };

            model.set('product', obj, {silent: true});
            spyOn(obj, 'get_product').and.returnValue(5);
            expect(model.get_product()).toBe(5);
            expect(obj.get_product).toHaveBeenCalled();
        });
        
        describe('Function get_modifiers', function() {
            var obj = {
                    product: {
                        get_modifiers: function() {}
                    },
                    modifiers: {}
                },
                mod;

            beforeEach(function() {
                spyOn(obj.product, 'get_modifiers').and.callFake(function() {
                    return mod;
                });
                model.set(obj, {silent: true});
            });

            it('not parent product', function() {
                mod = false;
                expect(model.get_modifiers()).toBe(obj.modifiers);
            });

            it('parent product', function() {
                mod = 7;
                expect(model.get_modifiers()).toBe(7);
            });
        });
        
        describe('Function get_initial_price', function() {
            var obj = {
                    getSizeModel: function() {}
                },
                product = {
                    get: function() {}
                },
                size;

            beforeEach(function() {
                spyOn(model, 'get_modifiers').and.returnValue(obj);
                spyOn(model, 'get_product').and.returnValue(product);
                spyOn(obj, 'getSizeModel').and.callFake(function() {                    
                    return size;
                });
                spyOn(product, 'get').and.callFake(function() {
                    return '!' + arguments[0];
                });
            });
            
            it('without size modifier', function() {
                size = false;
                expect(model.get_initial_price()).toBe('!price');
            });

            it('with size modifier', function() {
                size = {
                    get: function() { return 'size'; }
                };
                expect(model.get_initial_price()).toBe('size');
            });
        });
        
        describe('Function change_special', function() {
            var text, arg,
                modifierBlocks = new App.Collections.ModifierBlocks();                
                modifierBlocks.get_special_text = function() {
                        return text;
                    }

            beforeEach(function() {
                spyOn(model, 'get_modifiers').and.returnValue(modifierBlocks);                
                spyOn(model, 'set').and.callFake(function() {
                    arg = arguments;
                });
            });
            
            it('not selected special modifiers', function() {
                text = '';
                model.change_special();
                expect(model.set).not.toHaveBeenCalled();
            });
            
            it('some special modifiers selected', function() {
                var settings = {
                    special_requests_online: true
                };
                spyOn(App.Data.settings, 'get').and.returnValue(settings);
                text = 'test,test';
                model.change_special();
                expect(model.set).toHaveBeenCalledWith({special: 'test,test'});
            });
        });
        
        describe('Function change', function() {
            var obj;
            
            beforeEach(function() {
                obj = undefined;
                spyOn(model, 'listenTo');
                spyOn(model, 'get_modifiers').and.callFake(function() {
                    return obj;
                });
                spyOn(model, 'change_special');
            });
            
            it('product and modifiers not preset', function() {
                model.change();
                expect(model.product_listener).toBe(false);
                expect(model.modifier_listener).toBe(false);
            });
            
            it('product is present, modifiers - not', function() {
                model.set({product: new Backbone.Model()}, {silent: true});
                model.change();
                expect(model.product_listener).toBe(true);
                expect(model.modifier_listener).toBe(false);
            });
            
            it('product and modifiers is present. Not special', function() {
                model.set({product: new Backbone.Model()}, {silent: true});
                obj = {};
                model.change();
                expect(model.product_listener).toBe(true);
                expect(model.modifier_listener).toBe(true);
                expect(model.change_special).toHaveBeenCalled();
            });
            
            it('product and modifiers is present. With special', function() {
                model.set({product: new Backbone.Model()}, {silent: true});
                model.set({special: 'test'}, {silent: true});
                obj = {};
                model.change();
                expect(model.change_special).not.toHaveBeenCalled();
                expect(model.listenTo).toHaveBeenCalled();
            });
            
            it('double change for presented product and modifiers', function() {
                model.set({product: new Backbone.Model()}, {silent: true});
                obj = {};
                model.change();
                expect(model.product_listener).toBe(true);
                expect(model.modifier_listener).toBe(true);
                var count = model.listenTo.callCount;
                model.change();
                expect(model.listenTo.callCount).toBe(count);
            });
        });
        
        it('Function update_prices', function() {
            var prod = new Backbone.Model({max_price: 0}),
                modif = new App.Collections.ModifierBlocks();  
                modif.get_special_text = function() {};

            spyOn(model, 'get_product').and.returnValue(prod);
            spyOn(model, 'get_modifiers').and.returnValue(modif);
            spyOn(modif, 'update_prices');
            
            model.update_prices();
            expect(modif.update_prices).not.toHaveBeenCalled();
            
            prod.set('price', 1);
            prod.set('max_price', 10);
            model.update_prices();
            expect(modif.update_prices).toHaveBeenCalledWith(9);
        });
        
        describe('Function get_myorder_tax_rate', function() {
            var tax_included,
                obj = new Backbone.Model(),
                def = {
                    is_cold: false,
                    is_gift: false,
                    tax: 100
                };
            
            beforeEach(function() {
                tax_included = true;
                obj.set(def);
                model.collection = {
                    checkout: new Backbone.Model({
                        dining_option: 'DINING_OPTION_EATIN'
                    }),
                    total: new Backbone.Model({
                        prevailing_tax: 25,
                        tax_country: 'usa'
                    })
                };
                spyOn(App.TaxCodes, 'is_tax_included').and.callFake(function(){
                    return tax_included;
                });
                spyOn(model, 'get_myorder_surcharge_rate').and.returnValue(0.4);
                spyOn(model, 'get_product').and.returnValue(obj);
                this.settings = App.Data.settings.get('settings_system');
                App.Data.settings.get('settings_system').delivery_cold_untaxed = false;
            });
            
            afterEach(function() {
                App.Data.settings.set('settings_system', this.settings);
            });
            
            it('is tax included. Else in all conditions', function() {
                expect(model.get_myorder_tax_rate()).toBe(0.5);
            });
            
            it('product is gift', function() {
                obj.set({is_gift: true});
                expect(model.get_myorder_tax_rate()).toBe(0);
            });
            
            it('product is cold, dining_option DINING_OPTION_EATIN', function() {
                obj.set({is_cold: true});
                expect(model.get_myorder_tax_rate()).toBe(0.5);
            });
            
            it('product is cold, dining_option DINING_OPTION_DELIVERY, delivery_cold_untaxed = false', function() {
                obj.set({is_cold: true});
                model.collection.checkout.set('dining_option', 'DINING_OPTION_DELIVERY');
                expect(model.get_myorder_tax_rate()).toBe(0.5);
            });
            
            it('product is cold, dining_option DINING_OPTION_DELIVERY, delivery_cold_untaxed = true', function() {
                obj.set({is_cold: true});
                model.collection.checkout.set('dining_option', 'DINING_OPTION_DELIVERY');
                App.Data.settings.get('settings_system').delivery_cold_untaxed = true;
                expect(model.get_myorder_tax_rate()).toBe(0);
            });
            
            it('not is tax included', function() {
                tax_included = false;
                expect(model.get_myorder_tax_rate()).toBe(1.1);
            });
        });
        
        describe('Function get_myorder_surcharge_rate', function() {
            var tax_included = false,
                obj = new Backbone.Model(),
                def = {
                    is_cold: false
                };
            
            beforeEach(function() {
                obj.set(def);
                model.collection = {
                    total: new Backbone.Model({
                        prevailing_surcharge: 25,
                        tax_country: 'usa'
                    })
                };
                spyOn(App.TaxCodes, 'is_tax_included').and.callFake(function(){
                    return tax_included;
                });
                spyOn(model, 'get_product').and.returnValue(obj);
            });
            
            it('usual surcharge', function() {
                expect(model.get_myorder_surcharge_rate()).toBe(0.25);
            });
            
            it('product is gift', function() {
                obj.set({is_gift: true});
                expect(model.get_myorder_surcharge_rate()).toBe(0);
            });
            
            it('is tax included', function() {
                tax_included = true;
                expect(model.get_myorder_surcharge_rate()).toBe(0);
            });
        });
        
        describe('Function add_empty', function() {
            var id_category = 10,
                id_product = 5,
                dfd = $.Deferred(),
                obj = {
                    get_child_products: function() {}
                };

            dfd.resolve();
            
            beforeEach(function() {
                App.Data.products[id_category] = new Backbone.Model();
                App.Data.modifiers[id_product] = new Backbone.Model();
                spyOn(App.Data.products[id_category], 'get').and.returnValue(obj);
                spyOn(App.Collections.ModifierBlocks, 'init').and.returnValue(dfd);
                spyOn(App.Collections.Products, 'init').and.returnValue(dfd);
                spyOn(obj, 'get_child_products').and.returnValue(dfd);
                spyOn($, 'when').and.returnValue(dfd);
                spyOn(model, 'get_modelsum').and.returnValue(1);
                spyOn(model, 'get_initial_price').and.returnValue(2);
                spyOn(model, 'set');
                spyOn(model, 'update_prices');
            });
            
            it('test funciton calls', function() {
                model.add_empty(id_product, id_category);
                expect(App.Collections.Products.init).toHaveBeenCalled(); // init products
                expect(App.Collections.ModifierBlocks.init).toHaveBeenCalled(); // init modifiers
                expect(App.Data.products[id_category].get).toHaveBeenCalledWith(id_product); // get nessesarry product
                expect(obj.get_child_products).toHaveBeenCalled();
                expect(model.set.calls.argsFor(0)[0]).toEqual({
                    product: obj,
                    id_product : id_product,
                    modifiers: App.Data.modifiers[id_product]
                });
                expect(model.set.calls.argsFor(1)[0]).toEqual({
                    sum: 1,
                    initial_price: 2
                });
                expect(model.update_prices).toHaveBeenCalled();
            });
        });
        
        describe('Function addJSON', function() {
            var data, 
                gift,
                mod,
                prod;
        
            beforeEach(function() {
                gift = undefined;
                data = {
                    product : {
                        id: 2,
                        get: function() {},
                        set: function() {}
                    },
                    modifiers : {},
                    id_product: 1,
                    quantity: 'quan',
                    weight: 1
                };
                mod = spyOn(App.Collections.ModifierBlocks.prototype, 'addJSON').and.returnValue(data.modifiers)
                prod = spyOn(App.Models.Product.prototype, 'addJSON').and.returnValue(data.product)
                spyOn(model, 'set');
                spyOn(model, 'get').and.returnValue(data.product);
                spyOn(data.product, 'get').and.callFake(function() {
                    return gift;
                });
                spyOn(data.product, 'set');
            });
            
            it('add without gift card, id_product is present', function() {
                model.addJSON(data);            
                expect(mod).toHaveBeenCalledWith(data.modifiers);
                expect(prod).toHaveBeenCalledWith(data.product);
                expect(model.set).toHaveBeenCalledWith(data);
                expect(data.product.set).not.toHaveBeenCalled();
            });
            
            it('gift card in product, gift_card_number in data', function() {
                gift = 1;
                data.gift_card_number = 1;
                model.addJSON(data);
                expect(data.product.set).not.toHaveBeenCalled();
            });
            
            it('not gift card in product, gift_card_number in data', function() {
                data.gift_card_number = 1;
                model.addJSON(data);
                expect(data.product.set).toHaveBeenCalled();
            });
            
            it('id_product not preset', function() {
                delete data.id_product;
                model.addJSON(data);
                expect(model.set.calls.mostRecent().args[0]).toBe('id_product');
            });
        });
        
        it('Function get_modelsum', function() {
            var obj = {
                get_sum: function() {}
            };
            spyOn(model, 'get_initial_price').and.returnValue(10);
            spyOn(model, 'get_modifiers').and.returnValue(obj);
            spyOn(obj, 'get_sum').and.returnValue(15);
            model.set({quantity: 4}, {silent: true});
            expect(model.get_modelsum()).toBe(100);
        });
        
        it('Function get_special', function() {
            var obj = {
                get_special_text: function() {
                    return 'test1,test2';
                }
            }, settings = {
                special_requests_online: true
            };
            model.set({special: ''}, {silent: true});
            spyOn(model, 'get_initial_price').and.returnValue(10);
            spyOn(model, 'get_modifiers').and.returnValue(obj);
            spyOn(App.Data.settings, 'get').and.returnValue(settings);
            expect(model.get_special()).toBe('test1,test2');

            model.set({special: 'test3'}, {silent: true});
            expect(model.get_special()).toBe('test3');
        });

        it('Function get_special: special requests are disabled', function() {
            var obj = {
                special_requests_online: false
            };
            spyOn(App.Data.settings, 'get').and.returnValue(obj);
            expect(model.get_special()).toBe('');
        });

        it('Function clone', function() {
            spyOn(App.Models.Myorder.prototype, 'trigger');
            model.set({id_product: 12}, {silent: true});
            var clone = model.clone();
            expect(clone.toJSON()).toEqual(model.toJSON());
            expect(clone.cid).not.toBe(model.cid);
            expect(clone.__proto__).toBe(model.__proto__);
            expect(model.trigger).toHaveBeenCalled()
        });
        
        it('Function update', function() {
            spyOn(App.Models.Myorder.prototype, 'trigger');
            model.set('id_product', 12);
            var clone = model.clone();
            model.set('id_product', 13);
            expect(model.get('id_product')).toEqual(13);
            expect(model.update(clone).get('id_product')).toEqual(12);
        });
        
        describe('Function check_order', function() {
            var data = {
                    product : {
                        id: 2,
                        sold_by_weight: false
                    },
                    modifiers : [],
                    id_product: 1,
                    quantity: 1,
                    weight: 1
                },
                getSizeModel,
                check_selected,
                checkForced,
                timetable,
                modifiers;
            var model = new App.Models.Myorder();
                model.addJSON(data);
                
            beforeEach(function() {            
                this.timetables = App.Data.timetables;
                App.Data.timetables = {
                    check_order_enable: function() {}
                };
                check_selected = true;
                getSizeModel = true;
                checkForced = true;
                timetable = true;
                modifiers = model.get_modifiers();                
                spyOn(model.get_product(), 'check_selected').and.callFake(function() {
                    return check_selected;
                });
                spyOn(modifiers, 'getSizeModel').and.callFake(function() {
                    return getSizeModel;
                });
                spyOn(modifiers, 'checkForced').and.callFake(function() {
                    return checkForced;
                });
                spyOn(App.Data.timetables, 'check_order_enable').and.callFake(function() {
                    return timetable;
                });
            });
            
            afterEach(function() {
                App.Data.timetables = this.timetables;
            });
            
            it('pass check', function() {
                expect(model.check_order().status).toBe('OK');
            });
            
            it('timetable close', function() {
                timetable = false;
                expect(model.check_order().status).toBe('ERROR');
            });
            
            it('product check_selected fail', function() {
                check_selected = false;
                expect(model.check_order().status).toBe('ERROR');
            });
            
            it('size is undefined. forced empty', function() {
                getSizeModel = undefined;
                expect(model.check_order().status).toBe('OK');
            });
            
            it('size is undefined. forced not empty', function() {
                getSizeModel = undefined;
                checkForced = [new Backbone.Model({name: 'test1'})];
                expect(model.check_order().status).toBe('ERROR');
            });
            
            it('size is null', function() {
                getSizeModel = null;
                expect(model.check_order().status).toBe('ERROR');
            });
        });
        
        it('Function get_attribute_type', function() {
            var product = {
                get: function() {}
            };
            spyOn(model, 'get').and.returnValue(product);
            spyOn(product, 'get').and.returnValue(5);
            expect(model.get_attribute_type()).toBe(5);
        });
        
        it('Function get_attributes_list', function() {
            var product = {
                get_attributes_list: function() {}
            };
            spyOn(model, 'get').and.returnValue(product);
            spyOn(product, 'get_attributes_list').and.returnValue(5);
            expect(model.get_attributes_list()).toBe(5);
        });
        
        describe('Function check_repeat', function() {
            var product = {
                    check_repeat: function() {}
                },
                modifiers = {
                    check_repeat: function() {}
                },
                check_product,
                check_modifiers;
            
            beforeEach(function() {
                check_product = undefined;
                check_modifiers = undefined;
                model.collection = {};
                model.set({
                    product: product,
                    modifiers: modifiers
                }, {silent: true});
                spyOn(product, 'check_repeat').and.callFake(function() {
                    return check_product;
                });
                spyOn(modifiers, 'check_repeat').and.callFake(function() {
                    return check_modifiers;
                });
            });
            
            it('no product', function() {
                model.unset('product', {silent: true});
                expect(model.check_repeat()).toBeUndefined();
            });
            
            it('remove product', function() {
                check_product = 'remove';
                expect(model.check_repeat()).toBe('remove');
            });
            
            it('remove changed product', function() {
                check_product = 'remove changed';
                expect(model.check_repeat()).toBe('remove changed');
            });
            
            it('changed product', function() {
                check_product = 'changed';
                expect(model.check_repeat()).toBe('changed');
                expect(modifiers.check_repeat).toHaveBeenCalled();
            });
            
            it('changed modifiers', function() {
                check_modifiers = 'changed';
                expect(model.check_repeat()).toBe('changed');
            });
        });
        
        it('Function is_gift', function() {
            var product = new Backbone.Model({is_gift: false});
            spyOn(model, 'get_product').and.returnValue(product);
            expect(model.is_gift()).toBe(false);
            
            product.set('is_gift', true);
            expect(model.is_gift()).toBe(true);
        });
        
        it('Function item_submit', function() {
            model.set({
                sum: 100,
                quantity: 10,
                initial_price: 4
            }, {silent: true});
            var modifiers = {
                    modifiers_submit: function() {
                        return 'modifiers block';
                    }
                },
                gift_card = false,
                product = {
                    toJSON: function() {
                        return {
                            price: 'price',
                            id: 'id',
                            name: 'name',
                            tax: 'tax',
                            is_cold: 'is_cold',
                            gift_card_number: gift_card
                        };
                    }
                };
            spyOn(model, 'get_special').and.returnValue('special');
            spyOn(model, 'get_modifiers').and.returnValue(modifiers);
            spyOn(model, 'get_product').and.returnValue(product);
            spyOn(model, 'get_myorder_tax_rate').and.returnValue(0.5);
            
            expect(model.item_submit()).toEqual({
                modifier_amount: 6,
                modifieritems: 'modifiers block',
                initial_price: 4,
                special_request: 'special',
                price: 4,
                product: 'id',
                product_name_override: 'name',
                quantity: 10,
                tax_amount: 50,
                tax_rate: 'tax',//model.get_product_tax_rate(),
                is_cold: 'is_cold'
            });
            
            gift_card = 10;
            expect(model.item_submit().gift_card_number).toBe(10);
        });
        
        it('Function get_all_line: modifiers are present', function() {
            var modifiers = {
                get_all_line: function() {
                    return 'add modifier'
                }
            };
            spyOn(model, 'get_modifiers').and.returnValue(modifiers);
            expect(model.get_all_line()).toBe('add modifier');
        });

        it('Function get_all_line: modifiers are empty', function() {
            spyOn(model, 'get_modifiers').and.returnValue(undefined);
            expect(model.get_all_line()).toBe('');
        });
    });
    
    
//////////////////////////////////////////////////////////////////////////////    
    

    describe("App.Collections.Myorders", function() {
        var model;
        
        beforeEach(function() {
            model = new App.Collections.Myorders();
        });

        it('Environment', function() {
            expect(App.Collections.Myorders).toBeDefined();
        });

        it('Function initialize', function() {
            expect(model.total.__proto__).toBe(App.Models.Total.prototype);
            expect(model.checkout.__proto__).toBe(App.Models.Checkout.prototype);
        });

        describe('Function change_dining_option', function() {
            var delivery, bagcharge;
            
            beforeEach(function() {
                delivery = 0;
                bagcharge = 0;
                spyOn(model, 'add');
                spyOn(model, 'remove');
                spyOn(model, 'recalculate_tax');
                spyOn(model.total, 'get_delivery_charge').and.callFake(function() {
                    return delivery;
                });
            });
            // TODO           
        });
        
        it('Function check_maintenance', function() {
            var result = false;
            spyOn(window, 'getData').and.callFake(function(name) {
                if (name == 'orders') return {};
            });
            spyOn(App.Data.settings, "loadSettings");
            spyOn(App.Data.errors, "alert").and.callFake(function(mess) {
                result = mess.indexOf('please contact:') > 0;
            });
            model.check_maintenance();
            expect(result).toBe(true);
        });
        
        it('Function get_remaining_delivery_amount', function() {
            var dining_option = 'DINING_OPTION_TOGO';
            spyOn(model.checkout, 'get').and.callFake(function() {
                return dining_option;
            });
            spyOn(model.total, 'get_remaining_delivery_amount').and.returnValue(10);
            
            expect(model.get_remaining_delivery_amount()).toBeNull();
            
            dining_option = 'DINING_OPTION_DELIVERY';
            expect(model.get_remaining_delivery_amount()).toBe(10);
        });
        
        it('Function get_delivery_charge', function() {
            var dining_option = 'DINING_OPTION_TOGO';
            spyOn(model.checkout, 'get').and.callFake(function() {
                return dining_option;
            });
            spyOn(model.total, 'get_delivery_charge').and.returnValue(10);
            
            expect(model.get_delivery_charge()).toBeNull();
            
            dining_option = 'DINING_OPTION_DELIVERY';
            expect(model.get_delivery_charge()).toBe(10);            
        });
       
        it('Function get_only_product_quantity', function() {
            spyOn(App.Collections.Myorders.prototype, 'listenTo');
            model = new App.Collections.Myorders();
            var obj1 = {id: 1}, obj2 = {id: 2};
            model.deliveryItem = obj1;
            model.bagChargeItem = obj2;
            model.quantity = 10;
            
            expect(model.get_only_product_quantity()).toBe(10);
            
            model.add(obj1);
            expect(model.get_only_product_quantity()).toBe(9);
            
            model.add(obj2);
            expect(model.get_only_product_quantity()).toBe(8);
        });
        
        describe('Function addJSON', function() {
            
            beforeEach(function() {
                spyOn(App.Models.Myorder.prototype, 'addJSON');
                spyOn(App.Models.Myorder.prototype, 'set');
                spyOn(App.Models.Myorder.prototype, 'get_initial_price');
                spyOn(model, 'add');
            });
            
            it('empty data', function() {
                model.addJSON();
                expect(model.add).not.toHaveBeenCalled();
            });
            
            it('data with product without id', function() {
               var data = [
                   { product: {} },
                   { product: {} }
               ];
               
                model.addJSON(data);
                expect(model.add).not.toHaveBeenCalled();
            });
            
            it('data with product without id', function() {
               var data = [
                   { product: {} },
                   { product: {} }
               ];
               
                model.addJSON(data);
                expect(model.add).not.toHaveBeenCalled();
            });
            
            it('data with product with id', function() {
               var data = [
                   { product: {id: 1} }
               ];
               
                model.addJSON(data);
                expect(App.Models.Myorder.prototype.addJSON).toHaveBeenCalledWith(data[0]);
                expect(model.add).toHaveBeenCalled();
                expect(App.Models.Myorder.prototype.get_initial_price).toHaveBeenCalled();
            });
        });
        
        it('Function clone', function() {
            var clone = model.clone();
            expect(clone).not.toBe(model);
            expect(clone.__proto__).toBe(model.__proto__);
        });
        
        describe('Function check_repeat', function() {
            var settings,
                delivery;
           
            beforeEach(function() {
                delivery = new Backbone.Model({enable: true});
                settings = {
                    eat_in_for_online_orders: true,
                    tax_country: 'usa',
                    prevailing_surcharge: 10
                };
                model.total = new Backbone.Model({
                    delivery: delivery,
                    tax_country: 'usa',
                    prevailing_surcharge: 10
                });
                model.checkout = new Backbone.Model({
                    dining_option: 'DINING_OPTION_ONLINE'
                });
                spyOn(App.Data.settings, 'get').and.callFake(function() {
                    return settings;
                });
            });
            
            it('no changes', function() {
                expect(model.check_repeat()).toBeUndefined();
            });
            
            it('for delivery, become disable', function() {
                delivery.set('enable', false);
                model.checkout.set('dining_option', 'DINING_OPTION_DELIVERY');
                expect(model.check_repeat()).toBe('changed');
            });
            
            it('for eatin, become disable', function() {
                settings.eat_in_for_online_orders = false;
                model.checkout.set('dining_option', 'DINING_OPTION_EATIN');
                expect(model.check_repeat()).toBe('changed');
            });
            
            it('only gift, tax_country changed', function() {
                settings.tax_country = 'ua';
                expect(model.check_repeat()).toBeUndefined();
            });
            
            it('only gift, prevailing_surcharge changed', function() {
                settings.prevailing_surcharge = 20;
                expect(model.check_repeat()).toBeUndefined();
            });
            
            it('not only gift, prevailing_surcharge changed', function() {
                settings.prevailing_surcharge = 20;
                model.checkout.set('dining_option', 'DINING_OPTION_EATIN');
                expect(model.check_repeat()).toBe('changed');
            });
            
            describe('check item', function() {                
                var obj = {
                        check_repeat: function() {}
                    },
                    check_item;
                beforeEach(function() {
                    check_item = undefined;
                    model.models.push(obj);
                    spyOn(obj, 'check_repeat').and.callFake(function() {
                        return check_item;
                    });
                    spyOn(model, 'remove');
                });
                
                it('return undefined', function() {
                    expect(model.check_repeat()).toBeUndefined();
                });
                
                it('return remove changed', function() {
                    check_item = 'remove changed';
                    expect(model.check_repeat()).toBe('changed');
                    expect(model.remove).toHaveBeenCalled();
                });
                
                it('return remove', function() {
                    check_item = 'remove';
                    expect(model.check_repeat()).toBeUndefined();
                    expect(model.remove).toHaveBeenCalled();
                });
                
                it('return changed', function() {
                    check_item = 'changed';
                    expect(model.check_repeat()).toBe('changed');
                    expect(model.remove).not.toHaveBeenCalled();
                });
            });
        });
            
        describe('Function repeat_order', function() {                
            var repeat_model,
                obj = {
                    eat_in_for_online_orders: true
                };
            beforeEach(function() {
                repeat_model = new App.Collections.Myorders();
                repeat_model.checkout = new Backbone.Model({dining_option: 'test'});
                model.total = new Backbone.Model({
                    delivery: new Backbone.Model({enable: true})
                });
                model.checkout = new Backbone.Model();
                spyOn(App.Data.settings, 'get').and.returnValue(obj);
                obj.eat_in_for_online_orders = true;
                spyOn(model, 'empty_myorder');
            });

            it('check calls', function() {
                model.repeat_order(repeat_model);
                expect(model.checkout.get('dining_option')).toBe(repeat_model.checkout.get('dining_option'));
                expect(model.empty_myorder).toHaveBeenCalled();
            });

            it('delivery, become disable', function() {
                model.total.get('delivery').set('enable', false);
                repeat_model.checkout.set('dining_option', 'DINING_OPTION_DELIVERY');
                model.repeat_order(repeat_model);
                expect(model.checkout.get('dining_option')).toBe('DINING_OPTION_TOGO');
            });

            it('eat in, become disable', function() {
                obj.eat_in_for_online_orders = false;
                repeat_model.checkout.set('dining_option', 'DINING_OPTION_EATIN');
                model.repeat_order(repeat_model);
                expect(model.checkout.get('dining_option')).toBe('DINING_OPTION_TOGO');
            });
        });

        describe('Function change_only_gift_dining_option', function() {
            var quan, is_gift, dining_option;
            
            beforeEach(function() {
                is_gift = true;
                spyOn(App.Models.Myorder.prototype, 'is_gift').and.callFake(function() {
                    return is_gift;
                });

                quan = 1;
                spyOn(model, 'get_only_product_quantity').and.callFake(function() {
                    return quan;
                });
                
                spyOn(model.checkout, 'revert_dining_option');
                
                model.add({name: 'test'}, {silent: true});
                spyOn(model.checkout, 'set');

                dining_option = 'DINING_OPTION_ONLINE'
                spyOn(model.checkout, 'get').and.callFake(function() {
                    return dining_option;
                });
            });
            
            it('only gift', function() {
                expect(model.change_only_gift_dining_option()).toBe(true);
                expect(model.checkout.set).toHaveBeenCalledWith('dining_option', 'DINING_OPTION_ONLINE');
            });

            it('not only gift. Revert dining_option', function() {
                is_gift = false;
                expect(model.change_only_gift_dining_option()).toBe(false);
                expect(model.checkout.revert_dining_option).toHaveBeenCalled();
            });

            it('not only gift. not revert dining_option', function() {
                is_gift = false;
                dining_option = 'test';
                expect(model.change_only_gift_dining_option()).toBe(false);
                expect(model.checkout.revert_dining_option).not.toHaveBeenCalled();
            });
        });

        it('Function not_gift_product_quantity', function() {
            var count = 2;
            spyOn(model, 'get_only_product_quantity').and.returnValue(5);
            spyOn(App.Models.Myorder.prototype, 'is_gift').and.callFake(function() {
                return count && count--;
            });
            model.add([{},{}], {silent: true});
            expect(model.not_gift_product_quantity()).toBe(3);
        });

        it('Function onModelAdded', function() {
            var add = new App.Models.Myorder();
            spyOn(model, 'change_only_gift_dining_option');
            spyOn(add, 'get_modelsum').and.returnValue(10);
            spyOn(add, 'get_myorder_tax_rate').and.returnValue(0.5);
            spyOn(add, 'get_myorder_surcharge_rate').and.returnValue(0.3);
            add.set('quantity', 2, {silent: true});
            model.quantity = 5;
            model.total.set('total', 100);
            model.total.set('tax', 20);
            model.total.set('surcharge', 30);

            model.onModelAdded(add);
            expect(model.change_only_gift_dining_option).toHaveBeenCalled();
            expect(model.total.get('tax')).toBe(25);
            expect(model.total.get('surcharge')).toBe(33);
            expect(model.total.get('total')).toBe(110);
            expect(model.quantity).toBe(7);
        });

        it('Function onModelRemoved', function() {
            var add = new App.Models.Myorder();
            spyOn(model, 'change_only_gift_dining_option');            
            spyOn(add, 'get_myorder_tax_rate').and.returnValue(0.5);
            spyOn(add, 'get_myorder_surcharge_rate').and.returnValue(0.3);
            add.set('quantity', 2, {silent: true});
            add.set('sum', 10, {silent: true});
            model.quantity = 5;
            model.total.set('total', 100);
            model.total.set('tax', 20);
            model.total.set('surcharge', 30);

            model.onModelRemoved(add);
            expect(model.change_only_gift_dining_option).toHaveBeenCalled();
            expect(model.total.get('tax')).toBe(15);
            expect(model.total.get('surcharge')).toBe(27);
            expect(model.total.get('total')).toBe(90);
            expect(model.quantity).toBe(3);
        });

        it('Function onModelChange', function() {
            var add = new App.Models.Myorder();
            spyOn(add, 'get_modelsum').and.returnValue(10);
            add.set('sum', 30, {silent: true});
            spyOn(add, 'get_myorder_tax_rate').and.returnValue(0.5);
            spyOn(add, 'get_myorder_surcharge_rate').and.returnValue(0.3);
            add.set('quantity', 2, {silent: true});
            add.set('quantity_prev', 3, {silent: true});
            model.quantity = 5;
            model.total.set('total', 100);
            model.total.set('tax', 20);
            model.total.set('surcharge', 30);

            model.onModelChange(add);
            expect(model.total.get('tax')).toBe(10);
            expect(model.total.get('surcharge')).toBe(24);
            expect(model.total.get('total')).toBe(80);
            expect(model.quantity).toBe(4);
        });

        it('Function saveOrders', function() {
            var stored_data;
        //        deliveryItem = new App.Models.DeliveryChargeItem({total: model.total});
            var bagChargeItem = new App.Models.BagChargeItem({total: model.total});
            var otherItem = new App.Models.Myorder();
            otherItem.addJSON({id_product: 100, product: {name: 'other'}}); 
            model.add( [bagChargeItem, otherItem] );
          
            spyOn(model.checkout, 'saveCheckout');
            spyOn(model.total, 'saveTotal');
            
            spyOn(window, 'setData').and.callFake(function(key, data) {
                stored_data = data;
            });

            model.saveOrders();
            
            expect(model.checkout.saveCheckout).toHaveBeenCalled();
            expect(model.total.saveTotal).toHaveBeenCalled();
            expect(stored_data.length).toEqual(1);
            expect(stored_data.models[0].get("product").get("name")).toEqual("other");
        });

        it('Function loadOrders', function() {
            spyOn(model.checkout, 'loadCheckout');
            spyOn(model.total, 'loadTotal');
            spyOn(window, 'getData').and.returnValue('test');
            spyOn(model, 'empty_myorder');
            spyOn(model, 'addJSON');
            
            model.loadOrders();

            expect(model.empty_myorder).toHaveBeenCalled();
            expect(model.checkout.loadCheckout).toHaveBeenCalled();
            expect(model.total.loadTotal).toHaveBeenCalled();
            expect(model.addJSON).toHaveBeenCalledWith('test');
        });

        it('Function recalculate_tax', function() {
            spyOn(App.Models.Myorder.prototype, 'get_myorder_tax_rate').and.returnValue(10);
            spyOn(App.Models.Myorder.prototype, 'get').and.returnValue(5);
            spyOn(model.total, 'set');

            model.add([{name: '1'}, {name: '2'}], {silent: true});
            model.recalculate_tax();

            expect(model.total.set).toHaveBeenCalledWith('tax', 100);
        });
        
        describe('Function _check_cart', function() {
            var tips, dining_option, product_quantity, delivery_amount;
            
            beforeEach(function() {
                tips = 0;
                dining_option = 'DINING_OPTION_ONLINE';
                product_quantity = 2;
                delivery_amount = 0;
                this.min = App.Data.settings.get("settings_system").min_items;
                App.Data.settings.get("settings_system").min_items = 0;
                spyOn(model.total, 'get_subtotal').and.returnValue(10);
                spyOn(model.total, 'get_tip').and.callFake(function() {
                    return tips;
                });
                spyOn(model.total, 'get_remaining_delivery_amount').and.callFake(function() {
                    return delivery_amount;
                });
                spyOn(model.checkout, 'get').and.callFake(function() {
                    return dining_option;
                });
                spyOn(model, 'get_only_product_quantity').and.callFake(function() {
                    return product_quantity;
                });
            });
            
            afterEach(function() {
                App.Data.settings.get("settings_system").min_items = this.min;
            });
            
            it('check pass', function() {
                expect(model._check_cart().status).toBe('OK');
            });
            
            it('only bagcharge in cart', function() {
                product_quantity = 0;
                expect(model._check_cart().status).toBe('ERROR');
            });
            
            it('tips more than product sum', function() {  
                tips = 20;
                expect(model._check_cart().status).toBe('OK');
                expect(model._check_cart(true).status).toBe('ERROR');
            });
            
            it('for delivery. Total less then min dilivery amount', function() {
                dining_option = 'DINING_OPTION_DELIVERY';
                delivery_amount = 20;
                expect(model._check_cart().status).toBe('ERROR');
            });
            
            it('not gift. Quantity less then min for online order', function() {
                App.Data.settings.get("settings_system").min_items = 3;
                dining_option = 'DINING_OPTION_TOGO';
                expect(model._check_cart().status).toBe('ERROR_QUANTITY');
            });
        });
        
        describe('Function check_order', function() {
            var dining_option, card_check,checkout_check, order_check, customer_check, customer_validate_address, fake;
            
            beforeEach(function() {
                fake = {
                    funcOk: function() {},
                    funcError: function() {}
                };
                spyOn(fake, 'funcOk');
                spyOn(fake, 'funcError');

                dining_option = 'DINING_OPTION_ONLINE';                
                spyOn(model.checkout, 'get').and.callFake(function() {
                    return dining_option;
                });

                this.card = App.Data.card;
                App.Data.card = {
                    check: function() {}
                };
                card_check = {
                    status: 'OK'
                };
                spyOn(App.Data.card, 'check').and.callFake(function() {
                    return card_check;
                });

                checkout_check = {
                    status: 'OK'
                };
                spyOn(model.checkout, 'check').and.callFake(function() {
                    return checkout_check;
                });

                order_check = {
                    status: 'OK'
                };
                spyOn(model, '_check_cart').and.callFake(function() {
                    return order_check;
                });

                this.customer = App.Data.customer;
                App.Data.customer = {
                    check: function() {},
                    validate_address: function() {}
                };
                customer_check = {
                    status: 'OK'
                };
                spyOn(App.Data.customer, 'check').and.callFake(function() {
                    return customer_check;
                });
                spyOn(App.Data.customer, 'validate_address').and.callFake(function() {
                    return customer_validate_address;
                });
                
                spyOn(window, 'alert_message');
            });
            
            afterEach(function() {
                App.Data.card = this.card;
                App.Data.customer = this.customer;
            });
            
            it('check pass without options', function() {
                model.check_order({}, fake.funcOk, fake.funcError);
                expect(fake.funcOk).toHaveBeenCalled();
            });
            
            it('check pass with all options', function() {
                model.check_order({
                    checkout: true,
                    customer: true,
                    card: true,
                    order: true,
                    tip: true
                }, fake.funcOk, fake.funcError);
                expect(fake.funcOk).toHaveBeenCalled();
            });
            
            it('check card simple error', function() {
                card_check = {
                    status: 'ERROR',
                    errorMsg: 'test'
                };
                model.check_order({card: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check card empty fields', function() {
                card_check = {
                    status: 'ERROR_EMPTY_FIELDS',
                    errorList: ['field']
                };
                model.check_order({card: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check checkout simple error', function() {
                checkout_check = {
                    status: 'ERROR',
                    errorMsg: 'test'
                };
                model.check_order({checkout: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check checkout empty fields', function() {
                checkout_check = {
                    status: 'ERROR_EMPTY_FIELDS',
                    errorList: ['field']
                };
                model.check_order({checkout: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check order simple error', function() {
                order_check = {
                    status: 'ERROR',
                    errorMsg: 'test'
                };
                model.check_order({order: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check order quantity', function() {
                order_check = {
                    status: 'ERROR_QUANTITY',
                    errorMsg: 'test'
                };
                model.check_order({order: true}, fake.funcOk);
                expect(window.alert_message).toHaveBeenCalled();
            });
            
            it('check customer simple error', function() {
                customer_check = {
                    status: 'ERROR',
                    errorMsg: 'test'
                };
                model.check_order({customer: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check customer empty fields', function() {
                customer_check = {
                    status: 'ERROR_EMPTY_FIELDS',
                    errorList: ['field']
                };
                model.check_order({customer: true}, fake.funcOk, fake.funcError);
                expect(fake.funcError).toHaveBeenCalled();
            });
            
            it('check customer address validation', function() {
                dining_option = 'DINING_OPTION_DELIVERY';
                model.check_order({customer: true}, fake.funcOk, fake.funcError);
                expect(App.Data.customer.validate_address).toHaveBeenCalled();
                expect(fake.funcError).not.toHaveBeenCalled();
            });
        });
        
        describe('Function create_order_and_pay', function() {
            var pickup, base, dining_time, checking_work_shop, last_pt;
            
            beforeEach(function() {
                pickup = new Date(2011, 11, 11);
                spyOn(model, 'submit_order_and_pay');
                spyOn(model, 'trigger');
                model.checkout = new Backbone.Model({
                    dining_option: 'DINING_OPTION_ONLINE',
                    pickupTS: pickup,
                    isPickupASAP: false
                });
                spyOn(window, 'format_date_1').and.callFake(function(date) {
                    return '!' + date;
                });
                spyOn(window, 'pickupToString').and.returnValue('pickupToString');
                this.timetables = App.Data.timetables;
                App.Data.timetables = {
                    base: function() {},
                    current_dining_time: function() {},
                    checking_work_shop: function() {},
                    getLastPTforWorkPeriod: function() {}
                };

                base = new Date(2011, 10, 10);
                spyOn(App.Data.timetables, 'base').and.callFake(function() {
                    return base;
                });

                dining_time = new Date(2011, 10, 10);
                spyOn(App.Data.timetables, 'current_dining_time').and.callFake(function() {
                    return dining_time;
                });

                checking_work_shop = true;
                spyOn(App.Data.timetables, 'checking_work_shop').and.callFake(function() {
                    return checking_work_shop;
                });

                last_pt = new Date(2011, 10, 10);;
                spyOn(App.Data.timetables, 'getLastPTforWorkPeriod').and.callFake(function() {
                    return last_pt;
                });
                
                this.skin = App.Data.settings.get('skin');
                App.Data.settings.set('skin', 'mlb');
            });
            
            afterEach(function() {
                App.Data.timetables = this.timetables;
                App.Data.settings.set('skin', this.skin);
            });
            
            it('check pass', function() {
                model.create_order_and_pay();
                expect(model.submit_order_and_pay).toHaveBeenCalled();
            });
            
            describe('check pass mlb skin, only gift, order seat', function() {
                beforeEach(function() {
                    model.checkout.set('pickupTS', undefined);
                });
                
                it('change skin', function() {
                    App.Data.settings.set('skin', 'weborder');
                    model.create_order_and_pay();
                    expect(model.submit_order_and_pay).toHaveBeenCalled();
                });
                
                it ('+ change dining_option', function() {
                    App.Data.settings.set('skin', 'weborder');
                    model.checkout.set('dining_option', 'DINING_OPTION_TOGO');
                    model.create_order_and_pay();
                    expect(model.submit_order_and_pay).toHaveBeenCalled();
                });
            });
            
            describe('weborder skin, not gift', function() {
                beforeEach(function() {
                    App.Data.settings.set('skin', 'weborder');
                    model.checkout.set('dining_option', 'DINING_OPTION_TOGO');
                });
                
                it('no pickup time', function() {
                    model.checkout.set('pickupTS', undefined);
                    model.create_order_and_pay();
                    expect(model.submit_order_and_pay).not.toHaveBeenCalled();
                });
                
                it('pickup time less current time. Check pickup time update', function() {
                    dining_time = new Date(2011, 12, 12);
                    model.create_order_and_pay();
                    expect(App.Data.timetables.checking_work_shop).toHaveBeenCalledWith(dining_time, false);
                });

                it('checking_work_shop is called with delivery = true', function() {
                    dining_time = new Date(2011, 12, 12);
                    model.checkout.set('dining_option', 'DINING_OPTION_DELIVERY');
                    model.create_order_and_pay();
                    expect(App.Data.timetables.checking_work_shop).toHaveBeenCalledWith(dining_time, true);
                });
                
                it('store closed', function() {
                    checking_work_shop = false;
                    model.create_order_and_pay();
                    expect(App.Data.timetables.checking_work_shop).toHaveBeenCalledWith(pickup, false);
                    expect(model.submit_order_and_pay).not.toHaveBeenCalled();
                });
                
                it('check checkout changes not ASAP', function() {
                    model.create_order_and_pay();
                    expect(model.checkout.get('pickupTime')).toBe('pickupToString');
                    expect(model.checkout.get('createDate')).toBe('!' + base);
                    expect(model.checkout.get('pickupTimeToServer')).toBe('!' + pickup);
                    expect(model.checkout.get('lastPickupTime')).toBeUndefined();
                });
                
                it('check checkout changes ASAP', function() {
                    model.checkout.set('isPickupASAP', true);
                    model.create_order_and_pay();
                    expect(model.checkout.get('pickupTimeToServer')).toBe('ASAP');
                    expect(model.checkout.get('lastPickupTime')).toBe('!' + last_pt);
                });
                
                it('ASAP', function() {
                    model.checkout.set('isPickupASAP', true);
                    model.create_order_and_pay();
                    expect(App.Data.timetables.getLastPTforWorkPeriod).toHaveBeenCalledWith(base);
                });
            });
        });
        
        describe('Function submit_order_and_pay', function() {
            var ajax, total, checkout, card, customer, payment_process;

            beforeEach(function() {
                spyOn($, 'ajax').and.callFake(function(opts) {
                    ajax = opts;
                    ajax.data = JSON.parse(ajax.data);
                });
                this.mobile = $.mobile;
                $.mobile = {
                    loading: function() {}
                };
                spyOn($.mobile, 'loading');
                
                spyOn(App.Models.Myorder.prototype, 'item_submit').and.returnValue('modif');
                
                this.get_parameters = App.Data.get_parameters;
                App.Data.get_parameters = {};
                
                this.skin = App.Data.settings.get('skin');
                App.Data.settings.set('skin', 'test skin');
                
                total = {
                    final_total: 5,
                    surcharge: 4,
                    subtotal: 3,
                    tax: 2,
                    tip: 1
                };
                spyOn(model.total, 'get_all').and.callFake(function() {
                    return total;
                });
                
                checkout = {
                    createDate: 'create date',
                    pickupTimeToServer: 'pickup time to server',
                    lastPickupTime: 'last pt',
                    dining_option: '',
                    pickupTime: 'pickup time',
                    level: '',
                    section: '',
                    row: '',
                    seat: '',
                    email: '',
                    payment_id: '',
                    rewardCard: ''
                };
                spyOn(model.checkout, 'toJSON').and.callFake(function() {
                    return checkout;
                });
                spyOn(model.checkout, 'set');
                spyOn(model.checkout, 'saveCheckout');
                
                this.card = App.Data.card;
                App.Data.card = {
                    toJSON: function() {}
                };
                card = {
                    firstName: '',
                    secondName: '',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    cardNumber: '',
                    expMonth: '',
                    expDate: '',
                    securityCode: ''
                };
                spyOn(App.Data.card, 'toJSON').and.callFake(function() {
                    return card;
                });
                
                this.customer = App.Data.customer;
                App.Data.customer = {
                    toJSON: function() {},
                    get_customer_name: function() {}
                };
                customer = {
                    phone: '',
                    first_name: '',
                    last_name: '',
                    addresses: [],
                    shipping_address: null,
                    email: ''
                };
                spyOn(App.Data.customer, 'toJSON').and.callFake(function() {
                    return customer;
                });
                spyOn(App.Data.customer, 'get_customer_name').and.returnValue('customer name');
                //spyOn(App.Models.Myorder.prototype, 'getCustomerData').and.returnValue({call_name: 'customer call name'});
                               
                payment_process = {
                    paypal_direct_credit_card: false,
                    usaepay: false
                };
                spyOn(App.Data.settings, 'get_payment_process').and.callFake(function() {
                    return payment_process;
                });
                
                spyOn(model, 'trigger');
                
                spyOn(App.Data.errors, 'alert_red');
                spyOn(App.Data.errors, 'alert');                
            });
            
            afterEach(function() {
               $.mobile = this.mobile;
               App.Data.get_parameters = this.get_parameters;
               App.Data.settings.set('skin', this.skin);
               App.Data.card = this.card;
               App.Data.customer = this.customer;
            });
            
            it('empty models. Default state', function() {
                model.submit_order_and_pay(5);
                expect(ajax.data).toEqual({
                    establishmentId: 1,
                    items: [],
                    orderInfo: {
                        call_name: "",
                        created_date: 'create date',
                        final_total: 5,
                        lastPickupTime: "last pt",
                        pickup_time: "pickup time to server",
                        subtotal: 3,
                        surcharge: 4,
                        tax: 2
                    },
                    paymentInfo: {
                        tip: 1,
                        type: 5
                    },
                    skin: 'test skin'
                });
            });
            
            it('+several items', function() {
                model.add([{}, {}], {silent: true});
                model.submit_order_and_pay();
                expect(ajax.data.items).toEqual(['modif', 'modif']);
            });
            
            describe('skin paypal', function() {
                
                beforeEach(function() {
                    App.Data.settings.set('skin', 'paypal');
                });
                
                it('not order from seat', function() {
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('customer name / pickup time');
                });
                
                it('not order from seat, ASAP', function() {
                    checkout.pickupTimeToServer = 'ASAP';
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('customer name / ASAP (pickup time)');
                });
                
                it('not order from seat, phone', function() {
                    customer.phone = 'phone';
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('customer name / pickup time / phone');
                });
                
                describe('TODO: other options', function() {
                    
                    beforeEach(function() {
                        App.Data.orderFromSeat = {};
                    });
                    
                    it('all order from seats fields empty', function() {
                        model.submit_order_and_pay();
                        expect(ajax.data.orderInfo.call_name).toBe('customer name');
                    });
                    
                    it('level', function() {
                        checkout.level = 'level';
                        model.submit_order_and_pay();
                        expect(ajax.data.orderInfo.call_name).toBe('customer name / Level: level');
                    });
                    
                    it('level + section', function() {
                        checkout.level = 'level';
                        checkout.section = 'section';                        
                        model.submit_order_and_pay();
                        expect(ajax.data.orderInfo.call_name).toBe('customer name / Level: level Sect: section');
                    });
                    
                    it('row', function() {
                        checkout.row = 'row';                        
                        model.submit_order_and_pay();
                        expect(ajax.data.orderInfo.call_name).toBe('customer name / Row: row');
                    });
                    
                    it('seat', function() {
                        checkout.seat = 'seat';                        
                        model.submit_order_and_pay();
                        expect(ajax.data.orderInfo.call_name).toBe('customer name / Seat: seat');
                    });
                });
            });
            
            describe('skin mlb', function() {
                beforeEach(function() {
                    App.Data.settings.set('skin', 'mlb');
                });
                
                it('default field', function() {                 
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('');
                });
                
                it('TODO: first name, phone, sec, row, seat', function() {
                    checkout.row = 'row'; 
                    checkout.seat = 'seat';  
                    checkout.section = 'section';     
                    card.firstName = 'first name';
                    customer.phone = 'phone';
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('first name / Sect: section Row: row Seat: seat / phone');
                });
            });
            
            describe('skin weborder, weborder_mobile', function() {
                beforeEach(function() {
                    App.Data.settings.set('skin', 'weborder');
                });
                
                it('default field', function() {                 
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('pickup time');
                    expect(ajax.data.paymentInfo.phone).toBeUndefined();
                    expect(ajax.data.paymentInfo.email).toBeUndefined();
                    expect(ajax.data.paymentInfo.first_name).toBe('');
                    expect(ajax.data.paymentInfo.last_name).toBe('');
                });
                
                it('all field filled', function() {
                    customer.phone = 'phone';
                    customer.email = 'email';
                    customer.first_name = 'first name';
                    customer.last_name = '   last   ';
                    
                    model.submit_order_and_pay();
                    expect(ajax.data.orderInfo.call_name).toBe('first name    last / pickup time / phone');
                    expect(ajax.data.paymentInfo.phone).toBe('phone');
                    expect(ajax.data.paymentInfo.email).toBe('email');
                    expect(ajax.data.paymentInfo.first_name).toBe('first name');
                    expect(ajax.data.paymentInfo.last_name).toBe('   last   ');
                });
            });
            
            describe('set address for dining option delivery', function() {
                beforeEach(function() {
                    checkout.dining_option = 'DINING_OPTION_DELIVERY';
                    customer.addresses = ['1', '2'];
                    customer.shipping_address = -1;
                });
                
                it('other delivery address', function() {
                    model.submit_order_and_pay();
                    expect(ajax.data.paymentInfo.address).toBe('2');
                });
                
                it('selected first delivery address', function() {
                    customer.shipping_address = 0;
                    model.submit_order_and_pay();
                    expect(ajax.data.paymentInfo.address).toBe('1');
                });
            });
            
            it('payment type = 1', function() {
                App.Data.get_parameters = {
                    tabId: 'tab',
                    customerId: 'customer',
                    locationId: 'location'
                };
                customer.phone = 'phone';                
                App.Data.settings.set('skin', App.Skins.PAYPAL); 

                model.submit_order_and_pay(1);
                expect(ajax.data.paymentInfo.tabId).toBe('tab');
                expect(ajax.data.paymentInfo.locationId).toBe('location');
                expect(ajax.data.paymentInfo.customerId).toBe('customer');
                expect(ajax.data.paymentInfo.phone).toBe('phone');
            });
            
            describe('payment type = 2', function() {
                
                it('default', function() {
                    model.submit_order_and_pay(2);
                    expect(ajax.data.paymentInfo).toEqual({ 
                        tip : 1, 
                        type : 2, 
                        cardInfo : { 
                            firstDigits : '', 
                            lastDigits : '', 
                            firstName : '', 
                            lastName : '',
                            address : null 
                        } 
                    });
                });
                
                it('with card info and address', function() {
                    card.cardNumber = '12345678901234567890';
                    card.firstName = 'first';
                    card.secondName = 'second';
                    card.street = 'street';
                    card.city = 'city';
                    card.state = 'state';
                    card.zip = 'zip';
                    model.submit_order_and_pay(2);
                    expect(ajax.data.paymentInfo.cardInfo).toEqual({
                        firstDigits : '1234', 
                        lastDigits : '7890', 
                        firstName : 'first', 
                        lastName : 'second',
                        address : { 
                            street : 'street', 
                            city : 'city', 
                            state : 'state', 
                            zip : 'zip'
                        } 
                    });
                });
                
                it('direct credit card not paid', function() {
                    payment_process.paypal_direct_credit_card = true;
                    card.cardNumber = '12345678901234567890';
                    card.expMonth = 'month';
                    card.expDate = 'date';
                    card.securityCode = 'sec';
                    model.submit_order_and_pay(2);
                    expect(ajax.data.paymentInfo.cardInfo).toEqual({
                        firstDigits : '1234', 
                        lastDigits : '7890', 
                        firstName : '', 
                        lastName : '',
                        address : null,
                        expMonth : 'month', 
                        expDate : 'date', 
                        cardNumber : '12345678901234567890', 
                        securityCode : 'sec'
                    });
                });
                
                it('direct credit card paid success', function() {
                    payment_process.paypal_direct_credit_card = true;
                    App.Data.get_parameters.pay = 'true';
                    checkout.payment_id = 'pay';
                    model.submit_order_and_pay(2);
                    expect(ajax.data.paymentInfo.payment_id).toEqual('pay');
                });
                
                it('direct credit card paid fail', function() {
                    payment_process.paypal_direct_credit_card = true;
                    App.Data.get_parameters.pay = 'false';
                    checkout.payment_id = 'pay';
                    model.submit_order_and_pay(2);
                    expect(model.paymentResponse).toEqual({status: 'error', errorMsg: 'Payment Canceled'});
                    expect(model.trigger).toHaveBeenCalledWith('paymentResponse');
                });
                
                it('usaepay paid success', function() {
                    payment_process.usaepay = true;
                    App.Data.get_parameters = {
                        pay: 'true',
                        UMrefNum: 'ref'
                    };
                    checkout.payment_id = 'pay';
                    model.submit_order_and_pay(2);
                    expect(ajax.data.paymentInfo.transaction_id).toBe('ref');                    
                });
                
                it('usaepay paid fail', function() {
                    payment_process.usaepay = true;
                    App.Data.get_parameters = {
                        pay: 'false',
                        UMerror: 'error'
                    };
                    checkout.payment_id = 'pay';
                    model.submit_order_and_pay(2);
                    expect(model.paymentResponse).toEqual({status: 'error', errorMsg: 'error'});
                    expect(model.trigger).toHaveBeenCalledWith('paymentResponse');                  
                });
                
            });
            
            describe('payment type = 3', function() {
                
                it('default', function() {
                    model.submit_order_and_pay(3);
                    expect(ajax.data.paymentInfo).toEqual({ 
                        tip : 1, 
                        type : 3
                    });
                });
                
                it('paid success', function() {
                    App.Data.get_parameters = {
                        pay: 'true',
                        PayerID: 'id'
                    };
                    checkout.payment_id = 'payment';
                    model.submit_order_and_pay(3);
                    expect(ajax.data.paymentInfo).toEqual({ 
                        tip : 1, 
                        type : 3,
                        payer_id : 'id', 
                        payment_id : 'payment'
                    });                    
                });
                
                it('paid false', function() {
                    App.Data.get_parameters.pay = 'false';
                    model.submit_order_and_pay(3);
                    expect(model.paymentResponse).toEqual({status: 'error', errorMsg: 'Payment Canceled'});
                    expect(model.trigger).toHaveBeenCalledWith('paymentResponse');
                });
            });
            
            describe('notifications', function() {
                
                it('skin mlb', function() {
                    customer.email = 'email';
                    customer.phone = 'phone';
                    App.Data.settings.set('skin', 'mlb');
                    model.submit_order_and_pay();
                    expect(ajax.data.notifications).toEqual([
                        { skin : 'mlb', type : 'email', destination : 'email' }, 
                        { skin : 'mlb', type : 'sms', destination : 'phone' } 
                    ]);
                });
                
                it('skin weborder, weborder_mobile', function() {
                    customer.email = 'email1';
                    App.Data.settings.set('skin', App.Skins.WEBORDER);
                    model.submit_order_and_pay();
                    expect(ajax.data.notifications).toEqual([ { skin : 'weborder', type : 'email', destination : 'email1' } ]);
                });               
            });
            
            it('reward card', function() {
                checkout.rewardCard = 123;
                model.submit_order_and_pay();
                expect(ajax.data.paymentInfo.reward_card).toEqual('123'); 
            });
            
            describe('ajax success', function() {
                
                beforeEach(function() {
                    model.submit_order_and_pay(5);
                });
                
                it('status OK', function() {
                    var data = {status: 'OK'};
                    ajax.success(data);
                    expect(model.paymentResponse).toBe(data);
                    expect(model.trigger).toHaveBeenCalledWith('paymentResponse');
                });
                
                it('status REDIRECT', function() {
                    var data = {
                        status: 'REDIRECT',
                        data: {
                            payment_id: 'id'
                        }
                    };
                    ajax.success(data);
                    expect(model.checkout.set.calls.allArgs()).toEqual([['payment_id', 'id'],['payment_type', 5]]);
                    expect(model.checkout.saveCheckout).toHaveBeenCalled();
                });
                
                describe('status INSUFFICIENT_STOCK', function() {
                    var set;
                    
                    beforeEach(function() {
                        spyOn(App.Models.Myorder.prototype, 'get_product').and.returnValue(new Backbone.Model({
                            name: 'name',
                            id: 12,
                            id_category: 123
                        }));
                        spyOn(model, 'remove').and.callFake(function(m){
                            m = Array.prototype.slice.call(m, 0);
                            m.push({silent: true});
                            App.Collections.Myorders.prototype.remove.apply(model, m);
                        });
                        
                        var mock1 = new App.Models.Myorder({name: 'obj1', id_product: 1}),
                            mock2 = new App.Models.Myorder({name: 'obj2', id_product: 2});
                        model.add([mock1, mock2], {silent: true});

                        set = {
                            set: function() {}
                        };
                        this.product = App.Data.products;
                        App.Data.products = {
                            123: {
                                get_product: function() {
                                    return set;
                                }
                            }
                        };
                        spyOn(set, 'set');
                    });
                    
                    afterEach(function() {
                        App.Data.products = this.product;
                    });
                    
                    it('empty responseJSON updated', function() {
                        var data = {
                            status: 'INSUFFICIENT_STOCK',
                            responseJSON: []
                        };
                        ajax.success(data);
                        expect(model.trigger.calls.argsFor(0)[1][0].indexOf(MSG.ERROR_INSUFFICIENT_STOCK)).not.toBe(-1);
                    });
                    
                    it('stock become 0', function() {
                        var data = {
                            status: 'INSUFFICIENT_STOCK',
                            responseJSON: [{
                                id: 1,
                                stock_amount: 0
                            }]
                        };
                        ajax.success(data);
                        expect(set.set).toHaveBeenCalledWith('active', false);
                        expect(model.length).toBe(1);
                    });
                    
                    it('stock become not 0', function() {
                        var data = {
                            status: 'INSUFFICIENT_STOCK',
                            responseJSON: [{
                                id: 1,
                                stock_amount: 1
                            }]
                        };
                        ajax.success(data);
                        expect(set.set).toHaveBeenCalledWith('stock_amount', 1);
                        expect(model.length).toBe(2);
                        
                    });
                });
                
                it('status ORDERS_PICKUPTIME_LIMIT', function() {
                    var data = {status: 'ORDERS_PICKUPTIME_LIMIT'};
                    ajax.success(data);
                    expect(App.Data.errors.alert_red).toHaveBeenCalledWith(MSG.ERROR_ORDERS_PICKUPTIME_LIMIT);
                    expect(model.trigger).toHaveBeenCalledWith('paymentFailed');
                });
                
                it('status REWARD CARD UNDEFINED', function() {
                    var data = {status: 'REWARD CARD UNDEFINED'};
                    ajax.success(data);
                    expect(App.Data.errors.alert_red).toHaveBeenCalledWith(MSG.REWARD_CARD_UNDEFINED);
                    expect(model.trigger).toHaveBeenCalledWith('paymentFailed');
                });
                
                it('status OTHER', function() {
                    var data = {status: 'OTHER', errorMsg: 'other'};
                    ajax.success(data);
                    expect(App.Data.errors.alert_red).toHaveBeenCalledWith(MSG.ERROR_OCCURRED + 'other');
                    expect(model.trigger).toHaveBeenCalledWith('paymentFailed');
                });
                
            });
        });
    });
});
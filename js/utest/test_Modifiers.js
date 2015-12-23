define(['modifiers', 'js/utest/data/Modifiers'], function(modifiers, data) {
    
    describe('App.Models.Modifier', function() {
        
        
        var model, def, ex, ex0;
        
        beforeEach(function() {
            model = new App.Models.Modifier(),
            def = deepClone(data.defaluts),
            defInitialized = deepClone(data.defaults_initialized),
            ex = deepClone(data.ex),
            ex0 = deepClone(data.ex0);
                
        });
        
        it('Environment', function() {
            expect(App.Models.Modifier).toBeDefined();
        });
       
        it('Create empty', function() {
            expect(model.toJSON()).toEqual(defInitialized);
        });
        
        it('addJSON()', function() {
            expect(model.addJSON(ex0).toJSON()).toEqual(ex);
        });
        
        it('clone()', function() {
            model.addJSON(ex);
            var clone = model.clone();
            expect(clone.toJSON()).toEqual(ex);
            expect(clone.cid).not.toBe(model.cid);
            expect(clone.__proto__).toBe(model.__proto__);
        });
        
        it('update()', function() {
            var clone = model.clone().addJSON(ex);
            expect(model.toJSON()).toEqual(defInitialized);
            expect(model.update(clone).toJSON()).toEqual(ex);
        });
    
        describe('updateSum()', function() {
            it('`free_amount` is undefined', function() {
                spyOn(model, 'getSum').and.returnValue(10);
                model.updateSum(2);
                expect(model.get('sum')).toBe(20);
            });

            it('`free_amount` is set', function() {
                model.set('free_amount', 10);
                model.updateSum(2);
                expect(model.get('sum')).toBe(20);
            });
        });

        describe('modifiers_submit()', function() {
            
            it('not selected', function() {
                model.set({selected: false});
                expect(model.modifiers_submit()).toBeUndefined();
            });
            
            it('selected', function() {
                model.set({
                    selected: true,
                    id: 'id',
                    cost: 'cost',
                    price: '12'
                });

                expect(model.modifiers_submit()).toEqual({
                    modifier: 'id',
                    modifier_cost: 'cost',
                    modifier_price: 12,
                    free_mod_price: undefined,
                    max_price_amount: undefined,
                    qty: 1,
                    qty_type: 0
                });

                // `cost` is null
                model.set('cost', null);
                expect(model.modifiers_submit().modifier_cost).toBe(0);

                // is free
                spyOn(model, 'isFree').and.returnValue(true);
                var free_amount = 'free_amount';
                model.set('free_amount', free_amount);
                expect(model.modifiers_submit().free_mod_price).toBe(free_amount);

                // max price
                spyOn(model, 'isMaxPriceFree').and.returnValue(true);
                var max_price_amount = 'max_price_amount';
                model.set('max_price_amount', max_price_amount);
                expect(model.modifiers_submit().max_price_amount).toBe(max_price_amount);
            });

            it('selected, free', function() {
                model.set({
                    selected: true,
                    id: 'id',
                    cost: null,
                    price: '12'
                });
                expect(model.modifiers_submit().modifier_cost).toBe(0);
            });
        });
        
        describe('update_prices()', function() {
            var max_price = 15;

            beforeEach(function() {
                model.set('max_price', max_price);
            });
            
            it('price > max_price', function() {
                model.set('price', 20);

                expect(model.update_prices(max_price)).toBe(0);
                expect(model.get('max_price_amount')).toBe(max_price);
            });
            
            it('price < max_price', function() {
                model.set('price', 10);

                expect(model.update_prices(max_price)).toBe(5);
                expect(model.get('max_price_amount')).toBeUndefined();
            });
        });

        it('removeFreeModifier()', function() {
            model.set('free_amount', 10);
            model.removeFreeModifier();
            expect(model.get('free_amount')).toBeUndefined();
        });

        it('half_price_koeff()', function() {
            model.set('qty_type', 0);
            expect(model.half_price_koeff()).toBe(1);

            model.set('qty_type', 1);
            expect(model.half_price_koeff()).toBe(0.5);
        });
    });
    
    describe('App.Collections.Modifiers', function() {
        
        var model, def, ex, ex2;
        
        beforeEach(function() {
            model = new App.Collections.Modifiers(),
            def = deepClone(data.def), 
            ex = deepClone(data.ex);
            ex2 = deepClone(data.ex2);
                
        });
        
        it('Environment', function() {
            expect(App.Collections.Modifiers).toBeDefined();
        });
       
        it('Create empy', function() {
            expect(model.toJSON()).toEqual([]);
        });
        
        it('comparator()', function() {
            model.add([ex, ex2]);
            expect(model.at(0).toJSON()).toEqual(ex2);
            expect(model.at(1).toJSON().id).toEqual(ex.id);
        });
        
        it('addJSON()', function() {
            expect(model.addJSON([ex, ex2]).toJSON()).toEqual([ex2, ex]);
        });
        
        it('clone()', function() {
            model.add(ex);
            model.add(ex2);
            var clone = model.clone();
            expect(clone.toJSON()).toEqual([ex2, ex]);
            expect(clone.get(ex).cid).not.toBe(model.get(ex).cid);
            expect(clone.__proto__).toBe(model.__proto__);
        });
        
        it('update()', function() {
            model.add(ex);
            var clone = model.clone().addJSON([ex, ex2]);
            expect(model.toJSON()).toEqual([ex]);
            expect(model.update(clone).toJSON()).toEqual([ex2, ex]);
        });
                
        describe('reset_checked()', function() {
            
            it('Check filter options', function() {
                spyOn(model,'where').and.returnValue([]);
                model.reset_checked();
                expect(model.where).toHaveBeenCalledWith({selected : true});
            });
            
            it('Check correct modifier block calls', function() {
                var obj = [{
                    set: function() {}
                }];
                spyOn(model,'where').and.returnValue(obj);
                spyOn(obj[0],'set');
                
                model.reset_checked();
                expect(obj[0].set).toHaveBeenCalledWith('selected', false);
            });
            
        });
        
        it('get_sum()', function() {
            model.add([{selected: true, price: 1}, {selected: true, price: 10}, {price: 100}]);
            expect(model.get_sum()).toBe(11);
        });
    
        it('modifiers_submit()', function() {
            var count = 1;
            model.add([{}, {}]);
            spyOn(App.Models.Modifier.prototype, 'modifiers_submit').and.callFake(function() {
                if (count--) {
                    return 'test';
                }
            });
            expect(model.modifiers_submit()).toEqual(['test']);
        });
        
        it('update_prices()', function() {
            spyOn(App.Models.Modifier.prototype, 'update_prices').and.callFake(function(price){
                return price - 1;
            });
            model.add([{selected: true},{selected: true}]);
            expect(model.update_prices(12)).toBe(10);
        });

        it('removeFreeModifiers()', function() {
            model.add(ex);
            model.each(function(modifier) {
                spyOn(modifier, 'removeFreeModifier');
            });
            model.removeFreeModifiers();
            model.each(function(modifier) {
                expect(modifier.removeFreeModifier).toHaveBeenCalled();
            });
        });
    });
    
    describe('App.Models.ModifierBlock', function() {
        
        var model, def, ex, ex2, modColl, defBlock, exBlock, exDef, exBlock2;
        
        beforeEach(function() {
            model = new App.Models.ModifierBlock();
            def = deepClone(data.def);
            ex = deepClone(data.ex);
            ex2 = deepClone(data.ex2);
            defBlock = deepClone(data.defBlock);
            exBlock = deepClone(data.exBlock);
            exBlock2 = deepClone(data.exBlock2);
            modColl = new App.Collections.Modifiers([ex, ex2]);
            exDef = deepClone(exBlock);
            exDef.modifiers = new App.Collections.Modifiers([ex, ex2]);
                
        });
        
        it('Environment', function() {
            expect(App.Models.ModifierBlock).toBeDefined();
        });
       
        it('Create empty. Test initialization', function() {
            var spy = jasmine.createSpy('event change'),
                modifiers = model.get('modifiers');

            expect(model.get('modifiers').__proto__).toBe(App.Collections.Modifiers.prototype );
            
            model.listenTo(model, 'change:modifiers', spy); // change modifier model trigger
            modifiers.add(ex);
            expect(spy).not.toHaveBeenCalled();
            model.set('modifiers', ex2);
            expect(spy).toHaveBeenCalled();
            expect(spy.calls.mostRecent().args[0].cid).toBe(model.cid);

            expect(model.get('amount_free_selected')).toEqual([]);
            model.unset('modifiers'); // check default modifierBlock
            expect(model.toJSON()).toEqual(defBlock);
        });
        
        it('Create example', function() {
            model.set(exDef);
            expect(model.get('modifiers').toJSON()).toEqual(modColl.toJSON());
            model.unset('modifiers');
            expect(model.toJSON()).toEqual(exBlock);
        });
        
        it('addJSON()', function() {
            var example = deepClone(exBlock);
            exBlock.modifiers = modColl.toJSON();
            model.addJSON(exBlock);
            expect(model.get('modifiers').toJSON()).toEqual(modColl.toJSON());
            model.unset('modifiers');
            expect(model.toJSON()).toEqual(example);
        });
        
        it('clone()', function() {
            model.set(exDef);
            var clone = model.clone();
            expect(clone.get('modifiers').toJSON()).toEqual(model.get('modifiers').toJSON());
            
            expect(clone.get('modifiers').__proto__).toBe(model.get('modifiers').__proto__);
            
            model.unset('modifiers');
            clone.unset('modifiers');
            expect(clone.cid).not.toBe(model.cid);
            expect(clone.toJSON()).toEqual(model.toJSON());
            
            expect(clone.__proto__).toBe(model.__proto__);
        });
        
        it('update()', function() {
            model.get('modifiers').set(ex);
            model.set(exBlock2);
            
            var clone = model.clone().set(exDef);
            
            expect(model.get('modifiers').toJSON()).toEqual([ex]);
            expect(model.get('name')).toBe('test');
            
            model.update(clone);
            expect(model.cid).not.toBe(clone.cid);
            expect(model.get('modifiers').toJSON()).toEqual([ex2, ex]);
            
            model.unset('modifiers');
            expect(model.toJSON()).toEqual(exBlock);
        });
                
        it('reset_checked()', function() {
            
            var obj = {
                reset_checked: function() {}
            };
            
            spyOn(model, 'get').and.returnValue(obj);
            spyOn(obj, 'reset_checked');
            
            model.reset_checked();
            
            expect(model.get).toHaveBeenCalledWith('modifiers');
            expect(obj.reset_checked).toHaveBeenCalled();
            
        });
        
        describe('get_sum()', function() {
            
            it('Size and Special', function() {
                model.set({
                    admin_modifier: true,
                    admin_mod_key: 'SIZE'
                });
                expect(model.get_sum()).toBe(0);
                model.set({admin_mod_key: 'SPECIAL'});
            });
            
            it('normal modifier', function() {
                var obj = {
                    get_sum: function() {
                        return 9;
                    }
                };
                spyOn(model, 'get').and.returnValue(obj);
                expect(model.get_sum()).toBe(9);
            });
        });
    
        describe('modifiers_submit()', function() {
            var isSpecial;
            
            beforeEach(function() {
                isSpecial = false;
                spyOn(model, 'isSpecial').and.callFake(function() {
                    return isSpecial;
                });
            });
            
            it('for special modifier', function() {
                isSpecial = true;
                expect(model.modifiers_submit()).toEqual([]);
            });
            
            it('for not special modifier', function() {
                var collection = new App.Collections.Modifiers();
                spyOn(App.Collections.Modifiers.prototype, 'modifiers_submit').and.returnValue(collection);
                expect(model.modifiers_submit()).toBe(collection);
            });
        });
        
        describe('isSpecial()', function() {
            
            it('not special', function() {
                expect(model.isSpecial()).toBe(false);
            });
            
            it('is special', function() {
                model.set('admin_modifier', true);
                model.set('admin_mod_key', 'SPECIAL');
                expect(model.isSpecial()).toBe(true);
            });
        });
        
        describe('update_prices()', function() {
            var isSpecial;
            
            beforeEach(function() {
                isSpecial = false;
                spyOn(model, 'isSpecial').and.callFake(function() {
                    return isSpecial;
                });                
                model.set('price', 12);
                spyOn(App.Collections.Modifiers.prototype, 'update_prices').and.callFake(function(price) {
                    return price - 1;
                });
            });
            
            it('not special', function() {
                expect(model.update_prices(15)).toBe(14);
            });
            
            it('is special', function() {
                isSpecial = true;
                expect(model.update_prices(15)).toBe(15);
                
            });
        });

        describe('update_free()', function() {
            var modifier;

            beforeEach(function() {
                modifier = new App.Models.Modifier();
                modifier.set(ex);
            });

            it('`ignore_free_modifiers` is true', function() {
                model.set('ignore_free_modifiers', true);
                expect(model.update_free(modifier)).toBeUndefined();
                expect(model.get('amount_free_selected').length).toBe(0);
            });

            it('`admin_modifier` is true', function() {
                model.set('admin_modifier', true);
                expect(model.update_free(modifier)).toBeUndefined();
                expect(model.get('amount_free_selected').length).toBe(0);
            });

            it('no selected modifers', function() {
                modifier.set('selected', false);
                expect(model.update_free(modifier)).toBeUndefined();
                expect(model.get('amount_free_selected').length).toBe(0);
            });

            it('`amount_free` is set, modifier is selected', function() {
                model.set('amount_free', 10);
                modifier.set('selected', true);
                model.update_free(modifier);
                expect(model.get('amount_free_selected')).toEqual([modifier]);
            });

            it('remove modifier from free selected', function() {
                model.set('amount_free_selected', [modifier]);
                modifier.set('free_amount', 10);
                modifier.set('selected', false);

                model.update_free(modifier);
                expect(model.get('free_amount')).toBeUndefined();
                expect(model.get('amount_free_selected').length).toBe(0);
            });

            it('`amount_free_is_dollars` it true', function() {
                spyOn(model, 'update_free_price');
                modifier.set('selected', true);
                model.set('amount_free', 10);
                model.set('amount_free_is_dollars', true);
                model.update_free(modifier);
                expect(model.update_free_price).toHaveBeenCalledWith(modifier);
            });
        });

        describe('update_free_quantity_change()', function() {
            var arg = 'model';

            beforeEach(function() {
                spyOn(model, 'update_free_price');
                spyOn(model, 'update_free_quantity');
            });

            it('`ignore_free_modifiers` or `admin_modifier` is true', function() {
                model.set('ignore_free_modifiers', true);
                expect(model.update_free_quantity_change()).toBeUndefined();

                model.set('ignore_free_modifiers', false);
                model.set('admin_modifier', true);

                expect(model.update_free_quantity_change()).toBeUndefined();
                expect(model.update_free_price).not.toHaveBeenCalled();
                expect(model.update_free_quantity).not.toHaveBeenCalled();
            });

            it('`amount_free_is_dollars` is true', function() {
                model.set('amount_free_is_dollars', true);
                model.update_free_quantity_change(arg);

                expect(model.update_free_price).toHaveBeenCalledWith(arg);
            });

            it('`amount_free_is_dollars` is false', function() {
                model.update_free_quantity_change(arg);

                expect(model.update_free_quantity).toHaveBeenCalledWith(arg);
            });
        });

        describe('update_free_quantity', function() {
            var modifier1, modifier2;
            beforeEach(function() {
                modifier1 = new App.Models.Modifier(ex);
                modifier2 = new App.Models.Modifier(ex2);
                model.set('amount_free_selected', [modifier1, modifier2]);
            });

            it('`amount_free` is 1, 1 modifier selected', function() {
                model.set('amount_free', 1);
                model.set('amount_free_selected', [modifier1]);
                model.update_free_quantity();

                expect(modifier1.get('free_amount')).toBe(0);
            });

            it('`amount_free` is 1, 2 modifiers selected', function() {
                model.set('amount_free', 1);
                model.update_free_quantity();

                expect(modifier1.get('free_amount')).toBe(0);
                expect(modifier2.get('free_amount')).toBeUndefined();
            });

            it('`amount_free` is 2, 2 modifiers selected', function() {
                model.set('amount_free', 2);
                model.update_free_quantity();

                expect(modifier1.get('free_amount')).toBe(0); // free
                expect(modifier1.get('free_amount')).toBe(0); // free
            });

            it('`amount_free` is 1.5, 2 modifiers selected', function() {
                model.set('amount_free', 1.5);
                modifier2.set('price', 1);
                model.update_free_quantity();

                expect(modifier1.get('free_amount')).toBe(0); // free
                expect(modifier2.get('free_amount')).toBe(0.5); // half price
            });

            it('`amount_free` is 1, 2 modifiers selected, both by one half', function() {
                spyOn(modifier1, 'half_price_koeff').and.returnValue(0.5);
                spyOn(modifier2, 'half_price_koeff').and.returnValue(0.5);
                model.set('amount_free', 1);
                model.update_free_quantity();

                expect(modifier1.get('free_amount')).toBe(0); // free
                expect(modifier2.get('free_amount')).toBe(0); // free
            });

            it('`amount_free` is 1, 2 modifiers selected, modifier1 is one half', function() {
                spyOn(modifier1, 'half_price_koeff').and.returnValue(0.5);
                model.set('amount_free', 1);
                modifier2.set('price', 1);
                model.update_free_quantity();

                expect(modifier1.get('free_amount')).toBe(0);
                expect(modifier2.get('free_amount')).toBe(0.5);
            });
        });

        describe('update_free_price()', function() {
            var modifier1, modifier2;
            beforeEach(function() {
                modifier1 = new App.Models.Modifier(ex);
                modifier2 = new App.Models.Modifier(ex2);
                model.set('amount_free_selected', [modifier1, modifier2]);
            });

            it('`amount_free` is 0', function() {
                model.set('amount_free', 0);
                model.update_free_price();

                expect(modifier1.get('free_amount')).toBeUndefined();
                expect(modifier2.get('free_amount')).toBeUndefined();
            });

            it('`amount_free` is 1, modifier1 price is 0.5, modifier2 price is 1', function() {
                model.set('amount_free', 1);
                modifier1.set('price', 0.5);
                modifier2.set('price', 1);
                model.update_free_price();

                expect(modifier1.get('free_amount')).toBe(0);
                expect(modifier2.get('free_amount')).toBe(0.5);
            });
        });

        describe('initFreeModifiers()', function() {
            it('`ignore_free_modifiers` is true', function() {
                model.set('ignore_free_modifiers', true);
                spyOn(model, 'get').and.callThrough();

                expect(model.initFreeModifiers()).toBeUndefined();
                expect(model.get).not.toHaveBeenCalledWith('modifiers');
            });
        });

        describe('restoreFreeModifiers()', function() {
            var modifier1, modifier2;
            beforeEach(function() {
                modifier1 = new App.Models.Modifier(ex);
                modifier2 = new App.Models.Modifier(ex2);
            });

            it('`ignore_free_modifiers` is true', function() {
                model.set('ignore_free_modifiers', true);
                spyOn(model, 'get').and.callThrough();

                expect(model.restoreFreeModifiers()).toBeUndefined();
                expect(model.get).not.toHaveBeenCalledWith('amount_free_selected');
            });
        });

        it('checkAmountFree()', function() {
            model.set('amount_free', -1);
            model.checkAmountFree();
            expect(model.get('amount_free')).toBe(0);
        });

        describe('removeFreeModifiers()', function() {
            it('modifiers aren\'t set', function() {
                model.removeFreeModifiers();

                expect(model.get('amount_free_selected')).toEqual([]);
            });

            it('modifiers are set', function() {
                model.set('modifiers', exDef.modifiers);
                var modifiers = model.get('modifiers');
                spyOn(modifiers, 'removeFreeModifiers');

                model.removeFreeModifiers();

                expect(modifiers.removeFreeModifiers).toHaveBeenCalled();
                expect(model.get('amount_free_selected')).toEqual([]);
            });
        });
    });
    
    describe('App.Collections.ModifierBlocks', function() {
        
        var model, def, ex, ex2, modColl, defBlock, exBlock, exDef, exBlock2, exBlocks, exBlocks2, load, loadModifiers, loadModifier;
        
        beforeEach(function() {
            model = new App.Collections.ModifierBlocks();
            def = deepClone(data.def);
            ex = deepClone(data.ex);
            ex2 = deepClone(data.ex2);
            defBlock = deepClone(data.defBlock);
            exBlock = deepClone(data.exBlock);
            exBlock2 = deepClone(data.exBlock2);
            exBlocks = deepClone(data.exBlocks);
            exBlocks2 = deepClone(data.exBlocks2);
            modColl = new App.Collections.Modifiers([ex, ex2]);
            exDef = deepClone(exBlocks2);
            exDef.map(function(elem) {
               elem.modifiers =  new App.Collections.Modifiers(elem.modifiers);
               return elem;
            });
            load = deepClone(data.load);
            loadModifiers = deepClone(data.loadModifiers);
            loadModifier = deepClone(data.loadModifier);
        });
        
        it('Environment', function() {
            expect(App.Collections.ModifierBlocks).toBeDefined();
        });
       
        it('Create empy', function() {
            expect(model.toJSON()).toEqual([]);
        });
        
        it('comparator()', function() {
            model.add(exDef);
            expect(model.at(0).get('id')).toBe(exBlocks2[1].id);
            expect(model.at(1).get('id')).toBe(exBlocks2[0].id);
        });
        
        it('update_prices()', function() {
            spyOn(App.Models.ModifierBlock.prototype, 'update_prices').and.callFake(function(price) {
                return price - 1;
            });
            model.add([{},{}]);
            expect(model.update_prices(12)).toBe(10);
        });
        
        it('addJSON()', function() {
            expect(model.addJSON(exBlocks2).length).toBe(exBlocks2.length);
            expect(model.at(1).get('modifiers').toJSON()).toEqual(exBlocks2[0].modifiers);
            
            delete model.at(1).attributes.modifiers;
            delete exBlocks2[0].modifiers;
            expect(model.at(1).toJSON()).toEqual(exBlocks2[0]);
        });
        
        it('clone()', function() {
            model.addJSON(exBlocks2);
            var clone = model.clone();
            expect(clone.length).toBe(model.length);
            
            expect(clone.__proto__).toBe(model.__proto__);
            
            expect(clone.at(0).cid).not.toBe(model.at(0).cid);
            expect(clone.at(1).cid).not.toBe(model.at(1).cid);
        });
        
        it('update()', function() {
            var clone = model.clone();
            model.addJSON(exBlocks);
            clone.addJSON(exBlocks2);
            
            expect(model.at(0).cid).not.toBe(clone.at(0).cid);
            
            model.update(clone);
            expect(model.length).toBe(clone.length);
            expect(model.at(0).cid).not.toBe(clone.at(0).cid);
            expect(model.at(1).cid).not.toBe(clone.at(1).cid);
        });
        
        it('get_modifiers()', function() {
            var success, error, arg,
                ajaxStub = function() {
                    arg = arguments;
                    success = arguments[0].successResp;
                    error = arguments[0].error;
                    return ajaxStub;
                };
            
            spyOn($,'ajax').and.callFake(ajaxStub);
            var add = spyOn(App.Models.ModifierBlock.prototype, 'addJSON').and.returnValue(new App.Models.ModifierBlock);
            
            model.get_modifiers();
            success(load);
            expect(model.length).toBe(1);
            expect(add.calls.count()).toBe(1);
            expect(add.calls.mostRecent().args[0]).toBe(load[0]);
        });

        it('find_modifier()', function() {
            expect(model.find_modifier('non-existing id')).toBeUndefined();
            model.addJSON(exBlocks);

            expect(model.find_modifier('122')).toEqual(model.get('12').get('modifiers').get('122'));
        });
        
        it('get_modifierList()', function() {
            model.addJSON(exBlocks2);
            var list = model.get_modifierList();
            expect(list.length).toBe(2);
            expect([list[0].toJSON(), list[1].toJSON()]).toEqual([exBlocks2[2].modifiers[0], exBlocks2[3].modifiers[0]]);
        });
        
        describe('getSizeModel()', function() {
            
            it('Not size modifiers', function() {
                model.addJSON(exBlocks);
                expect(model.getSizeModel()).toBeUndefined();
            });
            
            it('Not selected size modifiers', function() {
                exBlocks2[0].modifiers[0].selected = false;
                model.addJSON(exBlocks2);
                expect(model.getSizeModel()).toBeNull();
            });
            
            it('Selected size modifiers', function() {                
                model.addJSON(exBlocks2);
                expect(model.getSizeModel().get('id')).toBe(11);
            });
        });
        
        describe('get_special()', function() {
            
            it('Not special modifiers', function() {
                model.addJSON(exBlocks);
                expect(model.get_special().length).toBe(0);
            });
            
            it('Not selected special modifiers', function() {
                exBlocks2[1].modifiers[0].selected = false;
                model.addJSON(exBlocks2);
                expect(model.get_special().length).toBe(0);
            });
            
            it('Selected size modifiers', function() {                
                model.addJSON(exBlocks2);
                expect(model.get_special().length).toBe(1);
                expect(model.get_special()[0].get('id')).toBe(122);
            });
        });
        
        it('get_special_text()', function() {
            spyOn(model, 'get_special').and.returnValue([new Backbone.Model({name: 'test1'}), new Backbone.Model({name: 'test2'})]);
            expect(model.get_special_text()).toBe('test1,test2');
        });
        
        describe('checkForced()', function() {
            
            it('Not forced modifiers', function() {
                model.addJSON(exBlocks);
                expect(model.checkForced()).toBe(true);
            });
            
            it('Not force as false modifiers', function() {
                exBlocks2[2].forced = false;
                model.addJSON(exBlocks2);
                expect(model.checkForced()).toBe(true);
            });
            
            it('Selected one force as true modifiers not selected', function() {    
                exBlocks2[2].modifiers[0].selected = false;
                model.addJSON(exBlocks2);
                var forced = model.checkForced();
                expect(forced.length).toBe(1);
                expect(forced[0].id).toBe(3);
            });
            
            it('Selected one force as true modifiers selected', function() {           
                model.addJSON(exBlocks2);
                expect(model.checkForced()).toBe(true);
            });
            
            it('Selected two force as true, zero modifiers selected', function() {   
                exBlocks2[3].forced = true;
                exBlocks2[3].modifiers[0].selected = false;
                exBlocks2[3].minimum_amount = 1;
                exBlocks2[2].modifiers[0].selected = false;
                model.addJSON(exBlocks2);
                var forced = model.checkForced();
                expect(forced.length).toBe(2);
                expect([forced[0].id, forced[1].id]).toEqual([3,4]);
            });
            
            it('Selected two force as true, one modifiers selected', function() {
                exBlocks2[2].modifiers[0].selected = false;
                model.addJSON(exBlocks2);
                var forced = model.checkForced();
                expect(forced.length).toBe(1);
                expect(forced[0].id).toBe(3);
            });
            
            it('Selected two force as true, two modifiers selected', function() {   
                exBlocks2[3].forced = true;          
                model.addJSON(exBlocks2);
                expect(model.checkForced()).toBe(true);
            });
        });

        describe('checkAmount()', function() {
            it('maximum_amount is not set for any modifierBlock', function() {
                model.addJSON(exBlocks2);
                expect(model.checkAmount()).toBe(true);
            });

            it('quantity of selected modifiers less than maximum_amount', function() {
                exBlocks2[0].maximum_amount = 2;
                exBlocks2[0].maximum_amount = 1;
                model.addJSON(exBlocks2);
                expect(model.checkAmount()).toBe(true);
            });

            it('quantity of selected modifiers more than maximum_amount', function() {
                exBlocks2[0].maximum_amount = 1;
                exBlocks2[0].modifiers[0].quantity = 2;
                model.addJSON(exBlocks2);
                var result = model.checkAmount();
                expect(result.length).toBe(1);
                expect(result[0].id).toBe(1);
            });
        });

        it('uncheck_special()', function() {
            var arr = [new Backbone.Model({name: 'test1', selected: true}), new Backbone.Model({name: 'test2', selected: true})];
            spyOn(model, 'get_special').and.returnValue(arr);
            model.uncheck_special('test1'); // compare only with first selected model
            expect(arr[0].get('selected')).toBe(true);
            expect(arr[1].get('selected')).toBe(true);
            
            model.uncheck_special('test2'); // compare only with first selected model
            expect(arr[0].get('selected')).toBe(false);
            expect(arr[1].get('selected')).toBe(false);
        });
        
        it('get_sum()', function() {
            model.add([{},{}]);
            spyOn(App.Models.ModifierBlock.prototype, 'get_sum').and.returnValue(2);
            expect(model.get_sum()).toBe(4);
        });
    
        it('modifiers_submit()', function() {
            model.add([{}, {}]);
            spyOn(App.Models.ModifierBlock.prototype, 'modifiers_submit').and.returnValue(['test']);
            expect(model.modifiers_submit()).toEqual(['test', 'test']);
        });

        it('removeFreeModifiers()', function() {
            var block1 = new App.Models.ModifierBlock(),
                block2 = new App.Models.ModifierBlock();
            spyOn(block1, 'removeFreeModifiers');
            spyOn(block2, 'removeFreeModifiers');

            model.add([block1, block2]);
            model.removeFreeModifiers();
            expect(block1.removeFreeModifiers).toHaveBeenCalled();
            expect(block2.removeFreeModifiers).toHaveBeenCalled();
        });
    });
    
    describe('static methods', function() {
        
        it('init()', function() {
            spyOn(App.Collections.ModifierBlocks.prototype, 'get_modifiers');
            App.Collections.ModifierBlocks.init(5);
            
            expect(App.Data.modifiers[5]).toBeDefined();
            expect(App.Collections.ModifierBlocks.prototype.get_modifiers).toHaveBeenCalledWith(5);
            var count = App.Collections.ModifierBlocks.prototype.get_modifiers.callCount;
            
            App.Collections.ModifierBlocks.init(5);
            expect(App.Collections.ModifierBlocks.prototype.get_modifiers.callCount).toBe(count);
        });
    });
});
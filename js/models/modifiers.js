/*
 * Revel Systems Online Ordering Application
 *
 *  Copyright (C) 2014 by Revel Systems
 *
 * This file is part of Revel Systems Online Ordering open source application.
 *
 * Revel Systems Online Ordering open source application is free software: you
 * can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Revel Systems Online Ordering open source application is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Revel Systems Online Ordering Application.
 * If not, see <http://www.gnu.org/licenses/>.
 */

define(["backbone"], function(Backbone) {
    'use strict';

    App.Models.Modifier = Backbone.Model.extend({
        defaults: {
            id: null,
            name: null,
            price: null,
            selected: false,
            sort: null,
            cost: null, // only for order send.
            img: null
        },
        initialize: function() {
            this.set("img", App.Data.settings.get("img_path"));
        },
        addJSON: function(data) {
            this.set(data);
            return this;
        },
        clone: function() {
            var newModifier = new App.Models.Modifier();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) { value = value.clone(); }
                newModifier.set(key, value, {silent: true });
            }
            return newModifier;
        },
        update: function(newModifier) {
            for (var key in newModifier.attributes) {
                var value = newModifier.get(key);
                if (value && value.update) { this.get(key).update(value); }
                else { this.set(key, value, {silent: true}); }
            }
            return this;
        },
        /**
         * check modifiers before repeat order
         */
        check_repeat: function() {
            var m_actual = this.get('actual_data');

            //remove item if it is inactive
            if(!m_actual.active) {
                return 'remove';
            }
            // set actual data if product changed
            if(this.get('price') !== m_actual.price) {
                this.set('price', m_actual.price);
                return 'changed';
            }
        },
        /**
         * prepare information for submit order
         */
        modifiers_submit: function() {
            if (this.get('selected')) {
                return {
                    modifier: this.get('id'),
                    modifier_cost: (this.get('cost') === null) ? 0 : this.get('cost'),
                    modifier_price: this.get('price') * 1,
                    qty: 1,
                    qty_type: 0
                };
            }
        }
    });

    App.Collections.Modifiers = Backbone.Collection.extend({
        model: App.Models.Modifier,
        comparator: function(model) {
            return model.get("sort");
        },
        addJSON: function(data) {
            var self = this;
            data && data.forEach(function(element) {
                var modifier = new App.Models.Modifier();
                modifier.addJSON(element);
                self.add(modifier);
            });
            return this;
        },
        clone: function() {
            var newModifiers = new App.Collections.Modifiers();
            this.each(function(modifier) {
               newModifiers.add(modifier.clone()) ;
            });
            return newModifiers;
        },
        update: function(newModifiers) {
            var self = this;
            newModifiers.each(function(modifier) {
                var oldModifier = self.get(modifier);
                if (oldModifier) {
                    oldModifier.update(modifier);
                } else {
                    self.add(modifier.clone());
                }
            });
            return this;
        },
        /*
         * unselect selected models
         */
        reset_checked: function() {
            this.where({selected: true}).map(function(el) { el.set('selected', false) });
        },
        /**
         * check modifiers before repeat order
         */
        check_repeat: function() {
            var changes,
                self = this;

            this.where({selected: true}).forEach(function(modifier) {
                var result = modifier.check_repeat();
                if (result === 'remove') {
                    self.remove(modifier);
                    changes = 'changed';
                } else if (result === 'changed') {
                    changes = 'changed';
                }
            });

            return changes;
        },
        /**
         * get modifiers sum
         */
        get_sum: function() {
            var sum = 0;
            this.where({selected: true}).forEach(function(modifier) {
                sum += modifier.get('price');
            });
            return sum;
        },
        /**
         * prepare information for submit order
         */
        modifiers_submit: function() {
            var modifiers = [];
            this.each(function(modifier) {
                var res = modifier.modifiers_submit();
                res && modifiers.push(res);
            });
            return modifiers;
        }

    });

    App.Models.ModifierBlock = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                sort: null,
                modifiers: new App.Collections.Modifiers(),
                name: "",
                mod: "",
                img: App.Data.settings.get("img_path"),
                modifier_type: "modifier_multiple",
                lock_amount: null,
                lock_enable: false,
                amount_free: null,
                admin_modifier: false,
                admin_mod_key: ""
            };
        },
        initialize: function() {
            this.listenTo(this.get('modifiers'), 'change', function(model, opts) {
                this.trigger('change', this, _.extend({modifier: model}, opts));
            });
        },
        addJSON: function(data) {
            this.set(data);
            var modifiers = new App.Collections.Modifiers();
            modifiers.addJSON(data.modifier || data.modifiers);
            this.set('modifiers', modifiers);
            this.initialize(); // need add listeners to new modifiers collection
            return this;
        },
        /**
         * clone modifier Block
         */
        clone: function() {
            var newBlock = new App.Models.ModifierBlock();
            newBlock.stopListening(newBlock);
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) { value = value.clone(); }
                newBlock.set(key, value, {silent : true });
            }
            newBlock.listenTo(newBlock.get('modifiers'), 'change', function(model, opts) {
                newBlock.trigger('change', newBlock, _.extend({modifier: model}, opts));
            });

            return newBlock;
        },
        /**
         * update modifier Block
         */
        update: function(newBlock) {
            for (var key in newBlock.attributes) {
                var value = newBlock.get(key);
                if (value && value.update) { this.get(key).update(value); }
                else { this.set(key, value, {silent: true}); }
            }
        },
        /*
         * unselect attributes
         */
        reset_checked: function() {
            this.get('modifiers').reset_checked();
        },
        /**
         * check modifiers before repeat order
         */
        check_repeat: function() {
            return this.get('modifiers').check_repeat();
        },
        /**
         * get modifiers sum
         */
        get_sum: function() {
            if(this.get('admin_modifier') && (this.get('admin_mod_key') === 'SIZE' || this.get('admin_mod_key') === 'SPECIAL')) {
                return 0;
            } else {
                return this.get('modifiers').get_sum();
            }
        },
        /**
         * prepare information for submit order
         */
        modifiers_submit: function() {
            // selected special modifiers add to special_request
            if(this.get('admin_modifier') && this.get('admin_mod_key') === 'SPECIAL') {
                return [];
            }

            return this.get('modifiers').modifiers_submit();
        }
    });

    App.Collections.ModifierBlocks = Backbone.Collection.extend({
        model: App.Models.ModifierBlock,
        comparator: function(model) {
            return model.get('sort');
        },
        initialize: function() {
            this.listenTo(this, 'change', function(model, opts) {
                var isSizeSelection = opts
                    && opts.modifier instanceof App.Models.Modifier
                    && opts.modifier.get('selected')
                    && model instanceof App.Models.ModifierBlock
                    && model.get('admin_mod_key') === 'SIZE'
                    && model.get('admin_modifier');

                if (isSizeSelection) {
                    this.trigger('modifiers_size', opts.modifier.get('price'));
                } else {
                    var isSpecialSelection = opts
                        && opts.modifier instanceof App.Models.Modifier
                        && opts.modifier.get('selected')
                        && model instanceof App.Models.ModifierBlock
                        && model.get('admin_mod_key') === 'SPECIAL'
                        && model.get('admin_modifier');

                    isSpecialSelection && this.trigger('modifiers_special');
                }
            }, this);
        },
        addJSON: function(data) {
            var self = this;
            data && data.forEach(function(element) {
                var modifierBlock = new App.Models.ModifierBlock();
                modifierBlock.addJSON(element);
                self.add(modifierBlock);
            });
            return this;
        },
        /**
         * clone modifier Blocks
         */
        clone: function() {
            var newBlock = new App.Collections.ModifierBlocks();
            this.each(function(modifierBlock) {
               newBlock.add(modifierBlock.clone()) ;
            });
            return newBlock;
        },
        /**
         * update modifier Blocks
         */
        update: function(newModel) {
            var self = this;
            newModel.each(function(modifierBlock) {
                var oldModifierBlock = self.get(modifierBlock);
                if (oldModifierBlock) {
                    oldModifierBlock.update(modifierBlock);
                } else {
                    self.add(modifierBlock.clone());
                }
            });
            return this;
        },
        /**
         * Get modifiers from backend.
         */
        get_modifiers: function(id_product) {
            var self = this,
                fetching = new $.Deferred(); // Pointer that all data loaded

            $.ajax({
                url: App.Data.settings.get("host") + "/weborders/modifiers/",
                data: {
                    product: id_product
                },
                dataType: "json",
                successResp: function(modifierBlocks) {
                    modifierBlocks.forEach(function(modifierBlock) {
                        self.add(new App.Models.ModifierBlock().addJSON(modifierBlock));
                    });
                    fetching.resolve();
                },
                error: function() {
                    App.Data.errors.alert(MSG.ERROR_MODIFIERS_LOAD, true);
                }
            });

            return fetching;
        },
        /**
         * all modifiers to array
         */
        get_modifierList: function() {
            if (!this.list || this.list && this.list.length === 0) {
                var list = [];
                this.each(function(model) {
                    if (model.get('admin_mod_key') !== 'SIZE' && model.get('admin_mod_key') !== 'SPECIAL') {
                       model.get('modifiers').each(function(model) {
                           list.push(model);
                       });
                    }
                });
                this.list = list;
            }
            return this.list;
        },
        /**
         * get selected parameter in size modifier
         * null - size modifiers is unselected
         * undefined - size modifiers is not defined for current product
         */
        getSizeModel: function() {
            var block = this.where({admin_modifier: true, admin_mod_key: 'SIZE'});
            if (block.length !== 0) {
                var modifier = block[0].get('modifiers').where({selected: true});
                if (modifier.length !== 0) {
                    return modifier[0];
                } else {
                    return null;
                }
            } else {
                return undefined;
            }
        },
        get_special: function() {
            var special = [];
            var specialBlock = this.where({ 'admin_mod_key': 'SPECIAL' });
            if (specialBlock && specialBlock.length > 0) {
        		special = specialBlock[0].get('modifiers').where({selected: true});
            }
            return special;
        },
        /**
         * get concatenated special
         */
        get_special_text: function() {
            return this.get_special().map(function(model) { return model.get('name'); }).join(",");
        },
        /**
         *
         * return array with not selected force modifiers
         */
        checkForced: function() {
            var unselected = this.where({forced: true}).filter(function(modifierBlock) {
                var selected = modifierBlock.get('modifiers').where({selected: true});
                return selected.length > 0 ? false : true;
            });

            return unselected.length > 0 ? unselected : true;
        },
        /**
         * check modifiers before repeat order
         */
        check_repeat: function() {
            var changes;

            // set actual data for modifiers
            this.each(function(item) {
                if (item.check_repeat() === 'changed') {
                    changes = 'changed';
                }
            });

            return changes;
        },
        /**
         * unselect all special modifiers
         */
        uncheck_special: function(special_text) {
            var special = this.get_special();
            if (special[0] && special[0].get('name') !== special_text) {
                special.map(function(model) { model.set({ selected: false}, { silent: true }); });
            }
        },
        /**
         * get modifiers sum
         */
        get_sum: function() {
            var sum = 0;
            this.each(function(modifierBlock) {
                sum += modifierBlock.get_sum();
            });

            return sum;
        },
        /**
         * combine information for submit order
         */
        modifiers_submit: function() {
            var modifiers = [];
            this.each(function(modifierBlock) {
                modifiers = modifiers.concat(modifierBlock.modifiers_submit());
            });
            return modifiers;
        }
    });

    App.Collections.ModifierBlocks.init = function(id_product) {
        var modifier_load = $.Deferred();

        if (App.Data.modifiers[id_product] === undefined ) {
            App.Data.modifiers[id_product] = new App.Collections.ModifierBlocks;
            modifier_load = App.Data.modifiers[id_product].get_modifiers(id_product);
        } else {
            modifier_load.resolve();
        }

        return modifier_load;
    };
});
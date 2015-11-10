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

define(["myorder_view"], function(myorder_view) {
    'use strict';

    var CoreViews = App.Views.CoreMyOrderView;

    var DynamicHeightHelper_Modifiers = DynamicHeightHelper(CoreViews.CoreMyOrderMatrixView.prototype);

    var MyOrderMatrixView = _MyOrderMatrixView( CoreViews.CoreMyOrderMatrixView.prototype )
                                                    .mixed( DynamicHeightHelper_Modifiers );   
    function _MyOrderMatrixView(_base){ return Backbone.inherit(_base, {                                                      
        initialize: function() {
            _base.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.attributes_update);
        },
        render: function() {
            _base.render.apply(this, arguments);
            this.renderProductFooter();
            this.dh_initialize();
            return this;
        },
        attributes_update: function() {
            this.model.trigger("change_child_selected");
        }
      })
    };

    function DynamicHeightHelper(_base_proto) {
      return {
        dh_initialize: function() {
            $('#popup').addClass('ui-invisible');
            setTimeout(this.dh_change_height.bind(this, 1), 20);
            this.interval = this.interval || setInterval(this.dh_change_height.bind(this), 500); // check size every 0.5 sec
            this.$('.modifiers_table_scroll').contentarrow();
        },
        events: {
            'change_height .product_instructions': 'dh_change_height' // if special request button pressed
        },
        dh_change_height: function(e) {
            var prev_height = this.prev_height || 0,
                inner_height = $('#popup').outerHeight(),
                prev_window = this.prev_window || 0,
                window_heigth = $(window).height();

            if (e || prev_height !== inner_height || prev_window !== window_heigth) {
                var el = this.$('.modifiers_table_scroll'),
                    wrapper_height,

                    product = this.$('.product_info').outerHeight(),
                    special = this.$('.instruction_block').outerHeight(),
                    size = this.$('.quantity_info').outerHeight();

                el.height('auto');
                inner_height = $('#popup').outerHeight();
                wrapper_height = $('.popup_wrapper').height();

                if (wrapper_height < inner_height) {
                        var height = wrapper_height - product - special - size - 117;
                    el.height(height);
                }

                inner_height = $('#popup').outerHeight();
                this.prev_height = inner_height;
                this.prev_window = window_heigth;
                $('#popup').removeClass('ui-invisible');
            }
        },
        remove: function() {
            this.$('.modifiers_table_scroll').contentarrow('destroy');
            clearInterval(this.interval);
            _base_proto.remove.apply(this, arguments);
        }
      }
    }

    var DynamicHeightHelper_Combo = DynamicHeightHelper(CoreViews.CoreMyOrderMatrixComboView.prototype);

    var MyOrderMatrixComboView = _MyOrderMatrixComboView( CoreViews.CoreMyOrderMatrixComboView.prototype )
                                                         .mixed( DynamicHeightHelper_Combo );
    function _MyOrderMatrixComboView(_base){ return Backbone.inherit(_base, {
        render: function() {
            _base.render.apply(this, arguments);
            this.renderProductFooter();
            this.dh_initialize();
            return this;
        }        
      })
    };

  //TBD: review this: -----------------------------------------------
 /*   Backbone.inherit = function(base_class, new_proto) {
        var new_class =  base_class.extend(new_proto);
        new_class.prototype.events =  _.extend({}, base_class.prototype.events, new_proto.events);
        new_class.prototype.bindings =  _.extend({}, base_class.prototype.bindings, new_proto.bindings);
        new_class.prototype.computeds =  _.extend({}, base_class.prototype.computeds, new_proto.computeds);
        return new_class;
    }
   // use case #1: ---
    var Test_BaseView = (function(_base){ return Backbone.inherit(_base, {
            render: function() {
                trace("Test_BaseView render >");
                _base.prototype.render.apply(this, arguments);
            },
            events: {
                "change .test_1":  "some_1"
            }
        });
    })(Backbone.View);

    // use case #2: ---
    var Test_View2 = _Test_View2( Test_BaseView );
    function _Test_View2(_base){ return Backbone.inherit(_base, {
            render: function() {
                trace("Test_View2 render >");
                _base.prototype.render.apply(this, arguments);
            },
            events: {
                "change .test_2":  "some_2"
            }
        });
    };

    var Test_View3 = _Test_View3( Test_View2 );
    function _Test_View3(_base){ return Backbone.inherit(_base, {
            render: function() {
                trace("Test_View3 render >");
                _base.prototype.render.apply(this, arguments);
            },
            events: {
                "change .test_3":  "some_3"
            }
        });
    };
*/
    //var t = new Test_View3;
    // t.render()
    // t.events
    // -----------------------------------------------------
Object.deepExtend = function(destination, source) {
    trace("deepExtend =>");
  for (var property in source) {
    if (typeof source[property] === "object" &&
     source[property] !== null ) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
      trace("recursion property=", property);
    } else {
      destination[property] = source[property];
      trace("assigning property=", property);
    }
  }
  return destination;
};

/*    Backbone.Model.prototype.mixed = Backbone.View.prototype.mixed =
    function(extend_proto) {
      extend_proto = extend_proto || {};
      for (var i in extend_proto) {
        // Assimilate non-constructor Epoxy prototype properties onto extended object:
        trace("MIXED, prop", i);
        if (extend_proto[i].hasOwnProperty(i) && i !== 'constructor') {
           Object.deepExtend(this.prototype[i], extend_proto[i]);
        }
      }
      return this;
    }
    */

// ---------- THE BEST -----------------------------------

 /*   Backbone.inherit = function(base_proto, new_proto) {
        var new_class =  base_proto.constructor.extend(new_proto);
        new_proto.events && (new_class.prototype.events =  _.extend({}, base_proto.events, new_proto.events));
        new_proto.bindings && (new_class.prototype.bindings =  _.extend({}, base_proto.bindings, new_proto.bindings));
        new_proto.computeds && (new_class.prototype.computeds =  _.extend({}, base_proto.computeds, new_proto.computeds));
        new_class.mixed = new_class.prototype.mixed;
        return new_class;
    }
    */

    /*Backbone.Model.prototype.mixed = Backbone.View.prototype.mixed =
    function(extend_proto) {
      extend_proto = extend_proto || {};
      for (var i in extend_proto) {      
        if (i === 'events' || i === 'bindings' || i === 'computeds') {
            this.prototype[i] = _.extend({}, this.prototype[i], extend_proto[i]);
            continue;
        }
        trace("prop = ", i);    
        if (extend_proto.hasOwnProperty(i) && i !== 'constructor') {
           this.prototype[i] = extend_proto[i];
           trace("assignin:", i,  this.prototype[i]);    
        }
      }
      return this;
    }*/

/*  var mixins = {
    mixin: function(extend) {
      extend = extend || {};
//don't used it as here
      for (var i in this.prototype) {
        // Skip override on pre-defined binding declarations:
        if (i === 'bindings' && extend.bindings) continue;
        
        // Assimilate non-constructor Epoxy prototype properties onto extended object:
        if (this.prototype.hasOwnProperty(i) && i !== 'constructor') {
          extend[i] = this.prototype[i];
        }
      }
      return extend;
    },
    mixed:  function(extend_proto) {
      extend_proto = extend_proto || {};
      for (var i in extend_proto) {      
        if (i === 'events' || i === 'bindings' || i === 'computeds') {
            this.prototype[i] = _.extend({}, extend_proto[i], this.prototype[i]);
            continue;
        }

        trace("prop = ", i);    
        if (extend_proto.hasOwnProperty(i) && i !== 'constructor' && !this.prototype[i]) {
           this.prototype[i] = extend_proto[i];
           trace("assignin:", i,  this.prototype[i]);
        }
      }
      return this;
    }
  };
  */

  //  Backbone.Model.prototype.mixed = Backbone.View.prototype.mixed = mixins.mixed;

    var mixAPI = {
            A: function() {
                return 'mixAPI' + this.callback_test();
            },
            B: function() {
                return mixAPI.A.apply(this, arguments);
            },
            events: {
                "change .mix_2":  "some_2",
                "change .same":  "B"  
            }
        };

    var TestMix = _TestMix( Backbone.Epoxy.View.prototype )
                            .mixed( mixAPI );

    function _TestMix(_base){ return Backbone.inherit(_base, {
        A: function() {
            return mixAPI.A.apply(this) + "_+_some_else";
        },
        events: {
            "change .mix_1":  "some_1",
            "change .same":  "stop_this_event_processing"  
        },
        callback_test: function() {
            return "_+_callback"
        }
      })
    }

   
// ------------------------------------------------------------------------------------------------
    //-- mixin case: -----------
   /*     var mixModel = Backbone.Epoxy.Model.extend({
            BB: function() {
                return 5;
            },
            events: {
                "change .mix_22":  "some_22" 
            }
        });

      var TestMix3 = mixModel.mixin(TestMix);

    var TestMix2 = (function(_base) { return Backbone.inherit(_base, {
        A: function() {
            return 5;
        },
        events: {
            "change .mix_1":  "some_1" 
        }

      })
    })(TestMix.prototype)
      .mixed(mixModel.prototype);

    var TestMix2 = Backbone.inherit(TestMix.prototype, {
        A: function() {
            return 5;
        },
        events: {
            "change .mix_1":  "some_1" 
        }

      }).mixed(mixModel.prototype);

*/
 
    var MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        editItem: function(e) {
            e.preventDefault();
            var model = this.model,
                isStanfordItem = App.Data.is_stanford_mode && this.model.get_product().get('is_gift');

           /* App.Data.mainModel.set('popup', {
                modelName: 'MyOrder',
                mod: isStanfordItem ? 'StanfordItem' : 'Matrix',
                className: isStanfordItem ? 'stanford-reload-item' : '',
                model: model.clone(),
                real: model,
                action: 'update'
            });*/

            var is_combo = model.get('product').get('is_combo');

            var cache_id = is_combo ? model.get("id_product") : undefined;

            App.Data.mainModel.set('popup', {
                modelName: 'MyOrder',
                mod: isStanfordItem ? 'StanfordItem' : (is_combo ? 'MatrixCombo' : 'Matrix'),
                className: isStanfordItem ? 'stanford-reload-item' : '',
                model: model.clone(),
                real: model,
                action: 'update',
                init_cache_session: is_combo ? true : false,
                cache_id: is_combo ? cache_id : undefined //cache is enabled for combo products during the phase of product customization only
                                                          //the view will be removed from cache after the product is added/updated into the cart.
            });
        }
    });

    var MyOrderItemSpecialView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'itemSpecial',
        render: function() {
            var model = {
                name: this.model.get_product().get('name'),
                special: this.model.get_special()
            };
            this.$el.html(this.template(model));
        }
    });

    return new (require('factory'))(myorder_view.initViews.bind(myorder_view), function() {
        App.Views.MyOrderView.MyOrderMatrixView = MyOrderMatrixView;
        App.Views.MyOrderView.MyOrderMatrixComboView = MyOrderMatrixComboView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
        App.Views.MyOrderView.MyOrderItemSpecialView = MyOrderItemSpecialView;
        //App.Views.Test_BaseView = Test_BaseView;
        //App.Views.Test_View2 = Test_View2;
    });
});

define(["backbone", "checkout_view", "generator"], function(Backbone) {
    'use strict';

    App.Views.CheckoutView.CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        controlAddress: function(model, value) {
            var arrAdd= this.$('.arrival_address');
            App.Views.CoreCheckoutView.CoreCheckoutMainView.prototype.controlAddress.apply(this, arguments);
            if(value === 'DINING_OPTION_DELIVERY') {
                arrAdd.hide();
            } else {
                arrAdd.show();
            }
        }
    });

    App.Views.CheckoutView.CheckoutPayView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'pay',
        initialize: function() {
            this.listenTo(this.collection, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(this.collection, "paymentFailed", function(message) {
                this.collection.trigger('hideSpinner');
            }, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            var payment = App.Data.settings.get_payment_process(),
                isDelivery = this.collection.checkout.get("dining_option") == 'DINING_OPTION_DELIVERY';

            payment.cashBtnText = isDelivery ? MSG.PAY_AT_DELIVERY : MSG.PAY_AT_STORE;
            this.$el.html(this.template(payment));
            return this;
        },
        events: {
            'click .credit-card': 'credit_card',
            'click .paypal': function() {
                this.pay(3);
        },
            'click .cash': function(){
                this.pay(4);
            }
        },
        credit_card: function() {
            $('#popup .cancel').trigger('click');
            App.Data.mainModel.set('popup', {
                modelName: 'Confirm',
                mod: 'PayCard',
                collection: this.collection,
                className: 'confirmPayCard',
                timetable: this.options.timetable,
                card: this.options.card
            });
            //remove the background from popup
            $('#popup').removeClass("popup-background");
        },
        pay: function(payment_type) {
            saveAllData();

            this.collection.pay_order_and_create_order_backend(payment_type);
            !this.canceled && this.collection.trigger('showSpinner');
            $('#popup .cancel').trigger('click');
        }
    });

    App.Views.CheckoutView.CheckoutPageView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'page',
        initialize: function() {
            if(this.options.specialRequests) {
                this.listenTo(this.collection, 'add', this.addSpecial, this);
                this.listenTo(this.collection, 'remove', this.removeSpecial, this);
            }
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'input click': 'inputClick'
        },
        render: function() {
            var data = {specialRequests: this.options.specialRequests};
            this.$el.html(this.template(data));

            if(this.options.specialRequests)
                this.collection.each(this.addSpecial.bind(this));

            var order_type = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                collection: this.collection,
                DINING_OPTION_NAME: this.options.DINING_OPTION_NAME,
                mod: 'OrderType',
                className: 'row'
            }), pickup = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                timetable: this.options.timetable,
                mod: 'Pickup'
            }), main = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                customer: this.options.customer,
                mod: 'Main'
            }), specials = this.$('.specials'),
                tips;

            this.subViews.push(order_type, pickup, main);
            specials.before(order_type.el);
            specials.before(pickup.el);
            specials.before(main.el);

            if(this.options.acceptTips) {
                tips = App.Views.GeneratorView.create('Tips', {
                    model: this.collection.total.get('tip'),
                    mod: 'Main',
                    className: 'row tipBlock'
                });
                this.subViews.push(tips);
                specials.before(tips.el);
                tips.$el.on('touchstart', 'input', this.inputClick.bind(this));
            }

            this.$('.data').contentarrow();
            main.$el.on('touchstart', 'input', this.inputClick.bind(this));
            return this;
        },
        remove: function() {
            this.$('.data').contentarrow('destroy');
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        addSpecial: function(model) {
            if(!model.get_special())
                return;
            var view = App.Views.GeneratorView.create('MyOrder', {
                model: model,
                mod: 'ItemSpecial'
            });
            this.$('.special > div').append(view.el);
            this.subViews.push(view);
        },
        removeSpecial: function(model) {
            this.subViews.some(function(view) {
                if(view.model === model) {
                    view.remove();
                    return true;
                }
            });
        },
        inputClick: function(event) {
            var self = this,
                cont = this.$('.data');
            cont.on('onScroll', restoreFocus);
            function restoreFocus() {
                $(event.target).focus();
                cont.off('onScroll', restoreFocus);
        }
        }
    });
});

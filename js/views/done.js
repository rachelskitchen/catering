define(["backbone", "factory"], function(Backbone) {

    App.Views.CoreMainView = {};

    App.Views.CoreMainView.CoreMainDoneView = App.Views.FactoryView.extend({
        name: 'main',
        mod: 'done',
        render: function() {
            var get = App.Data.myorder.paymentResponse,
                checkout =  App.Data.myorder.checkout,
                dining_option = checkout.get('dining_option');

            var model = this.model.toJSON();
            model.logo = App.Data.header.get('logo');
            model.business_name = App.Data.header.get('business_name');
            model.isOnlyGift = dining_option === 'DINING_OPTION_ONLINE';            

            if (get.status === "OK") {
                this.model.success = true;
                App.Data.myorder.order_id = get.orderId;
                
                if (dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_DELIVERY_SEAT') 
                    model.pickup_type = 'Delivery Time';
                else
                    model.pickup_type = 'Pickup Time';
                
                model.order_id = get.orderId;
                model.total = round_monetary_currency(get.total); // order total
                model.pickup_time_date = checkout.get('pickupTime'); // order time
                
                var time_array = checkout.get('pickupTime').split(',');
                model.pickup_time = time_array[0] + ', ';
                model.pickup_day = time_array.slice(1).join(', ');

                model.email = App.Data.customer.get('email');
                model.status = 'success';
                
                model.reward_points = get.reward_points || '';
                model.symbol = App.Data.settings.get('settings_system').currency_symbol;
                
                model.isOrderFromSeat = App.Data.orderFromSeat instanceof Object;
                model.isDeliverToSeat = checkout.get("dining_option") === 'DINING_OPTION_DELIVERY_SEAT';
                model.level = checkout.get("level");
                model.section = checkout.get("section");
                model.row = checkout.get("row");
                model.seat = checkout.get("seat");
            } else {
                var error = get.errorMsg.replace(/\+/g, ' ').replace(/%\d+/g, '');
                this.model.success = false;
                model = $.extend(model, {
                    status: 'error',
                    /* message : 'Payment failed - try to repeat',*/
                    message: error                    
                });
            }
            this.$el.html(this.template(model));
            
            this.listenToOnce(App.Data.mainModel, 'loadCompleted', function() {
                loadSpinner(this.$('img.logo'));
            }, this);
            return this;
        },
        events: {
            "click .btnReturn": 'return_menu'
        },
        return_menu: function() {
            if (this.model.success) {
                App.Data.myorder.empty_myorder();
                App.Data.card && App.Data.card.empty_card_number();
                this.model.trigger('onMenu');
            } else {
                this.model.trigger('onCheckout');
            }
        }
    });

    App.Views.MainView.MainDoneView = App.Views.CoreMainView.CoreMainDoneView;
});
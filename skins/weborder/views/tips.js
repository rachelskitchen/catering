define(['tips_view'], function() {
    'use strict';

    App.Views.TipsView.TipsMainView = App.Views.CoreTipsView.CoreTipsMainView.extend({
        render: function() {
            this.model.set('iPad', /ipad/i.test(window.navigator.userAgent));
            return App.Views.CoreTipsView.CoreTipsMainView.prototype.render.apply(this, arguments);
        },
        setType: function(e) {
            App.Views.CoreTipsView.CoreTipsMainView.prototype.setType.apply(this, arguments);
            this.$('.input_beauty').addClass('disabled');
        },
        setAmount: function(e) {
            var input = this.$('.input_beauty');
            App.Views.CoreTipsView.CoreTipsMainView.prototype.setAmount.apply(this, arguments);
            if(isNaN(parseInt($(e.target).attr('data-amount'), 10)) && this.model.get('type'))
                input.removeClass('disabled');
            else
                input.addClass('disabled');
        }
    });
});
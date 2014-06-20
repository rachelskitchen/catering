define(["backbone", "factory", "store_info_view"], function(Backbone) {
    'use strict';

    var logoNode, ih;

    App.Views.LogoView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        initialize: function() {
            this.resize = logoResize.bind(this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var self = this,
                cont = self.$('.store_info_main_logo');

            if(logoNode) {
                this.$('.store_info_main_logo').remove();
                this.$el.prepend(logoNode);
                $(window).on('resize', self.resize);
            } else {
                loadSpinner(this.$('img#logo'), false, function() {
                    self.resize();
                    $(window).on('resize', self.resize);
                });
            }

            return this;
        },
        remove: function() {
            $(window).off('resize', this.resize);
            return App.Views.FactoryView.prototype.remove.apply(this, arguments);
        }
    });

    function logoResize() {
        var logoCont = this.$('.store_info_main_logo'),
            cont = this.$('.logo'),
            $logo = this.$('#logo'),
            logo = $logo.get(0),
            cw = cont.width(),
            ch = cont.height();

        ih = ih ? ih : logo.height;
        logo.style.cssText = '';
        $logo.height(ih);

        if(ih >= ch) {
            logo.style.cssText = '';
            $logo.height(ch);
        }

        if($logo.width() > cw) {
            logo.style.cssText = '';
            $logo.width(cw);
        }

        logoCont.css('height', $logo.height() + this.$('.divider').height() + 'px');
        $logo.is(':hidden') && $logo.show();

        logoNode = logoCont.get(0);
    }
});
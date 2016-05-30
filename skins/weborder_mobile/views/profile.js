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

define(["profile_view", "giftcard_view"], function(profile_view) {
    'use strict';

    var ProfilePaymentSelectionView = App.Views.CoreProfileView.CoreProfilePaymentSelectionView.extend({
        className: 'payment-item font-size3 primary-bg primary-text'
    });

    var ProfilePaymentsSelectionView = App.Views.CoreProfileView.CoreProfilePaymentsSelectionView.extend({
        bindings: {
            ':el': 'toggle: equal(selected, "credit_card_button")'
        },
        itemView: ProfilePaymentSelectionView
    });

    var ProfilePaymentEditionView = App.Views.CoreProfileView.CoreProfilePaymentEditionView.extend({
        className: 'payment-item font-size3 primary-text list-subheader'
    });

    var ProfilePaymentsEditionView = App.Views.CoreProfileView.CoreProfilePaymentsEditionView.extend({
        bindings: {
            '.credit-cards': 'classes: {collapsed: ui_collapsed}',
            '.payments-list': 'toggle: not(ui_collapsed), collection: $collection'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({collapsed: true});
            }
        },
        itemView: ProfilePaymentEditionView,
        events: {
            'click .credit-cards': 'collapse'
        },
        collapse: function() {
            var $ui = this.getBinding('$ui');
            $ui.set('collapsed', !$ui.get('collapsed'));
        }
    });

    var ProfilePaymentsView = App.Views.CoreProfileView.CoreProfilePaymentsView.extend({
        bindings: {
            '.left-side': '', //to disable base class bindings
            '.right-side': '',
            '.successful-update': ''
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            if (this.model.payments) {
                var paymentsEdition = App.Views.GeneratorView.create('Profile', {
                    el: this.$('.payments-box'),
                    mod: 'PaymentsEdition',
                    collection: this.model.payments,
                    removeToken: this.options.removeToken,
                    changeToken: this.options.changeToken,
                    className: 'profile-payments-edition text-center',
                });
                this.subViews.push(paymentsEdition);
            }

            if (this.model.giftCards) {
                this.newGiftCard = new App.Models.GiftCard({add_new_card: false});
                var giftCardsEdition = App.Views.GeneratorView.create('Profile', {
                    el: this.$('.gift-cards-box'),
                    mod: 'GiftCardsEdition',
                    collection: this.model.giftCards,
                    unlinkGiftCard: this.options.unlinkGiftCard,
                    newCard: this.newGiftCard,
                    customer: this.options.model,
                    className: 'profile-payments-edition text-center',
                });
                this.subViews.push(giftCardsEdition);
            }

            if (this.model.get('rewardCards')) {
                this.newRewardCard = new App.Models.RewardsCard({add_new_card: false});
                var rewardCardsEdition = App.Views.GeneratorView.create('Profile', {
                    el: this.$('.reward-cards-box'),
                    mod: 'RewardCardsEdition',
                    collection: this.model.rewardCards,
                    newCard: this.newRewardCard,
                    unlinkRewardCard: this.options.unlinkRewardCard,
                    customer: this.options.model,
                    className: 'profile-payments-edition text-center'
                });
                this.subViews.push(rewardCardsEdition);
            }
            return this;
        },
    });

    var ProfileGiftCardSelectionView = App.Views.CoreProfileView.CoreProfileGiftCardSelectionView.extend({
        className: 'payment-item font-size3 primary-bg primary-text'
    });

    var ProfileGiftCardsSelectionView = App.Views.CoreProfileView.CoreProfileGiftCardsSelectionView.extend({
        bindings: {
            ':el': 'toggle: equal(selected, "gift_card")'
        },
        itemView: ProfileGiftCardSelectionView
    });

    var ProfileGiftCardEditionView = App.Views.CoreProfileView.CoreProfileGiftCardEditionView.extend({
        className: 'payment-item font-size3 primary-text list-subheader'
    });

    var ProfileGiftCardsEditionView = App.Views.CoreProfileView.CoreProfileGiftCardsEditionView.extend({
        bindings: {
            '.gift-cards': 'classes: {collapsed: ui_collapsed}',
            '.gift-cards-list': 'collection: $collection',
            '.gift-cards-list-wrap': 'toggle: not(ui_collapsed)'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({collapsed: true});
            }
        },
        itemView: ProfileGiftCardEditionView,
        events: {
            'click .gift-cards': 'collapse'
        },
        collapse: function() {
            var $ui = this.getBinding('$ui');
            $ui.set('collapsed', !$ui.get('collapsed'));
        }
    });

    // Profile Views for Reward Cards:
    var ProfileRewardCardSelectionView = App.Views.CoreProfileView.CoreProfileRewardCardSelectionView.extend({
        className: 'payment-item font-size3 primary-bg primary-text'
    });

    var ProfileRewardCardsSelectionView = App.Views.CoreProfileView.CoreProfileRewardCardsSelectionView.extend({
        itemView: ProfileRewardCardSelectionView
    });

    var ProfileRewardCardEditionView = App.Views.CoreProfileView.CoreProfileRewardCardEditionView.extend({
        className: 'payment-item font-size3 primary-text list-subheader'
    });

    var ProfileRewardCardsEditionView = App.Views.CoreProfileView.CoreProfileRewardCardsEditionView.extend({
        bindings: {
            '.reward-cards': 'classes: {collapsed: ui_collapsed}',
            '.reward-cards-list': 'collection: $collection',
            '.reward-cards-list-wrap': 'toggle: not(ui_collapsed)'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({collapsed: true});
            }
        },
        itemView: ProfileRewardCardEditionView,
        events: {
            'click .reward-cards': 'collapse'
        },
        collapse: function() {
            var $ui = this.getBinding('$ui');
            $ui.set('collapsed', !$ui.get('collapsed'));
        }
    });

    var ProfileAddressView = App.Views.CoreProfileView.CoreProfileAddressView.extend({
        bindings: {
            '.address__header': 'classes: {collapsed: ui_collapsed}',
        },
        removeAddress: function() {
            var self = this;

            App.Data.errors.alert(
                _loc.PROFILE_ADDRESS_DELETE,
                false,
                true,
                {
                    isConfirm: true,
                    callback: function(confirmed) {
                        if (confirmed) {
                            self.model.collection.remove(self.model);
                            App.Data.customer.deleteAddress(self.model);
                        }
                    }
                });
        },
    });

    var ProfileAddressesView = App.Views.CoreProfileView.CoreProfileAddressesView.extend({
        itemView: ProfileAddressView,
    });

    return new (require('factory'))(profile_view.initViews.bind(profile_view), function() {
        App.Views.ProfileView.ProfilePaymentsSelectionView = ProfilePaymentsSelectionView;
        App.Views.ProfileView.ProfilePaymentsEditionView = ProfilePaymentsEditionView;
        App.Views.ProfileView.ProfileGiftCardsSelectionView = ProfileGiftCardsSelectionView;
        App.Views.ProfileView.ProfileGiftCardsEditionView = ProfileGiftCardsEditionView;
        App.Views.ProfileView.ProfileRewardCardSelectionView = ProfileRewardCardSelectionView;
        App.Views.ProfileView.ProfileRewardCardsSelectionView = ProfileRewardCardsSelectionView;
        App.Views.ProfileView.ProfileRewardCardsEditionView = ProfileRewardCardsEditionView;
        App.Views.ProfileView.ProfileAddressView = ProfileAddressView;
        App.Views.ProfileView.ProfileAddressesView = ProfileAddressesView;
    });
});
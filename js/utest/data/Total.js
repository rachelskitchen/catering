define([], function() {
    return {
        "DEFAULTS": {
            subtotal: 0,
            tax: 0,
            surcharge: 0,
            tip: null,
            delivery: null,
            bag_charge: 0,
            discounts: 0,
            tax_country: '',
            prevailing_surcharge: 0,
            prevailing_tax: 0,
            shipping: 0,
            shipping_discount: 0
        },
        "SYSTEM_SETTINGS": {
            auto_bag_charge: 5,
            tax_country: 'US',
            prevailing_surcharge: 4,
            prevailing_tax: 9
        }
    };
});
define(['tax'], function() {
    
    describe('App.TaxCodes', function() {

        it('Environment', function() {
            expect(App.TaxCodes).toBeDefined();
        });

        it('is_tax_included au, uk, other', function() {            
            expect(App.TaxCodes.is_tax_included('au')).toBe(true);
            
            expect(App.TaxCodes.is_tax_included('uk')).toBe(true);
            
            expect(App.TaxCodes.is_tax_included('other_tax_included')).toBe(true);
        });

        it('is_tax_included usa, ca, ca_on', function() {
            expect(App.TaxCodes.is_tax_included('usa')).toBe(false);
            
            expect(App.TaxCodes.is_tax_included('ca')).toBe(false);
            
            expect(App.TaxCodes.is_tax_included('ca_on')).toBe(false);
        });

        it('is_tax_included empty', function() {
            expect(App.TaxCodes.is_tax_included('')).toBe(false);
            expect(App.TaxCodes.is_tax_included()).toBe(false);
        });

        it('is_tax_included incorrect', function() {
            expect(App.TaxCodes.is_tax_included('incorrect')).toBe(false);
        });
    });
});
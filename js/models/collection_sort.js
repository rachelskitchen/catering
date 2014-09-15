define(["backbone"], function(Backbone) {
    'use strict';

App.Collections.CollectionSort = Backbone.Collection.extend({
        sortStrategy: "sortStrings",
        sortKey: "name",
        sortOrder: "asc", //or "desc"
        strategies: {
            sortStrings: function (a, b) {
                a = a.get(this.sortKey);
                b = b.get(this.sortKey);
                a = a.toLowerCase && a.toLowerCase() || null; // if isn't string, that can not compare
                b = b.toLowerCase && b.toLowerCase() || null;

                return this.strategies.sort.call(this,a,b);
            },
            sortNumbers: function(a, b) {
                a = a.get(this.sortKey) * 1;
                b = b.get(this.sortKey) * 1;
                a = isNaN(a) ? null : a; // if not a number, that can not compare
                b = isNaN(b) ? null : b;

                return this.strategies.sort.call(this,a,b);
            },
            sort: function(a,b) {
                var asc = this.sortOrderEx;
                if (a == null && b == null) return 0; // undefined or null
                if (a == null) return 1 * asc;
                if (b == null) return -1 * asc;
                return (asc === -1 && a < b || asc === 1 && a > b) * 2 - 1; // true/false change to 1/-1.
            }                
        },
        /**
         * Set sort parameters and sort
         * 
         * @param {String} strategy sortNumbers or sortStrings
         * @param {String} modelKey Store model attribute
         * @returns {undefined}
         */
        sortEx: function(strategy, modelKey) {
            this.sortStrategy = this.strategies[strategy] && strategy || this.sortStrategy; // return last expression. so need return strategy, not this.strategies[strategy]
            this.sortKey = this.model.prototype.defaults[modelKey] !== undefined && modelKey || this.sortKey;
            this.sortOrderEx = (this.sortOrder == "asc") * 2 - 1; // true/false change to 1/-1.
            //var t1 = (new Date).getTime();
            var collection = this.models.sort(this.strategies[this.sortStrategy].bind(this));
            //var t2 = (new Date).getTime();
            //trace("profile sorting: delta=", t2 - t1);
            return collection; 
        }
    });
});
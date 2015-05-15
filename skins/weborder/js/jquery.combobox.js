/**
 * @requires jQuery 1.9+
 *
 * @class combobox
 * @memberOf jQuery.fn
 *
 * @example
 *
 * var combobox = $("select").combobox();
 * combobox.addOption("I am dynamically added");
 */

(function($) {

    $.fn.combobox = function(min, max) {
        var instanceVar;
        min = min || 1;
        max = max || 999;

        this.each(function() {
            var originalSelect = $(this);

            //check if element is a select
            if (originalSelect[0].tagName.toUpperCase() === "SELECT") {

                //wrap the original select
                originalSelect.wrap($("<div/>"));
                var combobox = originalSelect.parent();
                combobox.addClass("combobox");

                //place an input which will represent the inputbox
                var inputbox = $("<input/>").attr({
                    "min": min,
                    "max": max,
                    "type": "number",
                    "maxlength": 3
                }).insertBefore(originalSelect);

                //get and remove the original id
                var objID = originalSelect.attr("id");
                originalSelect.removeAttr("id");

                //add the attributes from the original select
                inputbox.attr({
                    alt: originalSelect.attr("alt"),
                    title: originalSelect.attr("title"),
                    class: originalSelect.attr("class"),
                    name: originalSelect.attr("name"),
                    disabled: originalSelect.attr("disabled"),
                    tabindex: originalSelect.attr("tabindex"),
                    id: objID
                });

                //get the properties from the select
                inputbox.addClass("inputbox");
                inputbox.val(originalSelect.val());

                //add the triangle at the right
                var triangle = $("<div/>").addClass("triangle").insertAfter(inputbox);

                //create the selectbox that will appear when the input gets focus
                var selectbox = $("<ol/>").addClass("selectbox").insertAfter(triangle);

                //add options
                originalSelect.children().each(function(index, value) {
                    prepareOption($(value).text(), combobox);
                });

                //bind the focus handler
                inputbox.focus(function() {
                    setTimeout(function() {
                        selectbox.fadeIn(100);
                    }, 100);
                }).blur(function() {
                    setTimeout(function() {
                        selectbox.fadeOut(100);
                    }, 100);
                }).keyup(function(e) {
                    if (e.which == 13) {
                        inputbox.trigger("blur");
                    }
                }).change(function() {
                    if (!inputbox.val()) {
                        inputbox.val(min);
                    }
                });

                inputbox.on('input', function(a) {
                    if (!this.validity.valid) {
                        a.target.value = max;
                    }
                });

                //hide original element
                originalSelect.css({
                    visibility: "hidden",
                    display: "none"
                });

                //save this instance to return it
                instanceVar = inputbox
            } else {
                //not a select
                return false;
            }
        }); //-end each

        /** public methods **/

        /**
         * Adds an option to the combobox
         * @param {String} value - the options value
         * @returns {void}
         */
        instanceVar.addOption = function(value) {
            prepareOption(value, instanceVar.parent());
        };

        /**
         * Removes a specific option from the selectbox
         * @param {String, Number} value - the value or the index to delete
         * @returns {void}
         */
        instanceVar.removeOption = function(value) {
            switch (typeof(value)) {
                case "number":
                    instanceVar.parent().children("ol").children(":nth(" + value + ")").remove();
                    break;
                case "string":
                    instanceVar.parent().children("ol").children().each(function(index, optionValue) {
                        if ($(optionValue).text() == value) {
                            $(optionValue).remove();
                        }
                    });
                    break;
            }
        };

        /**
         * Resets the select to it's original
         * @returns {void}
         */
        instanceVar.restoreSelect = function() {
            var originalSelect = instanceVar.parent().children("select");
            var objID = instanceVar.attr("id");
            instanceVar.parent().before(originalSelect);
            instanceVar.parent().remove();
            originalSelect.css({
                visibility: "visible",
                display: "inline-block"
            });
            originalSelect.attr({
                id: objID
            });
        };

        instanceVar.destroy = function() {
            var originalSelect = instanceVar.parent().children("select");
            instanceVar.parent().before(originalSelect);
            instanceVar.parent().remove();
        };

        return instanceVar;
    };

    /** private methods **/

    function prepareOption(value, combobox) {
        var selectOption = $("<li>" + value + "</li>").appendTo(combobox.children("ol"));
        var inputbox = combobox.children("input");

        //bind click on this option
        selectOption.click(function() {
            inputbox.val(selectOption.text());
            inputbox.trigger("change");
        });
    }

}(jQuery));

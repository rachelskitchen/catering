(function($) {
    'use strict';

    $.fn.contentarrow = function(opts) {
        this.each(function(i) {
            var parent = $(this),
                prevHeight = parent.height(),
                showInterval;


            if (opts === 'destroy') {
                return destroy();
            }

            if (parent.data('contentarrow')) {
                destroy();
            } else {
                parent.data('contentarrow', true);
            }

            var prevTemplate = "<div class='content_arrow arrow_top'><span class='scrollArrow top'></span></div>",
                nextTemplate = "<div class='content_arrow arrow_bottom'><span class='scrollArrow'></span></div>";

            parent.before(prevTemplate);
            parent.after(nextTemplate);

            var prev = parent.prev(),
                next = parent.next();

            showInterval = setInterval(function() {
                if (check_bottom()) {
                    prev.fadeIn(200);
                } else {
                    prev.click(); // fix for bug 10295 (it removes :hover state of show element)
                    prev.fadeOut(200);
                }
                if (check_top()) {
                    next.fadeIn(200);
                } else {
                    next.click(); // fix for bug 10295 (it removes :hover state of show element)
                    next.fadeOut(200);
                }
                updateScrollTop();
            }, 200);

            var downInterval,
                upInterval;

            prev.on('touchstart mousedown', scroll_top_down);
            prev.on('touchend mouseup', scroll_top_up);
            next.on('touchstart mousedown', scroll_bottom_down);
            next.on('touchend mouseup', scroll_bottom_up);

            function destroy() {
                clearInterval(showInterval);

                var prev = parent.prev(),
                    next = parent.next();

                if (prev.hasClass('content_arrow')) {
                    prev.remove();
                }

                if (next.hasClass('content_arrow')) {
                    next.remove();
                }
            }

            function check_bottom() {
                return parent[0].scrollTop > 0;
            }

            function check_top() {
                return parent[0].scrollHeight > parent.height() + parent.scrollTop() + 1; // +1 is culculation error delta 0 < scrollHeight() - height() < 1 that have a place on Chrome v33.
            }

            function scroll_bottom_down() {
                var step = 20;
                if (check_top()) {
                    parent.scrollTop(parent.scrollTop() + step);
                }

                downInterval = downInterval || setInterval(function() {
                    if (check_top()) {
                        parent.scrollTop(parent.scrollTop() + step);
                        step *= 1.2;
                        if (step > 500) step = 500;
                    } else {
                        clearInterval(downInterval);
                        downInterval = 0;
                    }
                }, 150);
            }

            function scroll_bottom_up() {
                clearInterval(downInterval);
                downInterval = 0;
            }

            function scroll_top_down() {
                var step = 20;
                if (check_bottom()) {
                    parent.scrollTop(Math.max(0, parent.scrollTop() - step));
                }
                upInterval = upInterval || setInterval(function() {
                    if (check_bottom()) {
                        parent.scrollTop(Math.max(0, parent.scrollTop() - step));
                        step *= 1.2;
                        if (step > 500) step = 500;
                    } else {
                        clearInterval(upInterval);
                        upInterval = 0;
                    }
                }, 150);
            }

            function scroll_top_up() {
                clearInterval(upInterval);
                upInterval = 0;
            }

            function updateScrollTop() {
                var height = parent.height();
                if(typeof prevHeight == 'number' && prevHeight != height) {
                    parent.get(0).scrollTop -= height - prevHeight;
                    prevHeight = height;
                    parent.trigger('onScroll');
                }
            }
        });
    };
})($);
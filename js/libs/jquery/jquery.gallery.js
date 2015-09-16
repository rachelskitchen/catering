
(function($) {
    'use strict';

    $.fn.gallery = function(opts) {
        this.each(function(i) {
            var ul = $('<ul class="app-gallery"></ul>'),
                left = $('<div class="app-gallery-scroll app-gallery-scroll-left"></div>'),
                right = $('<div class="app-gallery-scroll app-gallery-scroll-right"></div>'),
                parent = $(this),
                images = Array.isArray(opts.images) ? opts.images : [],
                curIndex = 0,
                animation = false,
                scrollStep = 0,
                innerStep = 0,
                numOfImages = 0,
                circle = opts.circle === true,
                isAnimate = opts.animate === true,
                autoSliding = opts.autoSliding === true,
                loadEvent = typeof opts.loadEvent == 'string' ? opts.loadEvent : false,
                time_delta = opts.time_delta ? opts.time_delta : 1,
                is_swiping = opts.swipe != undefined ? opts.swipe : false, //no swiping by default
                no_buttons = autoSliding || images.length <= 1 || (is_swiping && cssua.userAgent.mobile);

            parent.show();
            parent.append(ul);

            if(parent.css('position') != 'fixed' && parent.css('position') != 'absolute' && parent.css('position') != 'relative')
                parent.css('position', 'relative');

            parent.append(left, right);

            if (no_buttons) {
                left.hide();
                right.hide();
            }

            images.forEach(function(image) {
                onImageLoaded(image);
            });

            function onImageLoaded(image){

                var li = $('<li style="font-size:' + App.Data.getSpinnerSize() + 'px"></li>'),
                    helper = $('<span class="helper"></span>');

                li.append(helper);
                li.append(image);

                $(window).bind("resize", adjust);

                numOfImages ++;

                if (!no_buttons) {
                    left.show();
                    right.show();
                }

                ul.append(li);

                var hOffset, vOffset;

                scrollStep = scrollStep || Math.round($('li', ul).outerWidth(true));
                innerStep = innerStep || Math.round($('li', ul).width());

                setTimeout( function() {
                    li.css('font-size', App.Data.getSpinnerSize() + 'px');
                    controlButtons();
                    adjust();
                }, 0);

                function adjust() {
                    li.css('font-size', App.Data.getSpinnerSize() + 'px');
                }
            }

            if (loadEvent) {
              $(window).on(loadEvent, function(event, img_obj) {
                var image = img_obj.img;

                if (!image) {
                    return;
                }

                if (animation) {
                   setTimeout(function(){ onImageLoaded(image); }, 1000);
                }
                else {
                   onImageLoaded(image);
                }
              });
            }

            if (autoSliding) {
                startAutoSliding();
            }

            function startAutoSliding() {
                if (opts.time_delta === false || opts.time_delta == 0)
                    return;

                left.hide();
                right.hide();

                var interval = setInterval( function() {
                    if (ul.parents('body').length !== 0) {
                        if (numOfImages > 1) {
                           onRightClick.call(right[0]);
                        }
                    } else {
                        clearInterval(interval);
                    }
                }, time_delta * 1000);
            }

            left.on('click', function(event) {
                event.stopPropagation();
                scroll.call(this, -1);
            });

            right.on('click', onRightClick);

            swipe_detect(parent.get(0),  function(swipedir){
                    //swipedir contains either "none", "left", "right", "up", or "down"
                    if (swipedir =='right') {
                        scroll.call(this, 1);
                    } else if (swipedir =='left') {
                        scroll.call(this, -1);
                    }
                });

            function onRightClick(event) {
                if (event) {
                   event.stopPropagation();
                }
                scroll.call(this, 1);
            }

            left.addClass('disabled');
            right.addClass('disabled');

            function scroll(m) {
                if (animation)
                    return;

                var oldScrollPos = -curIndex * 150,
                    scrollPos;


                if (curIndex + m >= numOfImages && circle) {
                  curIndex = 0;
                  scrollPos = 0;
                  if (!isAnimate) {
                    //no animation for old chrome
                    ul.css("left", 0);
                  } else {
                    animation = true;
                    ul.
                        css("left", oldScrollPos + '%').
                        animate({
                           left: (-numOfImages * 150 + 50) + '%'
                        }, {
                            duration: 400,
                            done: function() {
                                ul.
                                    css('left', '100%').
                                    animate({
                                        left: scrollPos + '%'
                                    }, {
                                        duration: 400,
                                        done: function() {
                                           animation = false;
                                        }
                                    });
                            }
                        });
                  }
                } else if (curIndex + m < 0  && circle){
                    curIndex = numOfImages - 1;
                    scrollPos = -curIndex * 150;//150 - is magic number !!!
                    if (!isAnimate) {
                        //no animation for old chrome
                        ul.css("left", scrollPos + '%');
                    } else {
                        animation = true;
                        ul.
                            css("left", oldScrollPos + '%').
                            animate({
                               left: '100%'
                            }, {
                                duration: 400,
                                done: function() {
                                    ul.
                                        css('left', (-numOfImages * 150 + 50) + '%'). //magic numbers !!!
                                        animate({
                                            left: scrollPos + '%'
                                        }, {
                                            duration: 400,
                                            done: function() {
                                               animation = false;
                                            }
                                        });
                                }
                            });
                    }
                } else if (curIndex + m >= 0 && curIndex + m < numOfImages) {
                  curIndex += m; // current picture index
                  scrollPos = -curIndex * 150;
                  if (!isAnimate) {
                    //no animation for old chrome
                    ul.css("left", scrollPos + '%');
                  } else {
                    animation = true;
                    ul.
                        css("left", oldScrollPos + '%').
                        animate({
                           left: scrollPos + '%'
                        }, {
                            duration : 800,
                            done : function() {
                               animation = false;
                            }
                        });
                  }
                }
                controlButtons();
            }

            function controlButtons() {
                if (curIndex === 0 && !circle)
                    left.addClass('disabled');
                else
                    left.removeClass('disabled');

                if (curIndex >= numOfImages - 1  && !circle) {
                    right.addClass('disabled');
                }
                else {
                    right.removeClass('disabled');
                }
            }

        });
    };
})($);
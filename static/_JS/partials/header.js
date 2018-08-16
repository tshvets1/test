;(function ($) {
    var onScrollThrottleTimeout = 100;

    var headerCurrentOptions;

    $.fn.header = function () {
        var $header = this;

        if (!$header.length) {
            return;
        }

        var $document = $(document);
        var $window = $(window);
        var $content = $header.next();
        var $wholeContent = $header.nextAll(".page-content, .footer");
        var $body = $("body");

        var $primaryLinks = $header.find(".primary-nav__links");
        var $primaryTrigger = $primaryLinks.find(".primary-nav__item-trigger");
        var $primaryTriggerMobile = $primaryTrigger.find(".primary-nav__item-trigger-mobile");
        var $primarySubTrigger = $primaryLinks.find(".primary-nav__sub-item-subheadline");
        var $primarySubTriggerMobile = $primarySubTrigger.find(".primary-nav__sub-item-trigger-mobile");
        var $navigationWrapper = $header.find(".header__navigation-wrapper");
        var $utilityNav = $header.find(".utility-nav");
        var $mobileMenuToggle = $utilityNav.find(".utility-nav__menu-toggle");
        var $utilityTrigger = $utilityNav.find(".utility-nav__item-dropdown");

        var pagesCantBeSticky = $(".glossary__anchorlinks").length;

        var headerScrollTop = $header.offset().top;
        var diffBetweenShrinkAndFullNav;
        var defaultDiffBetweenShrinkAndFullNav = 0;
        headerCurrentOptions = getOptions(true);

        var canBeSticky = !cantBeSticky();

        var HOVER_DELAY = 200;
        var animationConstants = {
            EFFECT: "easeInOutCubic",
            SLIDE_UP_DURATION: 200,
            SLIDE_DOWN_DURATION: 400,
            ON_SHOW_SLIDE_DOWN_DURATION: 250,
            DURATION_IN: 150,
            DURATION_OUT: 150
        };

        if ($body.hasClass($.globalParameterConstants.HEADER_JUSTIFY_LINKS)) {
            $primaryLinks.addClass("primary-nav__links--justify");
        }

        var openOnWholeElementMobile = true;
        if ($body.hasClass($.globalParameterConstants.HEADER_OPEN_ON_BUTTON_CLICK_MOBILE)) {
            openOnWholeElementMobile = false;
        }

        var alwaysVisible = false;
        if ($body.hasClass($.globalParameterConstants.HEADER_ALWAYS_VISIBLE)) {
            alwaysVisible = true;
        }

        var scrollUpShowDelay = 0;
        var delayOption = $body.attr("class").split(/\s+/).filter(function (className) {
            return className.indexOf($.globalParameterConstants.HEADER_SCROLL_UP_SHOW_DELAY) === 0;
        });
        if (delayOption && delayOption.length) {
            scrollUpShowDelay = +delayOption[0].split(":")[1];
        }

        //by default: open on click
        var openOnHover = false;
        var openOnClick = true;
        //if open on hover specified then openOnClick shouldn't work
        if ($body.hasClass($.globalParameterConstants.HEADER_OPEN_ON_HOVER)) {
            openOnHover = true;
            openOnClick = false;
        }

        if (openOnHover) {
            $primaryTrigger.mouseenter(function () {
                var $this = $(this);
                setTimeout(function () {
                    //check if items is still hovered and is desktop and not already opened
                    if ($this.find(":hover") && $.viewport.isDesktop() && !$this.parent().hasClass("open")) {
                        $this.trigger("click", { hover: true });
                    }
                }, HOVER_DELAY);
            });
            $primaryLinks.on("mouseleave", function () {
                if ($.viewport.isDesktop()) {
                    $primaryTrigger.filter(function () {
                        return $(this).parent().hasClass("open");
                    }).trigger("click", { hover: true });
                }
            });
        }

        if (!openOnWholeElementMobile) {
            $primaryTriggerMobile.on("click", function () {
                $(this).parent().trigger("click", { mobileTrigger: true });
                return false;
            });
            $primarySubTriggerMobile.on("click", function () {
                $(this).parent().trigger("click", true);
                return false;
            });
        }

        $primaryTrigger.on("click", function (e, triggered) {
            var $menuItem = $(this).parent();

            if ($menuItem.hasClass("no-items")) {
                return;
            }

            //if openOnClick or (tablet and click on whole element) or force trigger
            if (openOnClick || ($.viewport.isTablet() && openOnWholeElementMobile) || triggered) {
                //todo: review utility search validation
                e.preventDefault();
                if (triggered && triggered.hover) {
                    e.stopPropagation();
                }

                if ($.viewport.isDesktop()) {
                    if ($menuItem.hasClass("open")) {
                        resetPrimaryNav($menuItem, $.viewport.VIEWPORT_DEVICE.DESKTOP);
                    } else {
                        $menuItem.addClass("open").children(".primary-nav__item-wrapper")
                            .finish()
                            .fadeIn(animationConstants.DURATION_IN, animationConstants.EFFECT);
                        $menuItem.siblings(".open").removeClass("open")
                            .children(".primary-nav__item-wrapper").css({ "display": "" });
                        $header.css("z-index", 4);
                    }
                } else {
                    $menuItem.toggleClass("open");
                }
            }
        });

        $primaryTrigger.on("touchstart mouseenter", function () {
            $(this).addClass("hover");
        }).on("touchend mouseleave", function () {
            $(this).removeClass("hover");
        });

        $primarySubTrigger.on("click", function (e, triggered) {
            var $menuItem = $(this).parent();

            if ($menuItem.hasClass("no-items")) {
                return;
            }

            if ($.viewport.isTablet()) {
                //if triggered don't navigate
                if (triggered || openOnWholeElementMobile) {
                    e.preventDefault();
                } else {
                    return;
                }

                $menuItem.toggleClass("open");
            }
        });

        $mobileMenuToggle.on("click", function (e) {
            e.preventDefault();

            if ($header.hasClass("open")) {
                resetUtility();
            } else {
                $navigationWrapper.slideDown(animationConstants.SLIDE_DOWN_DURATION, animationConstants.EFFECT);
                $wholeContent.fadeOut(animationConstants.SLIDE_DOWN_DURATION);
                $header.addClass("open");
                $body.addClass("nav-menu-open");
            }
        });

        $utilityTrigger.on("click", function () {
            var $menuItem = $(this);
            resetUtility($menuItem.siblings(".open"), $.viewport.VIEWPORT_DEVICE.DESKTOP);

            if ($menuItem.hasClass("open")) {
                resetUtility($menuItem, $.viewport.VIEWPORT_DEVICE.DESKTOP);
            } else {
                $menuItem.children(".utility-nav__item-dropdown-menu")
                    .slideDown(animationConstants.SLIDE_DOWN_DURATION, animationConstants.EFFECT, defaultClearCallback.bind($menuItem));
            }
        });

        var throttledScroll = throttle(onScroll, onScrollThrottleTimeout);
        $window.on("scroll", throttledScroll);

        $document.on("click", function (event) {
            var $target = $(event.target);
            if ($target.is("a") || $target.is("input") || $target.is("i") || $target.is("button")) {
                return;
            }
            if ($target.closest(".primary-nav__item-wrapper").length && !$target.is("a")) {
                return false;
            }

            clearStates();
        });

        $window.on("resize:device", function (e, currentDevice) {
            clearStates(currentDevice, true);

            resetHeader();
            canBeSticky = !cantBeSticky();
            headerCurrentOptions = getOptions(true);
        });

        $window.on("resize:height", function () {
            resetHeader();
            canBeSticky = !cantBeSticky();
        });

        $window.on("load", function () {
            headerCurrentOptions = getOptions();
        });

        $header.on("header:recalculate", function () {
            headerCurrentOptions = getOptions(true);
        });

        $header.on("header:recalculatePartially", function () {
            if (!headerCurrentOptions.isShrinked) {
                var baseHeights = {
                    utilityHeight: $utilityNav.outerHeight(),
                    fullNavHeight: $navigationWrapper.outerHeight()
                };
                var calculatedHeights = {
                    fullHeaderHeight: baseHeights.fullNavHeight + baseHeights.utilityHeight
                };

                calculatedHeights.shrinkedNavHeight = Math.abs(baseHeights.fullNavHeight -
                    (diffBetweenShrinkAndFullNav || defaultDiffBetweenShrinkAndFullNav));
            }

            $.extend(headerCurrentOptions, baseHeights, calculatedHeights);
        });

        $header.on("header:forceHide", function (e, callback) {
            headerCurrentOptions.isScrollingDownForce = true;
            if ($window.scrollTop() > headerCurrentOptions.setStickyScroll) {
                onScroll();
            }
            callback && callback();
        });

        $header.on("header:resetHide", function () {
            headerCurrentOptions.isScrollingDownForce = false;
        });

        function clearStates(currentDevice, onResize) {
            currentDevice = currentDevice || $.viewport.currentDevice();
            resetPrimaryNav($primaryTrigger.parent(), currentDevice, onResize);
            resetUtility($utilityTrigger.filter(".open"), currentDevice, onResize);
        }

        function resetPrimaryNav($menuItem, currentDevice, onResize) {
            var isDesktop = currentDevice === $.viewport.VIEWPORT_DEVICE.DESKTOP;

            if (onResize) {
                $header.css({ "z-index": "" });
                $primarySubTrigger.parent().removeClass("open");
                $menuItem.removeClass("open");
                $menuItem.children(".primary-nav__item-wrapper").css({ "display": "" });
                return;
            }

            if (isDesktop) {
                $menuItem.filter(".open").removeClass("open")
                    .children(".primary-nav__item-wrapper")
                    .finish()
                    .fadeOut(animationConstants.DURATION_OUT, animationConstants.EFFECT, function () {
                        $header.css({ "z-index": "" });
                    });
            } else {
                $menuItem.removeClass("open");
                $primarySubTrigger.parent().removeClass("open");
            }
        }

        function resetUtility($menuItem, currentDevice, onResize) {
            var isDesktop = currentDevice === $.viewport.VIEWPORT_DEVICE.DESKTOP;

            if (onResize) {
                $wholeContent.css({ "display": "" });
                $header.removeClass("open");
                $menuItem.removeClass("open");
                $menuItem.children(".utility-nav__item-dropdown-menu").css({ "display": "" });
                $navigationWrapper.css({ "display": "" });
                $body.removeClass("nav-menu-open");
                return;
            }

            if (isDesktop) {
                $menuItem.children(".utility-nav__item-dropdown-menu")
                    .slideUp(animationConstants.SLIDE_UP_DURATION, animationConstants.EFFECT, defaultClearCallback.bind($menuItem));
            } else {
                $navigationWrapper.slideUp(animationConstants.SLIDE_DOWN_DURATION, animationConstants.EFFECT);
                $wholeContent.fadeIn(animationConstants.SLIDE_DOWN_DURATION);
                $header.removeClass("open");
                $body.removeClass("nav-menu-open");
            }
        }

        function resetHeader() {
            $header.removeClass("sticky");
            /*            if (window.isIE8) {
                            headerCurrentOptions = getOptions();
                        } else {
                            // should recalculate options when on the top of the page;
                            // fixes an issue with wrong fullHeaderHeight when page is loaded in the middle
                            $primaryLinks.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                                headerCurrentOptions = getOptions();
                            });
                        }*/
            $navigationWrapper.css({ "display": "" });
            $content.css({ "padding-top": "" });
            headerCurrentOptions.isShrinked = false;
        }

        function defaultClearCallback() {
            var $menuItem = $(this);
            $menuItem.toggleClass("open", !$menuItem.hasClass("open"));
        }

        function onScroll() {
            if ($.viewport.isTablet() || !canBeSticky) {
                return;
            }
            var currentScrollPosition = $window.scrollTop();
            var isScrollDown = isScrollingDown(currentScrollPosition, headerCurrentOptions.scrollPosition);
            shrinkHeader(currentScrollPosition, isScrollDown);
            if (headerCurrentOptions.isShrinked) {
                if ((isScrollDown || headerCurrentOptions.isScrollingDownForce) && !alwaysVisible) {
                    $navigationWrapper.hide();
                } else {
                    delayedStart(function () {
                        $navigationWrapper.slideDown(animationConstants.ON_SHOW_SLIDE_DOWN_DURATION, animationConstants.EFFECT);
                    }, scrollUpShowDelay);
                }
            }
            headerCurrentOptions.scrollPosition = currentScrollPosition;
        }

        function shrinkHeader(currentScrollPosition, scrollDown) {
            if (currentScrollPosition > headerCurrentOptions.setStickyScroll && !headerCurrentOptions.isShrinked) {
                $header.addClass("sticky");
                $content.css({ "padding-top": headerCurrentOptions.fullHeaderHeight });
                headerCurrentOptions.isShrinked = true;

                if (typeof diffBetweenShrinkAndFullNav === "undefined") {
                    diffBetweenShrinkAndFullNav = headerCurrentOptions.fullHeaderHeight - $navigationWrapper.outerHeight();
                    headerCurrentOptions = getOptions(false, true);
                }
            }
            if (currentScrollPosition <= headerCurrentOptions.unsetStickyScroll && headerCurrentOptions.isShrinked && !scrollDown) {
                var contentOffsetTop = $content.offset().top;
                resetHeader();
                $window.scrollTop(contentOffsetTop);
            }
        }

        function isScrollingDown(currentScrollPosition, scrollPosition) {
            if (currentScrollPosition < headerCurrentOptions.setStickyScroll) {
                headerCurrentOptions.isScrollingDownForce = false;
            }
            if (currentScrollPosition > scrollPosition) {
                headerCurrentOptions.isScrollingDown = true;
            } else if (currentScrollPosition < scrollPosition) {
                headerCurrentOptions.isScrollingDown = false;
            }
            return headerCurrentOptions.isScrollingDown;
        }

        function getOptions(reset, calculateShrinkedHeaderHeight) {
            var result = {
                utilityHeight: $utilityNav.outerHeight(),
                fullNavHeight: $navigationWrapper.outerHeight(),

                scrollPosition: $window.scrollTop()
            };
            if (reset) {
                result.isScrollingDown = false;
                result.isShrinked = false;
            }

            result.fullHeaderHeight = result.fullNavHeight + result.utilityHeight;
            result.setStickyScroll = headerScrollTop + result.fullHeaderHeight;
            result.unsetStickyScroll = result.utilityHeight;

            if (calculateShrinkedHeaderHeight || reset || !headerCurrentOptions.isShrinked) {
                result.shrinkedNavHeight = Math.abs(result.fullNavHeight -
                    (diffBetweenShrinkAndFullNav || defaultDiffBetweenShrinkAndFullNav));
            }

            result = $.extend({}, headerCurrentOptions || {}, result);
            return result;
        }

        function cantBeSticky() {
            return $.viewport.isMenuStickyByViewportHeight() || pagesCantBeSticky;
        }

        function delayedStart(func, delay) {
            if (delay > 0) {
                setTimeout(func, delay);
            } else {
                func();
            }
        }

        /** @license https://raw.github.com/jashkenas/underscore/master/LICENSE */
        function throttle(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            options || (options = {});
            var later = function () {
                previous = options.leading === false ? 0 : getTime();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return function () {
                var now = getTime();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }

        /** @license https://raw.github.com/jashkenas/underscore/master/LICENSE */
        var getTime = (Date.now || function () {
            return new Date().getTime();
        });

        $header.data({
            isAlwaysVisible: alwaysVisible,
            headerApplied: true,
            methods: {
                getOptions: getOptions,
                getCurrentOptions: function () {
                    return headerCurrentOptions;
                }
            }
        });
    };

    $.fn.header.executeAfterScrollSafe = function (callback) {
        if (callback) {
            setTimeout(callback, onScrollThrottleTimeout);
        }
    };
})(jQuery);
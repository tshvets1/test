(function ($) {
    var mobileWidth = 768;
    var tabletWidth = 1024;
    var headerStickyViewportMaxHeight = 700;

    $.viewport = {
        getSize: function () {
            var e = window, a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }
            return { width: e[a + 'Width'], height: e[a + 'Height'] };
        },
        isMobile: function () {
            return typeof window.matchMedia === "undefined" ? this.getSize().width < mobileWidth : matchMedia("(max-width: " + (mobileWidth - 1) + "px)").matches;
        },
        isTablet: function () {
            return typeof window.matchMedia === "undefined" ? this.getSize().width < tabletWidth : matchMedia("(max-width: " + (tabletWidth - 1) + "px)").matches;
        },
        isDesktop: function () {
            return !this.isTablet();
        },
        currentDevice: function () {
            switch (true) {
                case this.isMobile(): {
                    return this.VIEWPORT_DEVICE.MOBILE;
                }
                case this.isTablet(): {
                    return this.VIEWPORT_DEVICE.TABLET;
                }
                default: {
                    return this.VIEWPORT_DEVICE.DESKTOP;
                }
            }
        },
        isMenuStickyByViewportHeight: function () {
            return this.getSize().height < headerStickyViewportMaxHeight;
        },
        VIEWPORT_DEVICE: {
            MOBILE: 0,
            TABLET: 1,
            DESKTOP: 2
        }
    };

    $.globalParameterConstants = {
        HEADER_OPEN_ON_HOVER: "header-open-on-hover",
        HEADER_JUSTIFY_LINKS: "header-justify-links",
        HEADER_OPEN_ON_BUTTON_CLICK_MOBILE: "header-open-on-button-click-mobile",
        HEADER_ALWAYS_VISIBLE: "header-always-visible",
        HEADER_SCROLL_UP_SHOW_DELAY: "header-scroll-up-show-delay"
    };

    //fix "chosen" cause focus on search field on dropdown option select (keyboard appears)
    if (/iPad/g.test(navigator.userAgent)) {
        var defaultFocusFunction = $.fn.focus;
        $.fn.focus = function () {
            if ($(this).parent().hasClass("chosen-search")) {
                return arguments[0];
            }
            return defaultFocusFunction.apply(this, arguments);
        };
    }

    $.fn.extend({
        chosenSelect: function (opts) {
            var self = this;
            var defaultChosenOptions = {
                enable_split_word_search: true,
                search_contains: true,
                allow_single_deselect: true,
                no_results_text: "Oops, nothing found!",
                display_disabled_options: false,
                width: "75%",
                "disable_search_threshold": 7
            };

            var options = $.extend(defaultChosenOptions, this.data("chosenOptions") || {}, opts || {});
            self.chosen(options);

            self.on("chosen:showing_dropdown", function (e, chosen) {
                var $this = $(e.target);
                $this.closest(".hero-two-section").css("z-index", 1);
                var options = chosen.chosen;
                if (options.disable_search ||
                    (options.disable_search_threshold !== 0 && options.disable_search_threshold >= options.results_data.length)) {
                    return;
                }
                $this.next(".chosen-container").find(".chosen-search > input").prop("readonly", "");
            }).on("chosen:hiding_dropdown", function (e) {
                var $this = $(e.target);
                $this.closest(".hero-two-section").css("z-index", "");
                $this.next(".chosen-container").find(".chosen-search > input:not([readonly])").attr("readonly", true);
            }).on("change", function (e) {
                var $this = $(e.target);
                $this.trigger("chosen:updated");
                $this.next(".chosen-container").find(".chosen-search > input:not([readonly])").attr("readonly", true);
            });
        },
        applyTooltip: function (opts) {
            var self = this;
            var defalutTooltipWidth = 220;
            if ($(self).length) {
                var right = $(window).width() - ($(self).offset().left + $(self).outerWidth());
                if (right < defalutTooltipWidth / 2) {
                    defalutTooltipWidth = parseInt(right * 2 - 1);
                }
            }

            var defaultOptions = {
                animation: "fade",
                content: self.html(),
                contentAsHTML: true,
                delay: 200,
                interactive: true,
                theme: "tooltipster-default",
                trigger: "hover",
                maxWidth: defalutTooltipWidth
            };

            var options = $.extend(defaultOptions, opts || {});
            self.tooltipster(options);
            return self;
        },
        applyScrollbar: function (options) {
            var self = this;
            self.addClass("nano").children(options.contentElementSelector || "*").addClass("nano-content");
            self.nanoScroller(options);
            self.destroyScrollbar = function () {
                self.removeClass("nano");
                self.nanoScroller({ destroy: true })
                    .children(options.contentElementSelector || "*").removeClass("nano-content");
                delete self.destroyScrollbar;
                return self;
            };
            return self;
        },
        fadeOutIn: function (options, duration) {
            var self = this;
            var opts = {};
            if (options && $.isFunction(options)) {
                opts.callback = options;
                opts.duration = duration;
            } else if (options) {
                opts = options;
            }

            //disable animation in IE8
            if (window.isIE8) {
                opts.duration = 0;
            }

            if (opts.duration !== 0) {
                self.animate({ opacity: "hide" }, "fast", function () {
                    opts.callback && opts.callback();
                    self.animate({ opacity: "show" }, opts.duration || "slow");
                });
            } else {
                opts.callback && opts.callback();
            }
        },
        slideDownSpeed: function (opt, callback) {
            var duration = this.height() / 1000;
            var cb = callback;
            if ($.isFunction(opt)) {
                cb = opt;
            } else if (typeof opt !== "undefined") {
                duration = this.height() / opt;
            }
            if (window.isIE8) {
                this.show();
                cb && cb();
            } else {
                this.slideDown({
                    duration: duration * 1000,
                    complete: cb,
                    easing: "linear"
                });
            }
        },
        slideUpSpeed: function (opt, callback) {
            var duration = this.height() / 1000;
            var cb = callback;
            if ($.isFunction(opt)) {
                cb = opt;
            } else if (typeof opt !== "undefined") {
                duration = this.height() / opt;
            }
            if (window.isIE8) {
                this.hide();
                cb && cb();
            } else {
                this.slideUp({
                    duration: duration * 1000,
                    complete: cb,
                    easing: "linear"
                });
            }
        },
        slideToggleSpeed: function (opt, callback) {
            var duration = this.height() / 1000;
            var cb = callback;
            if ($.isFunction(opt)) {
                cb = opt;
            } else if (typeof opt !== "undefined") {
                duration = this.height() / opt;
            }
            this.slideToggle({
                duration: duration * 1000,
                complete: cb,
                easing: "linear"
            });
        },
        autofill: function (callback) {
            $.each(this, function () {
                var $this = $(this);
                var isAutofillActive = true;
                var isCompositionActive = false;
                var isPasted = false;
                var previousInput = "";

                $this.on("click focus", function () {
                    isAutofillActive = true;
                }).on("keydown", function (e) {
                    isAutofillActive = false;
                    isPasted = e.ctrlKey;
                }).on("paste", function () {
                    isPasted = true;
                }).on("compositionstart", function () {
                    isCompositionActive = true;
                }).on("compositionend", function () {
                    setTimeout(function () {
                        isCompositionActive = false;
                    }, 100);
                });

                $this.on("propertychange input", function (e) {
                    //submit if value was selected from autofill list while typing:
                    //if new value length is greater than previous value more than one symbol
                    if (!isPasted && previousInput.length < $this.val().length - 1) {
                        isAutofillActive = true;
                    }
                    previousInput = $this.val();

                    if (!isAutofillActive || isCompositionActive) {
                        return;
                    }

                    if (e.type !== "propertychange" || e.originalEvent.propertyName === "value") {
                        callback.call($this);
                    }
                });
            });
        }
    });

    $.rgb2hex = function (rgb) {
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
        //Chrome transparent color fix:
        if (rgb.replace(/ /g, "") === "rgba(0,0,0,0)") return "#fff";

        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*(\d+))?\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    };

    $.updateQueryString = function (key, value, url) {
        if (!url) url = window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
            hash;

        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null)
                return url.replace(re, '$1' + key + "=" + value + '$2$3');
            else {
                hash = url.split('#');
                url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
            }
        } else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
            }
        }
        return url;
    };
})(jQuery);
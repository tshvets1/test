;(function ($) {
    $.fn.scrollToOpenedElement = function (options) {
        var self = this;
        var $offsetElement = this;
        var $window = $(window);
        var defaults = {
            offsetBefore: 0
        };
        var $header = $(".header");
        var headerInstance = $header.data();

        function setOffsetFromElement($relativeElements) {
            var $elements = $relativeElements ? $relativeElements : $offsetElement.find(opts.relativeElementsSelector);
            var offsetElementPosition = $offsetElement.offset().top;
            $elements.each(function () {
                var $this = $(this);
                var position = $this.offset().top;
                $this.data("relativePosition", position - offsetElementPosition);
            });
        }

        function setOpeningElementPosition($openingElement, secondTime) {
            var offsetElementPosition = $offsetElement ? $offsetElement.offset().top : 0;
            var elementPosition = offsetElementPosition + $openingElement.data("relativePosition");

            $header.trigger("header:recalculatePartially");

            var headerOffset = 0;
            if (headerInstance.isAlwaysVisible && $.viewport.isDesktop()) {
                headerOffset = headerInstance.methods.getCurrentOptions().shrinkedNavHeight;
            }

            var scrollToPosition = elementPosition - opts.offsetBefore - headerOffset;

            if ($window.scrollTop() !== scrollToPosition) {
                $("html, body").animate({ scrollTop: scrollToPosition }, {
                    complete: function () {
                        if (!secondTime) {
                            setOpeningElementPosition($openingElement, true);
                        }
                    }
                });
            }
        }

        var opts = $.extend({}, defaults, options);

        $window.on("resize:width", function () {
            opts.onWindowResize();
        });

        self.data("scrollToOpenedElement", {
            setOpeningElementPosition: setOpeningElementPosition,
            setOffsetFromElement: setOffsetFromElement
        });

        return self;
    };

    $.fn.scrollToElement = function (callback) {
        $("html, body").animate({
            scrollTop: this.offset().top
        }, function () {
            //solves problem with header scroll throttle
            $.fn.header.executeAfterScrollSafe(callback);
        });

        return this;
    };
})(jQuery);
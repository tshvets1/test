define(["knockout", "product", "knockout-helpers", "knockout-extenders"], function (ko, Product) {
    return function ($element, initializeData) {
        var self = this;
        var $sliderWrapper = $element.find(".bid-ask__products");
        self.sliderOptsDesktop = {
            startSlide: 0,
            minSlides: 4,
            maxSlides: 4,
            moveSlides: 4,
            speed: 1000,
            controls: false,
            auto: typeof initializeData.autoSlide == "undefined" ? true : initializeData.autoSlide,
            autoHover: true,
            pager: true,
            pause: initializeData.nextProductsTimeout,
            onSliderLoad: function () {
                $sliderWrapper.closest(".bx-viewport")
                    .closest(".bx-wrapper").css("max-width", "");

                $sliderWrapper.find(".bid-ask__product").removeClass("bid-ask__product--no-border");
                $sliderWrapper.find(".bid-ask__product:nth-child(4n+4)").addClass("bid-ask__product--no-border");
            },
            onSlideBefore: function ($slideElement, oldIndex, newIndex) {
                var $pagerElement = $slideElement.closest(".bx-wrapper").find(".bx-pager a[data-slide-index='" + newIndex + "']");
                $pagerElement.addClass("active").siblings().removeClass("active");
            }
        };
        self.products = ko.observableArray([]);
        self.shownProducts = 0;

        getData(updateProductsPerRow);

        $(window).on("resize:width", function () {
            updateProductsPerRow();
        });

        var index = "";

        function getData(callback) {
            index = index === "" ? "2" : "";

            $.ajax("/_JS/data/dummy/bid_ask_bar" + index + ".json", {
                /*$.ajax("/_Srvc/feeds/LiveRates.asmx/GetProductRates", {
                 type: "POST",
                 contentType: 'application/json; charset=utf-8',
                 data: JSON.stringify({ siteId: initializeData.siteId, products: initializeData.products }),
                 dataType: 'json',*/
                success: function (data) {
                    data = data.d;
                    var tempProducts = [];

                    for (var i = 0; i < data.length; i++) {
                        if (self.products().length) {
                            self.products()[i].update(data[i]);
                        } else {
                            tempProducts.push(new Product(data[i]));
                        }
                    }

                    if (tempProducts.length) {
                        self.products(tempProducts);
                    }

                    self.getProductTimoutId = setTimeout(getData, initializeData.getProductsTimeout);
                    if (callback) {
                        callback();
                    }
                },
                failure: function (data) {
                    console.log('error');
                }
            });
        }

        function updateProductsPerRow() {
            var sliderOpts = configureSlider();
            if (sliderOpts.slidesCount <= sliderOpts.moveSlides) {
                self.$slider && self.$slider.destroySlider();
                return;
            }
            if (self.$slider) {
                self.$slider.reloadSlider(sliderOpts);
            } else {
                self.$slider = $sliderWrapper.bxSlider(sliderOpts);
            }

            $sliderWrapper.children(".bx-clone-hack").css({
                width: 0,
                padding: 0,
                "margin-left": "-1px"
            });
        }

        function configureSlider() {
            var sliderOverrides;
            if ($.viewport.isMobile()) {
                sliderOverrides = {
                    minSlides: 2,
                    maxSlides: 2,
                    moveSlides: 2,
                    autoHover: false
                };
            }

            var sliderOpts = $.extend({}, self.sliderOptsDesktop, sliderOverrides);
            sliderOpts.slideWidth = $sliderWrapper.closest(".wrapper").width() / sliderOpts.moveSlides;

            return completeRowsWithClones(sliderOpts);
        }

        function completeRowsWithClones(sliderOpts) {
            var $slides = $sliderWrapper.children(":not(.bx-clone):not(.bx-clone-hack)");
            sliderOpts.slidesCount = $slides.length;

            var itemsOnLastSlide = sliderOpts.slidesCount % sliderOpts.moveSlides;
            $sliderWrapper.find(".bx-clone-hack").remove();

            if (sliderOpts.slidesCount > sliderOpts.moveSlides && itemsOnLastSlide > 0) {
                var defaultOnSliderLoad = sliderOpts.onSliderLoad;
                sliderOpts.onSliderLoad = function () {
                    $sliderWrapper.children(".bx-clone-hack").css({opacity: 0});

                    var additionalMargin = (sliderOpts.moveSlides - itemsOnLastSlide) * sliderOpts.slideWidth / 2;
                    $sliderWrapper.children(":not(.bx-clone):not(.bx-clone-hack)");

                    //add margins to end clones
                    var slideStartIndex = Math.floor(sliderOpts.slidesCount / sliderOpts.moveSlides) * sliderOpts.moveSlides;
                    $slides.eq(slideStartIndex).css("margin-left", additionalMargin + "px");
                    $slides.last().css("margin-right", additionalMargin + "px").addClass("bid-ask__product-last");

                    //add margins to start clones
                    $slides = $sliderWrapper.children(":not(.bx-clone-hack)");
                    $slides.first().css("margin-left", additionalMargin + "px");
                    $slides.eq(itemsOnLastSlide - 1).css("margin-right", additionalMargin + "px").addClass("bid-ask__product-last");

                    setTimeout(function () {
                        self.$slider.goToSlide(0);
                    }, 10);

                    defaultOnSliderLoad();
                };

                //add complete last row/slide
                for (var i = 0; i < sliderOpts.moveSlides - itemsOnLastSlide; i++) {
                    $sliderWrapper.append($slides.first().clone(true).empty().addClass("bx-clone-hack"));
                }
            }

            return sliderOpts;
        }
    }
});
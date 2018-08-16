function bannerArea($selector) {
	$selector.each(function () {
		var $this = $(this);
		$this.find(".banner-area__wrapper").removeAttr("hidden");
		new BannerArea($this);
		$this.addClass("banner-area--loaded");
	});

	function BannerArea($element) {
		var self = this;
		self.$element = $element;
		self.$wrapper = self.$element.find(".banner-area__wrapper");
		self.$controls = self.$wrapper.find(".bx-controls-direction");
		self.$slides = self.$element.find(".banner-area__items");
		self.sliderSpeed = self.$element.data("sliderSpeed") || 4000;
		self.autoSlide = self.$element.data("sliderAuto") || false;
		self.slidesCount = self.$slides.children().length;

		self.$controls.on("click", "button.bx-prev", function (e) {
			e.preventDefault();
			stopAuto();
			self.slider.goToPrevSlide();
		});

		self.$controls.on("click", "button.bx-next", function (e) {
			e.preventDefault();
			stopAuto();
			self.slider.goToNextSlide();
		});

		updateSlider();

		$(window).on("resize:width", function () {
			updateSlider();
		});

		function updateSlider() {
			if ($.viewport.isMobile()) {
				destroy();
			} else {
				var maxSlides = $.viewport.isTablet() ? 3 : 5;
				var slideWidth = self.$wrapper.width() / maxSlides;
				if (maxSlides >= self.slidesCount) {
					destroy();
					self.$slides.addClass("no-slider")
						.children().width(slideWidth - 10);
					return;
				}

				create(maxSlides, slideWidth);
			}
		}

		function destroy() {
			self.interval && clearInterval(self.interval);
			self.$controls.hide();
			self.$slides.removeClass("no-slider")
				.children().attr("width", "").width("");
			if (self.slider) {
				self.slider.destroySlider();
				self.slider = null;
			}
		}

		function create(maxSlides, slideWidth) {
			var opts = getOpts(maxSlides, slideWidth);
			if (self.slider) {
				self.slider.reloadSlider(opts);
			} else {
				self.slider = self.$slides.bxSlider(opts);
			}
			runAuto();
			self.$controls.show();
		}

		function getOpts(maxSlides, slideWidth) {
			return {
				slideWidth: slideWidth,
				minSlides: 1,
				maxSlides: maxSlides,
				moveSlides: 1,
				auto: false,
				pager: false,
				controls: false
			};
		}

		function runAuto() {
			if (self.autoSlide) {
				self.interval && clearInterval(self.interval);

				self.interval = setInterval(function () {
					self.slider.goToNextSlide();
				}, self.sliderSpeed);
			}
		}

		function stopAuto() {
			if (self.autoSlide) {
				self.autoSlide = false;
				clearInterval(self.interval);
			}
		}

		return {
			create: create,
			destroy: destroy
		}
	}
}

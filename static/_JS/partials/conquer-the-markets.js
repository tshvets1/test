function conquerTheMarkets() {
	$(".conquer-markets-section").each(function () {
		var $sliderSection = $(this);

		var $slider = $sliderSection.find(".conquer-markets__slides-wrapper");

		$.each($slider.children(), function (index, slide) {
			slide.removeAttribute("hidden");
		});

		if ($slider.children().length < 2) {
			return;
		}
		var sliderSpeed = $sliderSection.data("sliderSpeed") || 4000;
		var autoSlide = $sliderSection.data("sliderAuto") || false;

		if ($sliderSection.data("sliderType") === "mobile") {
			var $headersSlider = $sliderSection.find(".conquer-markets__slides-headers").bxSlider({
				"infiniteLoop": true,
				"controls": false,
				"pager": false,
				"touchEnabled": false,
				"auto": autoSlide,
				"pause": sliderSpeed
			});

			$slider.bxSlider({
				"infiniteLoop": false,
				"controls": false,
				"onSlideBefore": function ($slideElement, oldIndex, newIndex) {
					if ($headersSlider.length) {
						var nextSliderHeaderIndex = $slideElement.data("slideHeaderIndex");

						if (nextSliderHeaderIndex != $headersSlider.getCurrentSlide()) {
							$headersSlider.goToSlide(nextSliderHeaderIndex);
						}
					}
				}
			});
		}
		else {
			$slider.bxSlider({
				"infiniteLoop": true,
				"controls": false,
				"auto": autoSlide,
				"pause": sliderSpeed
			});
		}
	});
}
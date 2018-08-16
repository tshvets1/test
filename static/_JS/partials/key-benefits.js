function keyBenefits(section) {
	var showControlsWidth = 1023,
		$window = $(window);
	var $section = $(section);
	var $slider = $section.find(".key-benefits__slider");
	var $sliderPager = $section.find(".key-benefits__slider-nav");
	var speed = 500;
	var sliderSpeed = $slider.data("sliderSpeed") || 4000;
	var pagesPerSlideCount = 6;
	var sliderAuto = $slider.data("auto") || false;
	var $currentProgress;

	var sliderPagerOpts = {
		minSlides: 4,
		maxSlides: 6,
		slideWidth: $sliderPager.parent().width() / pagesPerSlideCount,
		slideMargin: 0.5,
		moveSlides: 4,
		auto: false,
		infiniteLoop: false,
		pager: false,
		speed: speed,
		controls: $section.parent().width() >= showControlsWidth,
		oneToOneTouch: false
	};

	var sliderOpts = {
		infiniteLoop: true,
		controls: false,
		pager: false,
		onSlideBefore: function ($slideElement, oldIndex, newIndex) {
			var $pageItem = $sliderPager.find("a[data-slide-index='" + newIndex + "']");
			var $prevPageItem = $pageItem.siblings(".active").removeClass("active");
			$prevPageItem.find(".key-benefits__slider-nav-item-progress").stop().css("width", "");
			$pageItem.addClass("active");

			if (sliderAuto) {
				if ($.viewport.isDesktop()) {
					var slideIndex = Math.floor((newIndex + 1) / pagesPerSlideCount);
					sliderPager.goToSlide(slideIndex);
				}
				animateProgressbar($pageItem.find(".key-benefits__slider-nav-item-progress"));
			} else {
				$sliderPager.attr("data-hide-progress", "true");
			}
		},
		onSliderLoad: function (currentIndex) {
			sliderOpts.onSlideBefore("", "", currentIndex);
		}
	};

	var sliderPager = $sliderPager.bxSlider(sliderPagerOpts);
	var slider = $slider.bxSlider(sliderOpts);

	$window.on("resize:width", function () {
		sliderPagerOpts.controls = $section.parent().width() >= showControlsWidth;
		sliderPagerOpts.slideWidth = $sliderPager.closest(".wrapper").width() / pagesPerSlideCount;
		sliderPager.reloadSlider(sliderPagerOpts);
		slider.reloadSlider(sliderOpts);
	});

	$sliderPager.on("click", "a", function (e) {
		e.preventDefault();
		sliderAuto = false;
		$currentProgress && $currentProgress.stop();
		slider.goToSlide($(this).data("slideIndex"));
	});

	$slider.parent().hover(function () {
		$currentProgress && $currentProgress.stop();
	}, function () {
		sliderAuto && startProgressBar($currentProgress);
	});

	function animateProgressbar($progress) {
		$currentProgress = $progress;
		startProgressBar($progress);
	}

	function startProgressBar($progress) {
		var duration = sliderSpeed * (1 - $progress.width() / $progress.parent().outerWidth()) || 4;
		$progress.animate({
			width: "100%"
		}, duration, "linear", function () {
			slider.goToNextSlide();
		});
	}
}
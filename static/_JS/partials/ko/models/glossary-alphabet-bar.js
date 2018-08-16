define("glossaryAlphabetBar", ["scrollspy"], function () {
	return function () {
		var glossary = [];
		var $window = $(window);

		var endGlossaryPosition = $(".glossary-section:not(.mobile-hidden):last").position().top - $(window).height();

		if ($.viewport.isMobile()) {
			$(document).scroll(function() {
				var scrollTop = $(window).scrollTop();
				if (scrollTop >= endGlossaryPosition) {
					showNextItems();
				}
			});
		}
		else {
			var $header = $(".glossary-header-section");
			var $menu = $header.find(".glossary__anchorlinks");

			var menuOffsetTop = $menu.offset().top;

			positionMenu();
			$window.scroll(positionMenu);

			$(".glossary-section").scrollSpy({
				onHrefClick: function (e) {
					e.preventDefault();
					var headerOffset = $window.scrollTop() < menuOffsetTop ? $header.height() + $menu.height() : $menu.outerHeight();

					var offset = $(this.hash).offset().top + 1;
					$("html, body").animate({ scrollTop: offset - headerOffset });
				}
			});
		}

		function positionMenu() {
			var scrollTop = $(window).scrollTop();
			if (scrollTop > menuOffsetTop) {
				$menu.addClass("fixed");
			} else {
				$menu.removeClass("fixed");
			}
		}

		function showNextItems() {
			var $glossary = $(".glossary-section.mobile-hidden:lt(3)");
			if ($glossary.length) {
				$.each($glossary, function () {
					$(this).removeClass("mobile-hidden");
				});
				endGlossaryPosition = $(".glossary-section:not(.mobile-hidden):last").position().top - $(window).height();
			}
		}
	};
});

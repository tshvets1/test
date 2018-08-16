(function ($) {
	$.fn.hideShowItem = function ($items, initialState) {
		var self = this;
		self.on("click", "a", function (e) {
			e.preventDefault();
			var $link = $(this);

			if ($link.parent().hasClass("active")) {
				return;
			}

			var $item = $($link.attr("href"));
			if (!$item.length) {
				return;
			}

			//cleanup
			self.find("li.active").removeClass("active");

			$items.filter(".active").first().fadeOut("slow", function () {
				//set new item as active if exists and scroll to the top

				$item.fadeIn("slow", function () {
					$("html, body").animate({
						scrollTop: 0
					});
				});
			});

			$item.addClass("active").siblings().removeClass("active");
			$link.parent().addClass("active");
		});

		if (initialState) {
			self.find("a[href='" + initialState + "']").trigger("click");
		}
	}
})(jQuery);
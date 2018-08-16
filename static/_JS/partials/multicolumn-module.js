function multiColModule() {
	$(".multi-col__content").each(function () {
		var $this = $(this);

		if ($this.data("matchHeight") == false) {
			return;
		}
		var $items = $this.children(".col");
		$items.matchHeight();

		var $multiColDescription = $items.find(".multi-col__description");

		if (typeof $this.data("custom") != "undefined" && !$this.data("custom")) {
			if (!$multiColDescription.length || $.trim($multiColDescription.html()).length == 0) {
				$this.attr("data-no-description", "true");
			}
		}

		var displayAs = $this.closest(".multi-col-section").data("displayAs");
		if ($.viewport.isDesktop() &&
			($this.data("divider") == true || displayAs === "block")) {
			var heights = $items.map(function () {
				return $(this).height();
			}).get();
			maxHeight = Math.max.apply(null, heights);
			$items.each(function () {
				$(this).height(maxHeight);
			});
		}
	});
}
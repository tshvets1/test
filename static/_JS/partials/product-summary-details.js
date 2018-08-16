function productSummaryDetails($selector) {
	var $body = $("body");
	var $header = $(".header");

	$selector.each(function () {
		var activeTab;
		var $productSummaryDetails = $(this);
		var $dataSections = $productSummaryDetails.find("[data-for-product]");

		$body.on("product-summary:changeTab", function (event, currentTab) {
			activeTab = currentTab;
			var $dataSection = $dataSections.filter("[data-for-product='" + activeTab + "']");
			if ($dataSection.length) {
				if ($productSummaryDetails.is(":visible")) {
					$productSummaryDetails.fadeOutIn(function () {
						$dataSections.removeClass("active");
						$dataSection.addClass("active");
					});
				} else {
					$dataSections.removeClass("active");
					$dataSection.addClass("active");
				}
			}
		});

		$body.on("product-summary:toggle", function (event, options) {
			if (typeof activeTab === "undefined") {
				$body.trigger("product-summary:changeTab", options.tab);
			}
			$productSummaryDetails.slideToggleSpeed();
			if (!options.state) {
				$header.trigger("header:forceHide", function () {
					$productSummaryDetails.scrollToElement(function () {
						$header.trigger("header:resetHide");
					});
				});
			}
		});
	});
}

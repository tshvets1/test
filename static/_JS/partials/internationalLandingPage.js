function internationalLandingPage($section) {
	var $countryDropdownForm = $section.find(".international__dropdown-module form");

	window[$countryDropdownForm.data("dformVariable")].beforeNavigate = function (target, callback) {
		onCountryChange(target, callback);
	};

	$countryDropdownForm.on("changed.dform.no-navigate", "select", function (e) {
		var $select = $(e.currentTarget);
		onCountryChange($select);
	});

	function onCountryChange($select, callback) {
		var $selected = $select.find(":selected");
		var isNotAvailable = $selected.data("NotAvailable") === "true";
		if (isNotAvailable) {
			$select.closest("form").find(".international__error-message").addClass("active");
		} else {
			$select.closest("form").find(".international__error-message").removeClass("active");
			if ($selected.data("WsEntity")) {
				cookies().set("wsEntity", $selected.data("WsEntity"), 360, "/", $('body').data('cookie'));
			}
			if ($selected.data("WsEntityLang")) {
				cookies().set("wsEntityLang", $selected.data("WsEntityLang"), 360, "/", $('body').data('cookie'));
			}

			if ($.isFunction(callback)) {
				callback();
			} else {
				location.href = "/?redirect=" + $selected.data("WsEntity") + "-" + $selected.data("WsEntityLang");
			}
		}
	}

	$section.find(".international__map-pin").each(function () {
		var $pin = $(this);
		$pin.tooltipster({
			animation: "fade",
			content: $section.find(".international__map-description[data-country='" + $pin.data("country") + "']").html(),
			contentAsHTML: true,
			delay: 200,
			interactive: true,
			theme: "tooltipster-default",
			trigger: "hover",
			arrow: false
		});
	});
}
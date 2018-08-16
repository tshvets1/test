function economicCalendar(options) {
	var $timeZoneSection = $(".economic__change-timezone");
	var $select = $timeZoneSection.find("select.economic__change-timezone-dropdown");
	$select.find("[value='" + options.timezone + "']").attr("selected", "selected");
	$select.chosenSelect({
		width: "100%",
		inherit_select_classes: true
	});

	$select.on("change", function (e) {
		var timezone = $(e.currentTarget).children(":selected").val();
		$(options.gridSelector).trigger("timezonechanged", timezone);
		$timeZoneSection.removeClass("open");
	});

	if (!options.rightRail) {
		var $grid = $(options.gridSelector);
		$grid.scrollToOpenedElement({
			relativeElementsSelector: ".fxit-eventrow",
			onWindowResize: function () {
				$grid.one("eventclosed", function () {
					$grid.data("scrollToOpenedElement").setOffsetFromElement();
				});
				$grid.trigger("closeopenevent");
			}
		});

		$grid.on("datareceived", function () {
			$grid.data("scrollToOpenedElement").setOffsetFromElement();
		}).on("openingevent", function (e, element) {
			$grid.data("scrollToOpenedElement").setOpeningElementPosition($(element));
		});
	}

	fxStreetEconomicCalendar(options);

	//right rail
	jQuery.moveColumn = function (table, from, to) {
		var rows = jQuery('tr', table);
		var cols;
		rows.each(function () {
			cols = jQuery(this).children('th, td');
			cols.eq(from).detach().insertBefore(cols.eq(to));
		});
	}
}
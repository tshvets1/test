function selectDates() {
	$(".live-trading-right-rail-module, .webinar-registration-section").each(function () {
		var $module = $(this);

		var $validationErrorMessage = $module.find(".webinar-registration__webinar-error");
		$validationErrorMessage.hide();

		var $input = $("input[name='SelectedLiveTrdSessions']");

		var $webinarDates = $module.find(".webinar-registration__webinar-date");
		var selectedDatesCount = $module.find(".webinar-registration__webinar-date.selected").length;

		$webinarDates.applyTooltip({
			content: $validationErrorMessage.data("errorMessage"),
			theme: "tooltipster-error",
			autoClose: false,
			speed: 0,
			trigger: "custom",
			animation: "none",
			minWidth: 200
		});

		$webinarDates.click(function (e) {
			var $this = $(e.currentTarget);
			var currentSelectedDatesCount = selectedDatesCount;
			if ($this.hasClass("selected")) {
				$this.removeClass("selected");
				selectedDatesCount--;
			} else {
				if (selectedDatesCount < 3) {
					$this.addClass("selected");
					selectedDatesCount++;
				}
			}

			selectedDates = [];
			$webinarDates.filter(".selected").each(function () {
				selectedDates.push($(this).data("webinarDate"));
			});
			if (selectedDates.length > 0) {
				$input.val(JSON.stringify(selectedDates));
				$validationErrorMessage.hide();
			} else {
				$validationErrorMessage.show();
				$input.val("");
			}

			$webinarDates.tooltipster("hide");
			if (currentSelectedDatesCount == selectedDatesCount && currentSelectedDatesCount == 3) {
				var position = "top";
				if ($.viewport.isMobile()) {
					position = $this.offset().left >= $.viewport.getSize().width / 2 ? "top-right" : "top-left";
				}
				$this.tooltipster("option", "position", position).tooltipster("show");
			}
		});

		if (selectedDatesCount == 0) {
		    $webinarDates.first().click();
		}
	});
}

function liveTradingSessionsConfirmation($section) {
	var $addToCalendar = $section.find(".live-trading-sessions__add-to-calendar");
	$addToCalendar.on("click", "a.atcb-link", function (e) {
		$addToCalendar.addClass("open");
	}).on("click", "a.atcb-item-link", function (e) {
		$addToCalendar.removeClass("open");
	});

	$("body, html").on("click", function (e) {
		if (!$(e.target).closest(".addtocalendar").length) {
			$addToCalendar.removeClass("open");
		}
	});
}
$(function () {
	//do not remove. used in webform submission.

	if ($('.hdnScreenResolution').length) {
		$(".hdnScreenResolution .scfSingleLineTextBox").val(screen.width + "x" + screen.height);
	}

	if ($('#sfGoogleGUID').length) {
		if ($('.hdnSfGoogleGUID').length) {
			$(".hdnSfGoogleGUID .scfSingleLineTextBox").val($('#sfGoogleGUID').val());
		}
	}

	//right rail newsletter
	if ($('#hdnRRScreenResolution').length) {
		$("#hdnRRScreenResolution").val(screen.width + "x" + screen.height);
	}
	if ($('#sfGoogleGUID').length) {
		if ($('#hdnRRSfGoogleGUID').length) {
			$("#hdnRRSfGoogleGUID").val($('#sfGoogleGUID').val());
		}
	}

	// footer newsletter
	if ($('#hdnFNLScreenResolution').length) {
		$("#hdnFNLScreenResolution").val(screen.width + "x" + screen.height);
	}

	if ($('#sfGoogleGUID').length) {
		if ($('#hdnFNLSfGoogleGUID').length) {
			$("hdnFNLSfGoogleGUID").val($('#sfGoogleGUID').val());
		}
	}
	//do not remove

	/*This function is for GTAG analytics*/

	$("[data-google-tag-manager='onload']").each(function () {
		var $element = $(this);
		createAndFireEvent($element);
	});

	function createAndFireEvent($element) {
		var data = {
			'idCookie': $element.data("cookie-id"),
			'idLead': $element.data("lead-id"),
			'event': $element.data("event-id"),
			'visitor-id': $element.data("visitor-id")
		};
		fireTrackingEvent(data);
	}

	/*for ajax based*/
	$("#testButton").click(function (e) {
		e.preventDefault();
		var $element = $(e.currentTarget);

		$.ajax({url: "url"}).done(function () {
			if (typeof $element.attr("data-google-tag-manager") !== typeof undefined) {
				createAndFireEvent($element);
			}
		});
	})
	/*End GTAG analytics*/
});
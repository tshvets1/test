function gftWithdrawal() {
	var $section = $(".gft-withdrawal");

	$section.find("#allFunds").change(function () {
		$section.find("#amount").closest(".form-group").toggle();
	});

	var $details = $section.find(".gft-withdrawal__form-hidden");
	$details.hide().find("input,select,textarea").attr("disabled", "disabled");
	$section.find("#preferredMethod").on("change", function (e) {
		var selected = $(this).children(":selected").data("show");
		$details.hide().find("input,select,textarea").attr("disabled", "disabled");
		$details.filter(selected).show().find("input,select,textarea").removeAttr("disabled");
	});
}
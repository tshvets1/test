$.fn.extend({
	hideLabelOnMobile: function () {
		var self = this;
		self.change(togglePlaceholderOnChange);

		togglePlaceholderOnChange();
		//hide Placeholders in mobile view
		var device = $.viewport.currentDevice();
		togglePlaceholder(self, device);

		$(window).on("resize:device", function (e, newDevice) {
			device = newDevice;
			togglePlaceholder(self, device);
		});

		function togglePlaceholder($input, device) {
			if (device == $.viewport.VIEWPORT_DEVICE.MOBILE) {
				$input.data("placeholder", $input.attr("placeholder") || "");
				$input.attr("placeholder", "");
			} else {
				$input.attr("placeholder", $input.data("placeholder"));
				$input.data("");
			}
		}

		function togglePlaceholderOnChange(){
			var $label = self.siblings("label:not(.error)");
			var hideLabel = self.val() == null || self.val().length > 0;
			if (!hideLabel && self.is("select") && self.find(":selected").text().length > 0) {
				hideLabel = true;
			}
			$label.toggleClass("mobile-hidden", hideLabel);
		}

		return this;
	}
});

function form(selector, options) {
	var $form = $(selector);

	if (options.mustHideLabelsForMobile) {
		$form.find("input:not(:checkbox,:radio,[type=hidden]), textarea, select").each(function () {
			$(this).hideLabelOnMobile();
		});
	}

	if (options.mustValidate) {
		//remove validation message on control change
		$form.find("input, textarea, select").change(function (e) {
			$(e.currentTarget).closest(".form-group").removeClass("invalid-control");
		});

		//validate controls on submit
		$form.find("button[type=submit],input[type=submit]").click(function (e) {
			var isFormValid = true;

			$form.find("input:not(:disabled), textarea:not(:disabled), select:not(:disabled)").each(function () {
				var $input = $(this);
				if ($input.parent().hasClass("chosen-search")) {
					return true;
				}

				var isInputValid = isRequired($input) && isMatchPattern($input) && isRequiredRelation($input);

				if (!isInputValid) {
					isFormValid = false;
				}
				$input.closest(".form-group").toggleClass("invalid-control", !isInputValid);
			});

			return isFormValid;
		});

		$form.on("click", ".invalid-control .form-validation-message", function () {
			$(this).closest(".invalid-control").removeClass("invalid-control");
		});
	}

	function isRequired($input) {
		return !hasAttribute($input, "required")
			|| ($input.is(":not(:checkbox)") && $input.val().length > 0) || $input.is(":checked");
	}

	function isMatchPattern($input) {
		return !$input.val().length || !hasAttribute($input, "pattern")
			|| (new RegExp($input.attr("pattern"))).test($input.val());
	}

	function isRequiredRelation($input) {
		if (hasAttribute($input, "data-required-relation")) {
			var $relatedInput = $form.find($input.data("requiredRelation"));
			return ($relatedInput.is(":not(:checkbox)") && $relatedInput.val().length > 0)
				|| $relatedInput.is(":checked")
				|| ($input.is(":not(:checkbox)") && $input.val().length > 0)
				|| $input.is(":checked");
		}
		return true;
	}

	function hasAttribute($input, attrName) {
		var attr = $input.attr(attrName);
		return typeof attr !== typeof undefined && attr !== false;
	}
}
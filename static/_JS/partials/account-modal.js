function openModalPopup(cls) {
	var $cls = typeof cls == "string" ? $(".MODAL_NAME_" + cls) : cls;
	var $window = $(window);

	$cls.dialog("instance") && $cls.dialog("destroy");

	var inlineModalOpts = $cls.data("modalOptions") || {};
	var modalOpts = {
		autoOpen: true,
		dialogClass: typeof inlineModalOpts.displayCloseButton === "undefined" || inlineModalOpts.displayCloseButton ? "" : "ui-dialog-hide-close",
		width: "auto",
		maxWidth: 900,
		minWidth: 300,
		draggable: false,
		closeOnEscape: inlineModalOpts.closeOnEscape,
		resizable: false,
		position: {my: "center top", at: "center top+20", of: window},
		closeText: "&times;",
		modal: true,
		show: {
			effect: "fade",
			duration: 500
		},
		hide: {
			effect: "fade",
			duration: 500
		},
		open: function () {
			if (inlineModalOpts.closeOnOutsideClick) {
				$(".ui-widget-overlay").one("click", function () {
					$cls.dialog("instance") && $cls.dialog("close");
				});
			}
			$cls.one("click", ".close", function () {
				$cls.dialog("instance") && $cls.dialog("close");
			});
		}
	};

	if ($.viewport.isMobile()) {
		$.extend(modalOpts, {
			maxWidth: 768
		});
	}

	$window.on("resize:width orientationchange", function () {
		$cls.dialog("option", "position", $cls.dialog("option", "position"));
	});

	$cls.dialog(modalOpts);
}
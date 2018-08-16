$(function () {
	// fix iOS: disable scroll page when fixed menu scrolled
	$("body").on("touchstart", ".fixed-menu__hideable-content, .fixed-menu__toggle", function (e) {
		if ($.viewport.isTablet()) {
			// If the element is scrollable (content overflows), then...
			if (this.scrollHeight !== this.clientHeight) {
				// If we're at the top, scroll down one pixel to allow scrolling up
				if (this.scrollTop === 0) {
					this.scrollTop = 1;
				}
				// If we're at the bottom, scroll up one pixel to allow scrolling down
				if (this.scrollTop === this.scrollHeight - this.clientHeight) {
					this.scrollTop = this.scrollHeight - this.clientHeight - 1;
				}
			}
			// Check if we can scroll
			this.allowUp = this.scrollTop > 0;
			this.allowDown = this.scrollTop < (this.scrollHeight - this.clientHeight);
			this.lastY = e.originalEvent.pageY;
		}
	}).on("touchmove", ".fixed-menu__hideable-content, .fixed-menu__toggle", function (e) {
		if ($.viewport.isTablet()) {
			var event = e.originalEvent;
			var up = event.pageY > this.lastY;
			var down = !up;
			this.lastY = event.pageY;

			if ((up && this.allowUp) || (down && this.allowDown)) {
				event.stopPropagation();
			} else {
				event.preventDefault();
			}
		}
	});

	$("[data-open-fixed-menu]").on("click", function (e) {
		var $target = $(e.target);
		if (!$target.is("[data-scroll-to-element]") && !$target.parent().is("[data-scroll-to-element]")) {
			$("html").toggleClass("fixed-menu-open").trigger("toggle-fixed-menu");
		}
	});

	// Remove Alert on "x"
	$(".alert__close").on("tap click", function (e) {
		var $alert = $(e.currentTarget).closest(".alert-section");

		var cookieName = $alert.data("cookieAlert");
		var cookieExpires = $alert.data("cookieAlertExpires");

		var expires = 7300;
		if (cookieExpires) {
			expires = cookieExpires == "session" ? false : +cookieExpires;
		}

		if (cookieName) {
			cookies().set(cookieName, "1", expires, "/");
		}

		var $header = $alert.next(".header");
		$alert.remove();
		$header.trigger("header:recalculate");

		updateFixedMenuPosition();
		updateFooterMargin();
		return false;
	});

	$("[data-cookie-alert]").each(function () {
		var $alert = $(this);
		var cookieName = $alert.data("cookieAlert");
		if (cookies().get(cookieName)) {
			$alert.remove();
		}
	});

	$("html").on("toggle-fixed-menu", function () {
		var $fixedMenu = $(".fixed-menu-section");
		if ($fixedMenu.css("position") != "fixed") {
			return;
		}

		var $alert = $(".alert-section.bottom-fixed");
		if ($(this).hasClass("fixed-menu-open")) {
			$alert.hide();
			$fixedMenu.css("bottom", 0);
		} else {
			$alert.show();
			updateFixedMenuPosition();
		}
	});

	$(window).on("resize:width", function () {
		updateFixedMenuPosition();
		updateFooterMargin();
	});

	updateFixedMenuPosition();
	updateFooterMargin();

	function updateFixedMenuPosition() {
		var $alert = $(".alert-section.bottom-fixed");
		var $fixedMenu = $(".fixed-menu-section");
		if (!$fixedMenu.length) {
			return;
		}

		if ($alert.length && $alert.is(":visible")) {
			var bottom = $alert.height();
			if ($fixedMenu.length && $fixedMenu.css("position") == "fixed") {
				$fixedMenu.css("bottom", bottom);
			}
		} else {
			$fixedMenu.css("bottom", 0);
		}
	}

	function updateFooterMargin() {
		var $footer = $(".footer");
		var margin = 0;

		var $fixedMenu = $(".fixed-menu-section");
		if ($fixedMenu.length && $fixedMenu.css("position") == "fixed") {
			margin += $fixedMenu.find(".fixed-menu__toggle").height();
		}

		var $warning = $(".alert-section.bottom-fixed");
		if ($warning.length && $warning.css("position") == "fixed") {
			margin += $warning.height();
		}

		$footer.css("padding-bottom", margin + "px");
	}
});
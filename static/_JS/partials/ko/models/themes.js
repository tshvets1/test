define("themes", ["knockout"], function (ko) {
	return function ($element) {
		var self = this;
		var openedRow;
		var $tiles = $element.find("a.theme__corner-button");
		var $header = $(".header");
		$element.scrollToOpenedElement({
			offsetBefore: 5,
			relativeElementsSelector: "a.theme__corner-button",
			onWindowResize: function () {
				$element.data("scrollToOpenedElement").setOffsetFromElement();
				self.closeTheme();
			}
		});
		$element.data("scrollToOpenedElement").setOffsetFromElement($tiles);

		self.sectionTemplate = $("#theme-description").html();
		$element.find(".topic-section").hide();
		var showHideOptions = {};

		self.closeTheme = function (data, event, noSlide, prevent) {
			if (prevent) {
				event.preventDefault();
			}
			showHideOptions.isClose = false;

			var $activeTheme = $(".theme.active");
			var $themeDescription = $activeTheme.nextAll(".theme__open-description");

			if (noSlide) {
				clearThemeState($activeTheme);
			} else if ($themeDescription.length) {
				$themeDescription.slideUpSpeed(function () {
					$(this).remove();
					clearThemeState($activeTheme);

					showHideOptions.isClose = true;
					if (showHideOptions.isOpen) {
						$header.trigger("header:resetHide");
					}
				});

				if (typeof noSlide == "undefined") {
					openedRow = undefined;
				}
			} else {
				showHideOptions.isClose = true;
			}

			function clearThemeState($theme) {
				$theme.removeClass("active").find("a.theme__corner-button span").text("+");
			}
		};

		self.openThemeByTitle = function (data, event) {
			var $cornerButton = $(event.currentTarget).siblings("a.theme__corner-button");
			event.currentTarget = $cornerButton[0];
			self.openTheme(null, event);
		};

		self.openTheme = function (data, event) {
			event.preventDefault();
			var $this = $(event.currentTarget);

			if ($this.closest(".theme").hasClass("active")) {
				self.closeTheme(null, event);
				return;
			}

			var $themeSection = $($this.attr("href"));

			if ($themeSection.length) {
				var $section = $(self.sectionTemplate).append($themeSection.clone(true).show());

				var tilesInRow = getTilesInRow();
				var index = $tiles.index($this) + 1;

				index += index % tilesInRow == 0 ? 0 : tilesInRow - index % tilesInRow;
				index = index < $tiles.length ? index : $tiles.length;

				openTheme($this, $section, index, tilesInRow);
			}

			function openTheme($openingThemeButton, $openingThemeContent, tileIndex, tilesInRow) {
				var openingRow = Math.floor(tileIndex / tilesInRow);
				var $activeTheme = $openingThemeButton.closest(".theme");

				if (openingRow != openedRow) {
					$header.trigger("header:forceHide");
					showHideOptions.isOpen = false;
					openedRow = openingRow;
					//close other themes if open
					self.closeTheme(null, event, false);

					$activeTheme.addClass("active").closest(".theme-section").find(".theme").eq(tileIndex - 1).after($openingThemeContent.hide());
					$openingThemeContent.slideDownSpeed(function () {
						showHideOptions.isOpen = true;
						if (showHideOptions.isClose) {
							$header.trigger("header:resetHide");
						}
					});
					$element.data("scrollToOpenedElement").setOpeningElementPosition($openingThemeButton);
				} else {
					self.closeTheme(null, event, true);
					$activeTheme.addClass("active").siblings(".theme__open-description").replaceWith($openingThemeContent);
				}

				$openingThemeButton.find("span").text("-");
			}

			function getTilesInRow() {
				var tilesInRow = 3;

				switch (true) {
					case $.viewport.isMobile(): {
						tilesInRow = 1;
						break;
					}
					case $.viewport.isTablet(): {
						tilesInRow = 2;
						break;
					}
				}

				return tilesInRow;
			}
		};
	};
});
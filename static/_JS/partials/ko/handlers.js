define(["knockout"], function (ko) {
	var isIE8 = window.isIE8;

	ko.bindingHandlers.fadeVisible = {
		init: function (element, valueAccessor) {
			// Start visible/invisible according to initial value
			var shouldDisplay = ko.utils.unwrapObservable(valueAccessor());
			$(element).toggle(shouldDisplay);
		},
		update: function (element, valueAccessor, allBindingsAccessor) {
			// On update, fade in/out
			var shouldDisplay = ko.utils.unwrapObservable(valueAccessor()),
				allBindings = allBindingsAccessor(),
				duration = allBindings.fadeDuration || 1500; // 500ms is default duration unless otherwise specified
			if (isIE8) {
				shouldDisplay ? $(element).show() : $(element).hide();
			} else {
				shouldDisplay ? $(element).fadeIn(duration) : $(element).fadeOut(duration);
			}
		}
	};

	ko.bindingHandlers.highlight = {
		init: function (element, valueAccessor, allBindingsAccessor) {
		},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var $element = $(element);
			var allBindings = allBindingsAccessor();
			var highlightProperty = allBindings.highlightProperty || "highlight";
			var highlight = viewModel[highlightProperty] ? viewModel[highlightProperty]() : ko.utils.unwrapObservable(valueAccessor());

			if (highlight) {
				if (isIE8) {
					$element.addClass(allBindings.highlightClass);
					setTimeout(function () {
						$element.removeClass(allBindings.highlightClass);
					}, 1000);
				} else {
					$element.switchClass("", allBindings.highlightClass, "fast", function () {
						setTimeout(function () {
							$element.switchClass(allBindings.highlightClass, "", "slow");
						}, 1000);
					});
				}
			}
		}
	};

	ko.bindingHandlers.highlightUpDownIntermediate = {
		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var $element = $(element);
			var allBindings = allBindingsAccessor();
			var highlightOptions = allBindings.highlightOptions;
			var upClasses = highlightOptions.highlightUp + " " + highlightOptions.highlightUpInter;
			var downClasses = highlightOptions.highlightDown + " " + highlightOptions.highlightDownInter;

			var highlightProperty = highlightOptions.highlightProperty || "highlight";
			var highlight = viewModel[highlightProperty] ? viewModel[highlightProperty]() : ko.utils.unwrapObservable(valueAccessor());

			if (isNaN(highlight) || highlight == 0) {
				if (isIE8) {
					$element.removeClass(upClasses + " " + downClasses);
				} else {
					$element.switchClass(upClasses + " " + downClasses, "", "fast");
				}
			} else {
				var highlightClass = highlightOptions.highlightUp;
				var highlightInterClass = highlightOptions.highlightUpInter;
				var removeClasses = downClasses;
				if (highlight < 0) {
					highlightClass = highlightOptions.highlightDown;
					highlightInterClass = highlightOptions.highlightDownInter;
					removeClasses = upClasses;
				}
				if (isIE8) {
					$element.removeClass(removeClasses + " " + highlightClass).addClass(highlightInterClass);
					setTimeout(function () {
						$element.removeClass(highlightInterClass).addClass(highlightClass);
					}, 1000);
				} else {
					$element.switchClass(removeClasses + " " + highlightClass, highlightInterClass, "fast", function () {
						setTimeout(function () {
							$element.switchClass(highlightInterClass, highlightClass, "fast");
						}, 1000);
					});
				}
			}
		}
	};

	ko.bindingHandlers.superscriptLastChar = {
		update: function (element, valueAccessor, allBindings) {
			var $element = $(element);
			var decimals = allBindings().decimals || 0;

			var value = ko.toJS(ko.utils.unwrapObservable(valueAccessor()));
			if (typeof value === "undefined") return;

			value = value.toString();
			if (value && value.length > 0) {
				var superscript = "";
				var boldIndex = value.length - 2;
				if (decimals % 2 === 1) {
					superscript = value[value.length - 1];
					boldIndex--;
				}

				var boldText = value.substr(boldIndex, 2);
				if (boldText.indexOf(".") !== -1) {
					boldText = value[boldIndex - 1] + boldText;
				}

				$element.text(value.slice(0, -(boldText.length + superscript.length)));
				$element.append($("<b />").addClass("bold").text(boldText));
				$element.append($("<sup />").addClass("superscript").text(superscript));
			}
		}
	};

	ko.bindingHandlers.drawPie = (function () {
		function getInitData($element) {
			var options = {
				scaleLength: 0,
				lineCap: "butt",
				animate: false,
				border: {
					enabled: true
				}
			};
			options.size = $element.data("size") || $element.data("sizeDesktop");
			options.lineWidth = $element.data("lineWidth") || $element.data("lineWidthDesktop");

			if (typeof options.size === "undefined") {
				options.size = $element.width();
				options.lineWidth = (options.size - $element.children().width()) / 2;
			}
			options.barColor = $element.data("barColor") || function () {
					$element.data("barColorChange");
				};
			options.border.color = $element.data("borderColor") || '#fff';
			if ($element.data("borderColorFrom")) {
				options.border.color = $.rgb2hex($element.closest($element.data("borderColorFrom")).css("background-color"));
			}

			options.border.width = $element.data("borderWidth") || 1;

			if ($.viewport.isMobile()) {
				options.size = $element.data("sizeMobile") || options.size;
				options.lineWidth = $element.data("lineWidthMobile") || options.lineWidth;
			}
			return options;
		}

		return {
			init: function (element) {
				var $element = $(element);

				var opts = getInitData($element);
				$element.easyPieChart(opts);
			},
			update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
				ko.unwrap(valueAccessor());
				var $element = $(element);

				$element.data("easyPieChart").update(+$element.attr("data-percent"));
			}
		};
	})();

	ko.bindingHandlers.pagination = {
		init: function (element, valueAccessor) {
			var $element = $(element);
			var paginationOpts = ko.toJS(ko.utils.unwrapObservable(valueAccessor())) || {};

			$element.pagination(paginationOpts);
		},
		update: function (element, valueAccessor) {
			var $element = $(element);
			var paginationOpts = ko.toJS(ko.utils.unwrapObservable(valueAccessor())) || {};

			$element.data("pagination").update(paginationOpts.pagesCount, paginationOpts.currentPage);
		}
	};

	ko.bindingHandlers.allowNumeric = {
		init: function (element) {
			var $element = $(element);
			$element.numericInput();
		},
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		}
	};
});
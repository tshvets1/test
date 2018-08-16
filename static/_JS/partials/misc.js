function misc() {
	var $window = $(window);
	var $activeInput;

	var windowWidth = $.viewport.getSize().width;
	var windowHeight = $.viewport.getSize().height;
	var device = $.viewport.currentDevice();
	$window.on("resize", function () {
		var currentWidth = $.viewport.getSize().width;
		if (windowWidth != currentWidth) {
			if (window["isIE8"]) {
				return;
			}

			windowWidth = currentWidth;
			$window.trigger("resize:width", windowWidth);

			var currentDevice = $.viewport.currentDevice();
			if (currentDevice != device) {
				device = currentDevice;
				$window.trigger("resize:device", device);
			}
		}

		var currentHeight = $.viewport.getSize().height;
		if (windowHeight != currentHeight) {
			windowHeight = currentHeight;
			$window.trigger("resize:height", windowHeight);
		}
	});

	$("body").on("click", "[data-toggle-class]", function (e) {
		e.preventDefault();
		var $this = $(this);
		var toggleClass = $this.data("toggleClass");
		$this.toggleClass(toggleClass);
	}).on("click", "[data-toggle-parent-class]", function (e) {
		e.preventDefault();
		var $this = $(this);
		var toggleClass = $this.data("toggleParentClass");
		$this.parent().toggleClass(toggleClass);
	}).on("click", "[data-modal-href]", function () {
		var href = $(this).data("modalHref");
		if (href.indexOf("http") == 0) {
			window.location.href = href;
		} else {
			openModalPopup($(href));
		}
		return false;
	}).on("click tap", "[data-scroll-to-element]", function () {
		var $this = $(this);
		$($this.data("scrollToElement")).scrollToElement();
		return false;
	}).on("focusin", "input,textarea,select", function (e) {
		$activeInput = $(e.target);
	}).on("focusout", "input,textarea,select", function () {
		$activeInput = null;
	}).on("click", "[data-google-tracking-event]", function () {
		var eventName = $(this).data("googleTrackingEvent");
		typeof googleTagManagerDataLayer !== "undefined" && googleTagManagerDataLayer.push({
			"event": eventName
		});
	});

	if (window.navigator.userAgent.indexOf("MSIE ") > -1
		|| window.navigator.userAgent.indexOf("Trident/") > -1) {

		$(".hero__headline span, " +
			".master-markets__title span, " +
			".listing-item__title span, " +
			".page__title span, " +
			".hover-state__content-hover p, " +
			".block__group-item-headline span").each(function () {
			var $this = $(this);
			var $spans = [];
			$this.text().trim().split(" ").forEach(function (text, index, array) {
				var $span = $("<span/>").text(text + (index < array.length - 1 ? " " : ""));
				$spans.push($span);
			});
			$this.html($spans).addClass("IE");
		});
	}

	$window.on("orientationchange", function () {
		if (!$activeInput) {
			return;
		}

		setTimeout(function () {
			$window.scrollTop($activeInput.offset().top);
		}, 500);
	});

	if (!$.viewport.isMobile()) {
		$("a[href^='tel:']").each(function () {
			$(this).removeAttr("href").addClass("disable-href");
		});
	}

	// Vertically Center Image
	var $imgContainer = $("[data-img-align='center']"),
		$centerImg = $("[data-img-align='center'] > img");

	$centerImg.each(function () {
		//get img dimensions
		var h = $(this).height();

		//get div dimensions
		var div_h = $imgContainer.height();

		//set img position
		this.style.top = Math.round((div_h - h) / 2) + "px";
	});

	$window.on("load resize", function () {
		if ($.viewport.isMobile()) {
			var $teamimgContainer = $(".member__image");

			$teamimgContainer.each(function () {
				var w = $(this).width(); //get div dimensions
				this.style.maxHeight = Math.round(w / 1.5) + "px";
			});
		}
		if ($(".multi-col-section").length) multiColModule();
	});

	// Match column heights
	$("[data-function='matchHeights']").each(function () {
		$(this).children().matchHeight();
	});

	$("[data-pagination-options]").each(function () {
		var $this = $(this);
		$this.pagination($this.data("paginationOptions"));
	});

	$("[data-add-pagination]").each(function () {
		var $this = $(this);
		$this.addPagination($this.data("addPagination"));
	});

	$(".section-wrapper").filter("[data-carousel='true']").each(function () {
		var $this = $(this);
		var auto = $this.data("sliderAuto");
		var sliderSpeed = $this.data("sliderSpeed") || 4000;
		var adaptiveHeight = $this.data("sliderAdaptiveHeight");
		var params = {
			auto: typeof auto === "undefined" ? true : auto,
			controls: false,
			autoHover: true,
			pause: sliderSpeed,
			adaptiveHeight: adaptiveHeight
		};
		var $carousel = $this.find(".carousel");
		$.each($carousel.children(), function (index, slide) {
			slide.removeAttribute("hidden");
		});

		if ($carousel.children().length > 1) {
			var slider = $carousel.bxSlider(params);

			$this.on("dform.initialized", "form", function () {
				slider.reloadSlider();
			});
		}
	});

	$(".generic-hero-section[data-has-inner-hero-options='false']").each(function () {
		var $this = $(this);
		if ($this.next().hasClass("generic-content-section")) {
			$this.attr("data-has-generic-content-after", "true");
		}
	});

	$("[data-sectionbg-invert='alternate']").each(function () {
		var $this = $(this);
		var $nextSections = $this.nextAll("[data-sectionbg='alternate']");
		$nextSections.filter(":even").removeClass("section-default").addClass("section-light");
		$nextSections.filter(":odd").removeClass("section-light").addClass("section-default");
	});

	$("[data-pointer=true]").each(function () {
		var $element = $(this);
		var $next = $element.next();
		var thisImage = $element.css("background-image");
		var nextImage = $next.css("background-image");
		//if next don't have background-image;

		if (thisImage && thisImage != "none" && (!nextImage || nextImage == "none")) {
			var nextColor = $next.css("background-color");

			if (typeof nextColor === "undefined"
				|| nextColor === "transparent"
				|| nextColor.replace(/ /g, "") === "rgba(0,0,0,0)") {
				nextColor = "#fff";
			}

			var $arrow = $("<div>").addClass("pointer");
			$arrow.append($("<div>").addClass("pointer-left").css("border-bottom-color", nextColor));
			$arrow.append($("<div>").addClass("pointer-right").css("border-bottom-color", nextColor));

			$element.addClass("data-pointer").removeAttr("data-pointer").append($arrow);
			$next.addClass("data-pointer-next");
		}
	});

	$(".text-to-link-section").each(function () {
		var $this = $(this);

		var search = prepareSearchText($this.data("searchText"));
		var ignoreSelector = $this.data("ignoreSelector");
		var urlFormat = $this.data("urlFormat");

		textToLinks(
			search.searchText,
			function (element, text) {
				return "<a href='" + urlFormat + search.replacementObj[text] + "'>" + text + "</a>"
			},
			$this.prev(),
			ignoreSelector);
	});

	// add grey background for Latest Research section
	$('.section-wrapper[data-sectionbg=grey]').each(function () {
		$(this).prev('.generic-hero-section').addClass('special-bg');
	});

	$("footer .section-wrapper").each(function () {
		var $this = $(this);
		var $inner = $this.find(".wrapper");
		if ($inner.text().trim() == '') {
			$this.css("display", "none");
		}
	});

	$("[data-chosen-select]").chosenSelect();

	$("[data-share-this]").shareThis();

	$(".tooltip").each(function () {
		$(this).applyTooltip();
	});

	$("[data-tooltip]").each(function () {
		var $this = $(this);
		var $content = $("<p>").html($this.data("tooltip")).wrap("<div>").parent().addClass("tooltip__content");
		$this.applyTooltip({
			content: $content[0].outerHTML,
			theme: "tooltipster-data-tooltip"
		});
	});

	$("[data-article-icon]").each(function () {
		var $this = $(this);
		var $span = $("<span>");
		var articleIcon = $this.data("articleIcon");
		var cssProperty = {
			"background-image": "url('" + articleIcon + "')"
		};
		$this.css(cssProperty).append($span.css(cssProperty));
	});

	$("[data-modal-display-on-load='true']").each(function () {
		openModalPopup($(this));
	});

	$("form[data-dform-variable]").each(function () {
		var merge = function (json1, json2, property, join) {
			if (!json2 || $.isEmptyObject(json2)) {
				return json1;
			}

			var hash = json2.reduce(function (memo, item) {
				memo[item[property]] = item;

				return memo;
			}, {});

			var result = [];

			var patchObj = function (obj1, hash, property) {
				if (obj1[property] && hash[obj1[property]]) {
					$.extend(obj1, hash[obj1[property]]);

					return obj1;
				} else {
					for (var key in obj1) {
						if (obj1.hasOwnProperty(key) && typeof (obj1[key]) == "object") {
							var res = patchObj(obj1[key], hash, property);
							if (res) {
								return res;
							}
						}
					}
				}
			};

			var findObj = function (obj, property, value, returnObject) {
				if (obj[property] && obj[property] == value) {
					return returnObject ? obj : true;
				} else {
					for (var key in obj) {
						if (obj.hasOwnProperty(key) && typeof (obj[key]) == "object") {
							var res = findObj(obj[key], property, value, returnObject);
							if (res) {
								return returnObject ? res : true;
							}
						}
					}
				}
			};
			var getObj = function (obj, property) {
				if (obj[property]) {
					return obj;
				} else {
					for (var key in obj) {
						if (obj.hasOwnProperty(key) && typeof (obj[key]) == "object") {
							var res = getObj(obj[key], property);
							if (res) {
								return res;
							}
						}
					}
				}
			};

			var remove_duplicates = function (objectsArray) {
				var usedObjects = {};

				for (var i = objectsArray.length - 1; i >= 0; i--) {
					var so = JSON.stringify(objectsArray[i]);

					if (usedObjects[so]) {
						objectsArray.splice(i, 1);

					} else {
						usedObjects[so] = true;
					}
				}

				return objectsArray;
			};

			$.each(json1, function (index, item) {
				var newItem = $.extend({}, item);
				if (item[join.name] && item[join.name] == join.value) {
					patchObj(item, hash, property);
					result.push(newItem);
				} else {
					if (patchObj(item, hash, property)) {
						result.push(newItem);
					}
				}
			});

			var finalResult = [];

			$.each(json2, function (i, item) {
				if (item[property]) {
					var value = item[property];
					$.each(result, function (index, node) {
						var isInJson2 = findObj(node, property, value);
						if (isInJson2) {
							finalResult.push(node);
						}
					});
				}
			});

			$.each(result, function (i, item) {
				var index = $.inArray(item, finalResult);
				var patchItem = getObj(item, "optionsSource");
				if (patchItem) {
					patchItem.options = patchItem.data;

					if (patchItem.conditions) {
						patchItem.conditions["default"] = patchItem.conditions["default"] || {mapname: "xdxdxd"};
						var extend = findObj(json2, property, patchItem.conditions["default"].mapname.replace("_map", ""), true);
						if (extend) {
							if (patchItem.conditions["default"]) { //also check if wffm has this field
								$.extend(true, patchItem.conditions["default"].html, extend);
							}
						}
						else {
							delete patchItem.conditions["default"];
						}
						extend = findObj(json2, property, patchItem.conditions.SubOptions.mapname.replace("_map", ""), true);
						if (extend) {
							$.extend(true, patchItem.conditions.SubOptions.dropdown, extend);

							var subOption = $.extend({}, patchItem.conditions.SubOptions);
							$.each(patchItem.options, function (a, option) {
								if (patchItem.conditions.hasOwnProperty(option.Value)) {
								}
								else if (option.Children && option.Children.length > 0) {
									patchItem.conditions[option.Value] = $.extend(true, {}, subOption);
									patchItem.conditions[option.Value].dropdown.options = option.Children;
								}
							});
						}
					}
					item.dropdown = patchItem;
					if (index >= 0) {
						finalResult[index] = item;
					}
				}
				if (index < 0) {
					finalResult.push(item);
				}
			});
			finalResult = remove_duplicates(finalResult);
			return finalResult;
		};

		var $form = $(this);
		var options = window[$form.data("dformVariable")];
		if (options.html.cols) {
			var cols = [];
			$.each(options.html.cols, function (i, col) {
				var newCol = merge(col, window[$form.data("dformVariable") + "_picked"], 'name', {
					name: "join",
					value: "false"
				});
				cols.push(newCol);
			});
			options.html.cols = cols;
			window[$form.data("dformVariable")] = options;
		}
		else {
			options = merge(options.html, window[$form.data("dformVariable") + "_picked"], 'name', {
				name: "join",
				value: "false"
			});
			window[$form.data("dformVariable")].html = options;
		}

		options = window[$form.data("dformVariable")];
		$form.dform(options).addClass("form dform");

		form($form, {
			mustHideLabelsForMobile: typeof options.mustHideLabelsForMobile == "undefined" ? true : options.mustHideLabelsForMobile
		});

		if ($.isFunction(options.postRender)) {
			options.postRender($form);
		}

		$(".form-multiCol").each(function () {
			$(this).children().matchHeight();
		});

		$form.bind("invalid-form.validate", function () {
			var $input = $form.find(".form-div-hidden input.error");

			if ($input.length && !$input.valid()) {
				$("[data-required-relation='name=" + $input.attr("name") + "']").show();
			}
		});
		if ($.viewport.isMobile()) {
			$form.find("input:text, textarea").attr({
				"autocorrect": "off",
				"autocomplete": "off"
			});
		}
		//check if form has Country dropdown and Phone textbox
		var $countryDropdown = $form.find("select").filter(function () {
			return this.name.toLowerCase() == "country";
		});
		var $phone = $form.find("input").filter(function () {
			return this.name.toLowerCase() == "phone";
		});
		if ($countryDropdown.length && $phone.length && !$phone.data("noMaskedInput")) {
			$countryDropdown.on("change", onCountryDropdownChange);
			onCountryDropdownChange();

			function onCountryDropdownChange() {
				var validation = $phone.data("validation");
				var validationMessages = validation && validation.messages ? validation.messages : {};
				var $selected = $(this).find(":selected");
				var rules = {messages: {}};

				if ($phone.rules().pattern) {
					$phone.rules("remove", "pattern");
				}

				var phoneFormat = $selected.data("PhoneFormat");
				if (typeof phoneFormat !== "undefined" && phoneFormat.length) {
					$phone.mask(phoneFormat.replace(/[^-)(]/g, "9"), {autoclear: false});
					rules.pattern = new RegExp(phoneFormatToPattern(phoneFormat));
					rules.messages.pattern = validationMessages.pattern ? validationMessages.pattern.replace("{PhoneFormat}", phoneFormat) : "";
				} else {
					rules.pattern = new RegExp("^[\\d-]+$");
					rules.messages.pattern = validationMessages.numbersOnly || "";
					$phone.unmask().val($phone.val().replace(/[-_]/g, ""));
				}

				if (rules.messages.pattern.length !== 0) {
					$phone.rules("add", rules);
				}
				$phone.hasClass("error") && $phone.valid();
			}
		}

		function phoneFormatToPattern(phoneFormat) {
			var groups = phoneFormat.split("-");
			var pattern = "(^";
			for (var i = 0; i < groups.length; i++) {
				pattern += "\\d{" + groups[i].length + "}" + (groups.length == i + 1 ? "" : "-");
			}
			pattern += ")$";
			return pattern;
		}

		$form.trigger("dform.initialized");

		$form.find("select").each(function () {
			var $select = $(this);
			$select.val() != null && $select.val().length && $select.trigger("change");
		});
	});
}
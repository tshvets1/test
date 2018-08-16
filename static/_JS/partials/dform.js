$.dform.subscribe("ajax", function (options) {
	var $loader;
	var $submitButton;

	this.submit(function (e) {
		e.preventDefault();
		var $this = $(this);
		if (typeof $submitButton === "undefined") {
			$submitButton = $this.find(".form-submit");
			$loader = placeLoaderAfterSubmitButton($submitButton);
		}

		var isValid = $this.valid() && ($.isFunction(options.checkValid) ? options.checkValid($this) : true);
		if (isValid) {
			$this.find("input[name='ScreenResolution']").val(screen.width + "x" + screen.height);
			$this.find("input[name='GoogleGUID']").val($("#sfGoogleGUID").val());
			$.ajax({
				url: options.url,
				type: options.type,
				contentType: "application/x-www-form-urlencoded",
				data: $.isFunction(options.getData) ? options.getData($this).data : $this.serialize(),
				beforeSend: function () {
					$submitButton && $submitButton.attr("disabled", "disabled");
					$loader && $loader.removeClass("hidden");
					$.isFunction(options.beforeSend) ? options.beforeSend($this) : window[options.beforeSend];
				},
				success: function (data, result, response) {
					if ((typeof googleTagManagerDataLayer != "undefined") && data && data.Status && data.Analytics) {
						var aData = {
							"idCookie": data.Analytics.CookieId,
							"idLead": data.Analytics.LeadId,
							"event": data.Analytics.AnalyticsEventName,
							"visitor-id": data.Analytics.VisitorId
						};
						googleTagManagerDataLayer.push(aData);
					}
					$.isFunction(options.success) ? options.success($this, data, response) : window[options.success];
					if (response.getResponseHeader("CUSTOM_REDIRECT")) {
						window.location = response.getResponseHeader("CUSTOM_REDIRECT");
					} else {
						onComplete($this);
					}
				},
				error: function (data) {
					onComplete($this);
					$.isFunction(options.error) ? options.error($this, data.d) : window[options.error];
				},
				complete: function () {
					$.isFunction(options.complete) ? options.complete($this) : window[options.complete];
				}
			});
		}
	});

	function onComplete($form) {
		$submitButton && $submitButton.attr("disabled", "");
		$loader && $loader.addClass("hidden");
		$form.parent().hide();
		var $dialog = $form.parents(".ui-dialog");
		$form.closest(".gain-custom-form-bg").find(".response-wrapper").show();

		if ($dialog.length) {
			$dialog.scrollToElement();
		} else {
			$form.closest(".section-wrapper").scrollToElement();
		}
	}

	function placeLoaderAfterSubmitButton($submitButton) {
		var $loader = $submitButton.closest(".gain-custom-form-bg").find(".loading-wrapper").addClass("hidden");
		$submitButton.before($loader);
		$loader.parent().addClass("has-spinner");

		return $loader;
	}
});

//requires for related validations
$.dform.subscribe("action", function (options) {
	this.attr("action", options);
	this.submit(function (e) {
		var $this = $(this);
		var isValid = $this.valid() && ($.isFunction(options.checkValid) ? options.checkValid($this) : true);
		if (!isValid) {
			e.preventDefault();
		} else {
			$this.find("input[name='ScreenResolution']").val(screen.width + "x" + screen.height);
			$this.find("input[name='GoogleGUID']").val($('#sfGoogleGUID').val());
		}
	})
});

$.dform.subscribe("label", function (caption) {
	this.after($("<label class='form-label'/>").attr("for", this.attr("id") || this.attr("name")).html(caption));
});

$.dform.addType("tel", function (options) {
	var $generated = $("<input type='tel' />").dform("attr", options);
	$generated.data({
		validation: options.validate || {},
	});

	return $generated;
});

$.dform.subscribe("type", function (option, type) {
	if (type == "hidden") {
		this.closest(".form-div").hide();
	}
});

$.dform.subscribe("hideByCookie", function (option) {
	var options = option.split(',');
	for (var i = 0; i < options.length; i++) {
		if (cookies().get(options[i]).length) {
			this.closest(".form-div").hide();
		}
	}
});

$.dform.subscribe("navigate", function (url) {
	var $form = this.closest("form");
	var beforeNavigate = window[$form.data("dformVariable")].beforeNavigate;
	if ($.isFunction(beforeNavigate)) {
		beforeNavigate(this.data("target"), function () {
			redirect();
		});
	} else {
		redirect();
	}

	function redirect() {
		location.href = url;
		//$form.addClass("disable");
	}
});

$.dform.subscribe("dropdown", function (options) {
	var self = this;

	if (typeof options.options == "string") {
		$.getJSON(options.options).done(function (data) {
			options.options = data;
			createDropDown(options);
		});
	} else {
		createDropDown(options);
	}

	function createDropDown(options) {
		if (typeof options.label != "undefined") {
			var $label = $("<label>").addClass("form-label for-select").text(options.label);
			self.append($label);
		}

		var $select = createSelect(options);
		self.append($select);

		$select.chosenSelect(options.chosenOptions);

		if (options.validate) {
			$select.dform("run", "validate", options.validate);
		}

		if (options.updateDependencyOnChange) {
			$select.change(function () {
				$select.closest("form")
					.find("[name='" + options.updateDependencyOnChange.inputName + "']")
					.val($select.find(":selected").data(options.updateDependencyOnChange.data));
			});
		}

		if (options.conditions) {
			var conditionClass = "dropdown-condition-" + options.name.replace(/#| |\./g, "_");
			$select.change(function () {
				var $this = $(this);
				$this.closest("form").children("." + conditionClass).remove();
				var $group = $this.closest(".form-div");
				var $conditionGroup = $.dform.createElement({type: "div"})
					.addClass("form-div " + conditionClass).css("display", "none")
					.data("target", $select);
				var value = $this.val();
				var property = "default";

				if ((!options.conditions[value] || !options.conditions[value].navigate)
					&& (!options.conditions["default"] || !options.conditions["default"].navigate)) {
					$this.trigger("changed.dform.no-navigate");
				}

				if (options.conditions[value]) {
					property = value;
				} else if (!options.conditions["default"]) {
					return;
				}

				$group.after($conditionGroup);
				$conditionGroup.dform("run", options.conditions[property]);
				if (!options.conditions[property].navigate) {
					$conditionGroup.css("display", "");
				}
				$conditionGroup.find("select, input:not(:checkbox,:radio,[type=hidden]), textarea").hideLabelOnMobile();
				$this.closest("[data-function=matchHeights]").children().matchHeight();
			});
		}

		if (options.defaultValue) {
			$select.trigger("change");
		}
	}

	function createSelect(options) {
		var $select = $.dform.createElement({
			type: "select",
			"data-placeholder": options.placeholder,
			name: options.name,
			id: options.id || options.name
		}).addClass("form-select custom-select");

		if (options.options) {
			$.each(options.options, function () {
				var self = this;
				var valuePropertyName = "Value";
				if (options.valuePropertyName) {
					valuePropertyName = options.valuePropertyName;
				}
				var $option = $("<option>").attr("value", self[valuePropertyName] || "").text(self.Name);
				if (self[valuePropertyName] == options.defaultValue) {
					$option.attr("selected", "selected");
				}
				for (var property in self) {
					if (self.hasOwnProperty(property) && property != "Value" && property != "Name") {
						if (property.toLowerCase() == "isplaceholder") {
							$option.attr({
								"disabled": "disabled",
								"value": "",
								"selected": "selected"
							}).parent().attr("data-placeholder", self.Name);
						} else {
							$option.data(property, self[property]);
						}
					}
				}
				$select.append($option);
			});
		}

		return $select;
	}
});

$.dform.subscribe("validateRelated", function (option) {
	this.attr("data-validate-related", "true");
	$("[data-required-relation='name=" + $(this).attr("name") + "']").data("errorMessageRelated", option).text(option);
});

$.dform.addType("multiCol", function (options) {
	return $("<div>").addClass("multi-col__content").attr({
		"data-columns": options.columns,
		"data-match-height": false
	});
});

$.dform.addType("buttonSubmit", function (options) {
	return $("<button>").addClass("form-submit").attr("type", "submit").text(options.value);
});

$.dform.subscribe("inputMask", function (mask, type) {
	this.mask(mask, {autoclear: false});
});

$.dform.subscribe("cols", function (options, type) {
	if (type == "multiCol") {
		var $this = $(this);
		$.each(options, function () {
			var $col = $("<div>").addClass("col");
			$this.append($col);
			$col.dform("run", {
				html: this
			});
		});
	}
});

$.dform.options.prefix = "form-";
define("currencyConverter", ["knockout", "knockout-extenders", "knockout-helpers"], function (ko) {
	return function ($element, initializeData) {
		var self = this;

		$element.on("chosen:ready", "select", function (e, params) {
			var baseResultAddOption = params.chosen.result_add_option.bind(params.chosen);

			params.chosen.result_add_option = function (option) {
				var optionHtml = baseResultAddOption(option);

				if (optionHtml.length > 0) {
					var $optionHtml = $(optionHtml);
					$optionHtml.html(createItem(option, $optionHtml.html()));
					optionHtml = $optionHtml[0].outerHTML;
				}
				return optionHtml;
			};

			params.chosen.single_set_selected_text = function (text) {
				if (text == null) {
					text = this.default_text;
				}
				if (text === this.default_text) {
					this.selected_item.addClass("chosen-default");
				} else {
					this.single_deselect_control_build();
					this.selected_item.removeClass("chosen-default");
					text = createItem(this.results_data[this.current_selectedIndex], text);
				}
				return this.selected_item.find("span").html(text);
			};

			function createItem(data, text) {
				var $fragment = $(document.createDocumentFragment());
				var $flag = $("<b>").addClass("flag-medium med-" + data.text.toLowerCase());
				var $text = $("<div>").addClass("currency-converter__currency").html(text);
				var currencyFullName = self.currencies.findFirst(function (currency) {
					return currency.currency == data.value
				}).currencyFullName;
				var $fullText = $("<div>").addClass("currency-converter__currency-fullname")
					.text(currencyFullName);

				return $fragment.append($flag).append($text).append($fullText);
			}
		});
		$element.find("select").chosenSelect({
			width: "100%",
			"disable_search_threshold": 6
		});

		self.productsCache = ko.observableArray();
		self.pairs = {};

		self.currency = ko.observable();
		self.currencyOutput = ko.observable();

		self.currencies = ko.observableArray();
		self.currenciesOutput = ko.observableArray();

		self.amountInput = ko.observable(1).extend({numericWithCommas: createNumberWithCommas});

		self.amountOutput = ko.pureComputed({
			read: function () {
				var rate = getRate();
				var value = self.amountInput().toString();
				value = value.replace(/,/g, "");

				return createNumberWithCommas((value * rate).toFixed(5));
			},
			write: function (value) {
				value = parseFloat(value.replace(/,/g, ""));
				var rate = getRate();
				var inputResult = (value / rate).toFixed(5);
				self.amountInput(inputResult);
			},
			owner: this
		});

		self.currency.subscribe(function (newValue) {
			if (!self.pairs[newValue]) {
				self.pairs[newValue] = {
					currencies: getOutputCurrencies(self.productsCache(), newValue)
				};
			}
			self.currenciesOutput([]);
			self.currenciesOutput(self.pairs[newValue].currencies);
			self.currencyOutput(self.pairs[newValue].currencies[0].currency);
		});

		self.afterAddCurrencies = function (option, currency) {
			afterAddCurrencies(option, currency, function () {
				return self.currencies().indexOf(currency) == self.currencies().length - 1;
			});
		};

		self.afterAddCurrenciesOutput = function (option, currency) {
			afterAddCurrencies(option, currency, function () {
				return self.currenciesOutput().indexOf(currency) == self.currenciesOutput().length - 1;
			});
		};

		function afterAddCurrencies(option, currency, expression) {
			var $option = $(option);
			$option.attr("data-currency-full-name", currency.currencyFullName);
			if (expression()) {
				$option.closest("select").trigger("chosen:updated");
			}
		}

		function createNumberWithCommas(x) {
			var parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}

		getData();
		function getData() {
			if (self.timeoutId) {
				clearTimeout(self.timeoutId);
			}
			$.get("/_JS/data/dummy/rates.json")
				.done(function (data) {
					data = data.d || [];
					self.productsCache(data);

					if (!self.currencies().length) {
						self.currencies(getUniqueCurrencies(data));
					}
					self.timeoutId = setInterval(getData, initializeData.getProductsTimeout);
				});
		}

		function getUniqueCurrencies(data) {
			var currencies = [];
			var currenciesSet = {};
			$.each(data, function () {
				var tempCurrencies = this.Product.split("/");
				currencies.push(tempCurrencies[0]);
				currencies.push(tempCurrencies[1]);
				currenciesSet[tempCurrencies[0]] = this.CounterCurrency;
				currenciesSet[tempCurrencies[1]] = this.ContractCurrency;
			});

			return ko.utils.arrayMap(ko.utils.arrayGetDistinctValues(currencies).sort(), function (item) {
				return new Currency(item, currenciesSet[item]);
			});
		}

		function getOutputCurrencies(products, baseCurrency) {
			var currencies = [];
			$.each(products, function () {
				var tempCurrencies = this.Product.split("/");
				if (tempCurrencies[0] == baseCurrency) {
					currencies.push(new Currency(tempCurrencies[1], this.ContractCurrency, this.Product));
				} else if (tempCurrencies[1] == baseCurrency) {
					currencies.push(new Currency(tempCurrencies[0], this.CounterCurrency, this.Product, true));
				}
			});
			return currencies.sort(function (left, right) {
				return left.currency == right.currency ? 0 : (left.currency < right.currency ? -1 : 1)
			});
		}

		function getRate() {
			var currency = self.currenciesOutput.findFirst(function (item) {
				return item.currency == self.currencyOutput();
			});

			if (!currency) {
				return 0;
			}

			var rate = self.productsCache.findFirst(function (product) {
				return product.Product == currency.pair;
			});
			return currency.reverseDirection ? 1 / rate.Offer : rate.Bid;
		}
	};

	function Currency(currency, currencyFullName, pair, reverseDirection) {
		var self = this;

		self.currency = currency;
		self.currencyFullName = currencyFullName;
		self.reverseDirection = reverseDirection || false;
		self.pair = pair;
	}
});
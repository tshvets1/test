define("marginPipCalculator", ["knockout", "baseProduct", "knockout-helpers", "knockout-extenders"], function (ko, BaseProduct) {
    return function ($element, initializeData) {
        var self = this;

        self.products = ko.observableArray();
        self.filteredProducts = ko.observableArray();
        self.productsCache = [];
        self.ratesCache = {};

        //consider as mainCurrency
        self.baseCurrency = ko.observable(initializeData.defaultBaseCurrency);
        self.baseCurrency.subscribe(function () {
            getData();
        });

        self.currencyGroupValue = ko.observable(initializeData.defaultCurrencyGroupValue);
        self.currencyGroupValue.subscribe(function (newValue) {
            self.products([]);
            filterAndUpdateData(self.productsCache, newValue.split(","));
        });

        self.leverage = ko.observable(initializeData.defaultLeverage);

        self.afterAddProduct = function (element) {
            var $element = $(element);
            $element.filter(":nth-child(odd)").addClass("nth-child-odd");
            var $dropdown = $element.find("select");
            if ($dropdown.length) {
                $dropdown.chosenSelect();
                var context = ko.contextFor(element).$data;
                context.contractSize(context.minTradeSize());
            }
            $element.find(".tooltip").applyTooltip({ maxWidth: 140 });
        };

        var $tableBody = $element.find(".margin-pip-calculator__table tbody");

        $(window).on("resize:width", function () {
            updateTable();
        });

        function updateTable() {
            if ($.viewport.isMobile()) {
                var tableWidth = 0;
                $tableBody.children().each(function () {
                    tableWidth += $(this).width();
                });

                $tableBody.css("width", tableWidth + "px");
            } else {
                $tableBody.css("width", "");
            }
        }

        getData(updateTable);

		var index = "";

        function getData(callback) {
            if (self.timeoutId) {
                clearTimeout(self.timeoutId);
            }

			index = index == "" ? "2" : index == "2" ? "3" : "";

			$.get("/_JS/data/dummy/margin_pip_calculator" + index + ".json?" + self.baseCurrency())
				.done(function (data) {
                $.each(data, function () {
                    self.ratesCache[this.Quote] = this.BidRate;
                });
                self.productsCache = data;

                filterAndUpdateData(data, self.currencyGroupValue().split(","));

                self.timeoutId = setTimeout(getData, initializeData.getProductsTimeout);

                callback && callback();
            });
        }

        function filterAndUpdateData(data, filter) {
            var tempProducts = [];

            var filteredData = $.grep(data, function (item) {
                return filter.indexOf(item.Quote) !== -1;
            });

            for (var i = 0; i < filteredData.length; i++) {
                if (self.products().length < filteredData.length) {
                    tempProducts.push(new ProductModel(filteredData[i], self));
                } else {
                    self.products()[i].updateModel(filteredData[i]);
                }
            }

            if (tempProducts.length) {
                self.products(tempProducts);
            }
        }
    };

    function ProductModel(data, parent) {
        var self = this;

        self.product = new BaseProduct(data.Quote);
        self.alias = ko.observable(data.Alias);

        self.bid = ko.observable(Math.round(data.BidRate * 10000) / 10000);
        self.bid_prev = ko.observable(self.bid());

        self.minLeverage = ko.observable(data.MinLeverage);
        self.showLeverageTooltip = ko.observable(false);

        self.valueOfLeverage = ko.computed(function () {
            var leverage = Math.round(100 / parseFloat(parent.leverage()));
            if (!self.minLeverage() || leverage > self.minLeverage()) {
                self.showLeverageTooltip(false);
            } else {
                leverage = self.minLeverage();
                self.showLeverageTooltip(true);
            }
            return leverage;
        });
        self.leverage = ko.computed(function () {
            return (Math.round((100 / self.valueOfLeverage()) * 100) / 100) + ":1";
        });

        self.minTradeSize = ko.observable(data.MicroTradeSize);
        self.contractSize = ko.observable(data.MicroTradeSize);

        self.valueOfPip = ko.observable(parseFloat(data.ValueOfaPip) / data.MiniTradeSize);
        self.pip = ko.computed(function () {
            return self.valueOfPip() * self.contractSize();
        }).extend({ numeric: 2 });

        self.requiredMargin = ko.computed(function () {
            //({BASE} / {Main Currency}) * units) / (margin ratio)

            var conversionRate;
            var quoteLeftCurrency = data.Quote.substr(0, 3);
            var quoteRightCurrency = data.Quote.substr(4, 3);
            var pairLeftCurrency = data.Pair.substr(0, 3);
            var pairRightCurrency = data.Pair.substr(4, 3);
            var interRate;

            if (quoteLeftCurrency === parent.baseCurrency()) {
                conversionRate = 1;
            } else if (quoteRightCurrency === parent.baseCurrency()) {
                conversionRate = self.bid();
            } else if (data.Quote !== data.Pair) {
                interRate = parent.ratesCache[data.Pair];
                var currency = pairRightCurrency;

                // if no rate available for pair get [quote] rate					
                if (!interRate || quoteLeftCurrency !== pairLeftCurrency) {
                    interRate = parent.ratesCache[data.Quote];
                    currency = quoteRightCurrency;
                }

                conversionRate = interRate * getRate(currency, parent.baseCurrency(), parent.ratesCache);
            } else {
                conversionRate = getRate(pairLeftCurrency, parent.baseCurrency(), parent.ratesCache);
            }

            return conversionRate * self.contractSize() * self.valueOfLeverage() / 100;
        }).extend({ numeric: 2 });

        self.updateModel = function (data) {
            self.bid_prev(self.bid());
            self.bid(Math.round(data.BidRate * 10000) / 10000);
            self.valueOfPip(parseFloat(data.ValueOfaPip) / data.MiniTradeSize);
        };

        /**
         * Returns Rate for pair in format LeftCurrency/RightCurrency
         * if this pair doesn't exists in rates then returns
         * 1 / RightCurrency/LeftCurrency
         * 
         * In case there is no LeftCurrency/RightCurrency 
         * it CommonCurrency will be found and return value will be calculated the following way:
         * LeftCurrency/CommonCurrency * CommonCurrency/RightCurrency
         */
        function getRate(leftCurrency, rightCurrency, rates) {
            var rate = getRateFlip(leftCurrency, rightCurrency, rates);

            if (isNaN(rate)) {
                var ratesWithLeft = getPairCurrencies(leftCurrency, rates);
                var ratesWithRight = getPairCurrencies(rightCurrency, rates);
                var commonCurrency;

                //search for interraction between leftCurrency/commonCurrency and commonCurrency/rightCurrency
                for (var i = 0; i < ratesWithLeft.length; i++) {
                    if (ratesWithRight.indexOf(ratesWithLeft[i]) >= 0) {
                        commonCurrency = ratesWithLeft[i];
                        break;
                    }
                }
                if (commonCurrency) {
                    //get rate by multiplying leftCurrency/commonCurrency * commonCurrency/rightCurrency
                    rate = getRateFlip(leftCurrency, commonCurrency, rates) * getRateFlip(commonCurrency, rightCurrency, rates);
                }
            }
            return rate;
        }

        /**
         * Returns Rate for pair in format LeftCurrency/RightCurrency
         * if this pair doesn't exists in rates then returns
         * 1 / RightCurrency/LeftCurrency
         */
        function getRateFlip(leftCurrency, rightCurrency, rates) {
            var rate = rates[leftCurrency + "/" + rightCurrency];
            if (!rate) {
                rate = 1 / rates[rightCurrency + "/" + leftCurrency];
            }

            return rate;
        }

        /**
         * Get pair currencies for Currency
         */
        function getPairCurrencies(currency, rates) {
            var result = [];

            Object.keys(rates).forEach(function (key) {
                var currencies = key.split("/");
                var index = currencies.indexOf(currency);
                if (index >= 0) {
                    result.push(currencies[index === 0 ? 1 : 0]);
                }
            });

            return result;
        }
    }
});
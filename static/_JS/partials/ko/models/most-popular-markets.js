define("mostPopularMarkets", ["knockout", "baseProduct", "knockout-helpers"], function (ko, BaseProduct) {
	return function ($element, initializeData) {
		var self = this;
		var $contentWrapper = $element.find(".most-popular-markets__tabs-content-wrapper");

		initializeData.tabsOptions.forEach(function (tabOptions) {
			var data = tabOptions.isLive ? [] : tabOptions.staticData || window[tabOptions.dataVariable];
			self[tabOptions.tabName] = new TabProducts(data, $.extend({}, tabOptions, {
				keepSortOrder: initializeData.keepSortOrder
			}), self);
		});

		self.isMobile = ko.observable($.viewport.isMobile());

		var index = "";

		function getData() {
			if (self.timeoutId) {
				clearTimeout(self.timeoutId);
			}

			index = index == "" ? "2" : "";
			$.ajax("/_JS/data/dummy/most-popular-markets" + index + ".json?productType=" + self[self.currentTab()].marketType, {
				type: "GET",
				dataType: 'json',
				success: function (data) {
					//set tempProducts if is empty
					data = data.d;
					var tempProducts = data;
					if (self[self.currentTab()].productsCache().length) {
						tempProducts = self[self.currentTab()].productsCache();
					}

					//set prev spread
					for (var i = 0; i < data.length; i++) {
						var product = data[i];
						product.product = new BaseProduct(product.Product);

						for (var key in product) {
							if (product.hasOwnProperty(key)) {
								product[key + "_prev"] = tempProducts[i][key];
							}
						}
					}

					self[self.currentTab()].update(data);
					$element.find(".most-popular-markets__table tr:nth-child(odd)").addClass("nth-child-odd");
					self.timeoutId = setTimeout(getData, initializeData.getProductsTimeout);
				}
			});
		}

		self.currentTab = ko.observable(initializeData.currentTab);

		if (self[initializeData.currentTab].isLive) {
			getData();
		}

		self.changeTab = function (newTab, data, event) {
			event.preventDefault();

			//if it's the same tab do nothing
			if (newTab === self.currentTab()) {
				return;
			}

			clearTimeout(self.timeoutId);
			$contentWrapper.fadeOutIn(function () {
				self.currentTab(newTab);
				if (self[newTab].isLive) {
					getData();
				}
			}, 500);
		};

		$(window).on("resize:device", function () {
			self.isMobile($.viewport.isMobile());
		});
	};

	function TabProducts(products, initializeData, parent) {
		var self = this;

		var defaultProducts = initializeData.defaultProducts;
		self.filterBy = initializeData.filterBy || "Product";
		self.productsCache = ko.observableArray(products);
		self.isLive = initializeData.isLive;
		self.marketType = initializeData.marketType;
		self.productType = initializeData.productType;
		self.viewAll = ko.observable(false);

		self.products = ko.computed(function () {
			if (self.viewAll()) {
				return self.productsCache().concat().sort(function (left, right) {
					return left.Product === right.Product ? 0 : (left.Product < right.Product ? -1 : 1);
				});
			} else {
				var result = self.productsCache().filter(function (product) {
					return defaultProducts.indexOf(product[self.filterBy]) !== -1;
				});
				if (initializeData.keepSortOrder) {
					var temp = [];
					for (var i = 0; i < result.length; i++) {
						temp[defaultProducts.indexOf(result[i][self.filterBy])] = result[i];
					}
					result = temp;
				}
				return result;
			}
		});
		self.productsAmountInColumn = ko.computed(function () {
			return Math.ceil(self.products().length / initializeData.tables);
		});

		self.products1 = ko.pureComputed(function () {
			var startIndex = 0;
			return parent.isMobile() ?
				self.products()
				: self.products().slice(startIndex, startIndex + self.productsAmountInColumn());
		});
		self.products2 = ko.pureComputed(function () {
			var startIndex = self.productsAmountInColumn();
			return self.products().slice(startIndex, startIndex + self.productsAmountInColumn());
		});
		self.products3 = ko.pureComputed(function () {
			var startIndex = self.productsAmountInColumn() * 2;
			return self.products().slice(startIndex, startIndex + self.productsAmountInColumn());
		});

		self.update = function (products) {
			self.productsCache(products);
		};

		self.showAll = function (data, e) {
			self.viewAll(!self.viewAll());
			var $tables = $(e.currentTarget).closest(".most-popular-markets__tabs-content-wrapper").find(".most-popular-markets__table");
			$tables.find("tr").removeClass("nth-child-odd");
			$tables.find("tr:nth-child(odd)").addClass("nth-child-odd");
			$(e.currentTarget).closest(".most-popular-markets__tabs").scrollToElement();
		};
	}
});
define("pivotPoints", ["knockout", "knockout-helpers", "knockout-extenders"], function (ko) {
	return function ($element, initializeData) {
		var self = this;

		$element.find(".pivot-points__table tr:even").addClass("even");
		$element.find(".pivot-points__table tr:nth-child(even)").addClass("nth-child-even");
		var $header = $(".header");

		self.$element = $element;
		self.product = ko.observable();

		self.changingProduct = ko.observable(false);
		self.selectedProduct = ko.observable(initializeData.defaultProduct);
		self.selectedProduct.subscribe(function () {
			self.changingProduct(true);
			getData();
		});

		self.showTabPanel = function () {
			//176 = height
			$element.find(".tabs__panel").slideToggle({
				duration: 176,
				complete: function () {
					self.product().showDetails(!self.product().showDetails());
					$(this).css("display", "");
					$header.trigger("header:forceHide", function () {
						$element.scrollToElement(function () {
							$header.trigger("header:resetHide");
						});
					});
				},
				easing: "linear"
			});
		};

		getData();
		function getData() {
			$.ajax(
				"/_JS/data/dummy/pivot_data_" + self.selectedProduct().replace(/\//g, "_") + ".json", {
					type: "GET",
					//"/_Srvc/feeds/LiveRates.asmx/GetPivotPoints", {
					//	type: "POST",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify({
						siteId: initializeData.siteId,
						product: self.selectedProduct(),
						productType: initializeData.defaultProductType || "FX"
					}),
					dataType: "json",
					success: function (data) {
						data = data.d;
						if (data && data.length > 0) {
							self.product(new Product(self, data[0]));
							$element.find(".tooltip").applyTooltip();
						}
						self.changingProduct(false);
					},
					failure: function () {
						self.changingProduct(false);
						console.log("error");
					}
				});
		}
	};

	function Product(parent, product) {
		var self = this;

		self.currentTab = ko.observable("daily");
		self.currentTab.subscribe(function (newValue) {
			var tabData = self[newValue];
			parent.$element.find(".pivot-points__wrapper").fadeOutIn(function () {
				self.pivot(tabData.pivot());
				self.showDetails(tabData.showDetails);
			});
		});

		self.showDetails = ko.observable(false);
		self.showDetails.subscribe(function (newValue) {
			self[self.currentTab()].showDetails = newValue;
		});

		self.product = ko.observable(product.Quote);

		self.monthly = new DateCalculation(product.MonthlyHigh, product.MonthlyLow, product.MonthlyClose, product.Decimals || 2, product.MonthlyLastUpdatedDate);
		self.weekly = new DateCalculation(product.WeeklyHigh, product.WeeklyLow, product.WeeklyClose, product.Decimals || 2, product.WeeklyLastUpdatedDate);
		self.daily = new DateCalculation(product.DailyHigh, product.DailyLow, product.DailyClose, product.Decimals || 2, product.DailyLastUpdatedDate);

		self.lastUpdated = ko.observable(getFullDate(product.LastUpdated));

		self.pivot = ko.observable(self.daily.pivot());
		self.decimals = ko.observable(product.Decimals);

		self.bid = ko.observable(parseFloat(product.Bid)).extend({numeric: product.Decimals || 2});
		self.ask = ko.observable(parseFloat(product.Offer)).extend({numeric: product.Decimals || 2});

		self.distance = ko.computed(function () {
			return self.pivot() - self.bid.raw();
		}).extend({numeric: product.Decimals || 2});

		self.tabChanged = function (data, e, inheritedEvent) {
			var tab = $(inheritedEvent.currentTarget).data("tab");
			self.currentTab(tab);
		};
	}

	function DateCalculation(high, low, close, decimals, lastUpdated) {
		var self = this;

		self.showDetails = false;

		self.high = ko.observable(parseFloat(high)).extend({numeric: decimals});
		self.low = ko.observable(parseFloat(low)).extend({numeric: decimals});
		self.close = ko.observable(parseFloat(close)).extend({numeric: decimals});

		self.pivot = ko.computed(function () {
			return ((self.high.raw() + self.low.raw() + self.close.raw()) / 3);
		}).extend({numeric: decimals});

		self.r1 = ko.computed(function () {
			return 2 * self.pivot.raw() - self.low.raw();
		}).extend({numeric: decimals});

		self.s1 = ko.computed(function () {
			return 2 * self.pivot.raw() - self.high.raw();
		}).extend({numeric: decimals});

		self.r2 = ko.computed(function () {
			return self.pivot.raw() + self.r1.raw() - self.s1.raw();
		}).extend({numeric: decimals});

		self.s2 = ko.computed(function () {
			return self.pivot.raw() - (self.r1.raw() - self.s1.raw());
		}).extend({numeric: decimals});

		self.r3 = ko.computed(function () {
			return 2 * (self.pivot.raw() - self.low.raw()) + self.high.raw();
		}).extend({numeric: decimals});

		self.s3 = ko.computed(function () {
			return self.low.raw() - 2 * (self.high.raw() - self.pivot.raw());
		}).extend({numeric: decimals});

		self.lastUpdated = ko.observable(getFullDate(lastUpdated));
	}

	function getFullDate(currentDate) {
		var date = new Date(currentDate);

		var curr_hour = date.getHours();

		var a_p = curr_hour < 12 ? "AM" : "PM";

		if (curr_hour === 0) {
			curr_hour = 12;
		}
		if (curr_hour > 12) {
			curr_hour = curr_hour - 12;
		}
		if (curr_hour < 10) {
			curr_hour = "0" + curr_hour.toString();
		}

		var curr_min = date.getMinutes();
		if (curr_min < 10) {
			curr_min = "0" + curr_min.toString();
		}

		return $.datepicker.formatDate("DD, MM d, yy ", date) + curr_hour + ":" + curr_min + " " + a_p + " EST";
	}
});
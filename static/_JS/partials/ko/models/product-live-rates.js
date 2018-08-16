define("productLiveRates", ["knockout", "knockout-helpers", "knockout-extenders"], function (ko) {
		return function ($element, initializeData) {
			var self = this;
			var $chartWrapper = $element.find(".product-summary-banner__data");
			var $body = $("body");

			self.currentTab = ko.observable(initializeData.defaultTab);
			$body.trigger("product-summary:changeTab", initializeData.defaultTab);
			self.currentTab.subscribe(function (currentTab) {
				/*$body.trigger("product-summary:changeTab", currentTab);
				getData(true);*/
				location.href = $.updateQueryString("product-type", currentTab, location.href);
			});

			self.product = ko.observable(initializeData.product);
			self.ratesInfo = {
				sell: ko.observable(),
				buy: ko.observable(),
				high: ko.observable(),
				low: ko.observable(),
				change: ko.observable(),
				changeOld: ko.observable(),
				changePercent: ko.observable(),
				changePercentOld: ko.observable(),
				decimals: ko.observable(0)
			};

			self.ratesInfo.change.subscribeChanged(function (newValue, oldValue) {
				self.ratesInfo.changeOld(oldValue);
			});

			self.ratesInfo.changePercent.subscribeChanged(function (newValue, oldValue) {
				self.ratesInfo.changePercentOld(oldValue);
			});

			self.ratesInfo.sellMoving = ko.observable(0);
			self.ratesInfo.buyMoving = ko.observable(0);

			self.activeTab = ko.observable(0);
			self.isProductDetailsVisible = ko.observable(false);

			self.ratesInfo.sellBuyDiff = ko.computed(function () {
				return (self.ratesInfo.buy() - self.ratesInfo.sell()).toFixed(2);
			});

			self.ratesInfo.isFadeVisible = ko.observable(true);

			self.changeTab = function (currentTab, data, event) {
				event.preventDefault();
				self.currentTab(currentTab);
			};

			self.showDetail = function (data, event) {
				event.preventDefault();
				var $this = $(event.currentTarget);
				$body.trigger("product-summary:toggle", {
					state: $this.hasClass("active"),
					tab: self.currentTab()
				});
				$this.toggleClass("active");
			};

			getData();
			function getData(shouldFadeIn) {
				self.ratesInfo.isFadeVisible(false);

				if (self.idInterval != undefined && self.idInterval != null) clearInterval(self.idInterval);

				$.ajax("/_JS/data/dummy/product-live-rates1.json", {
					data: JSON.stringify({
						siteId: initializeData.siteId,
						products: initializeData.product,
						productType: self.currentTab()
					}),
					type: "GET",
					dataType: 'json',
					success: function (data) {
						$chartWrapper.fadeOutIn(function () {
							var oldSell = self.ratesInfo.sell();
							var oldBuy = self.ratesInfo.buy();

							var newSell = (data.sell + Math.random()).toFixed(2);
							var newBuy = (data.buy + Math.random()).toFixed(2);

							self.ratesInfo.sellMoving(newSell - oldSell);
							self.ratesInfo.sell(newSell);
							self.ratesInfo.decimals(data.decimals);

							self.ratesInfo.buyMoving(newBuy - oldBuy);
							self.ratesInfo.buy(newBuy);

							self.ratesInfo.high((data.high + Math.random()).toFixed(2));
							self.ratesInfo.low((data.low + Math.random()).toFixed(2));

							self.ratesInfo.change((data.change + Math.random()).toFixed(2));
							self.ratesInfo.changePercent((data.changePercent + Math.random()).toFixed(2));

							self.ratesInfo.isFadeVisible(true);
						}, shouldFadeIn ? "slow" : 0);
						self.idInterval = setInterval(getData, initializeData.getProductTimeout);
					}
				});
			}
		};
	}
);

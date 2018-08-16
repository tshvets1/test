define(["knockout", "product", "knockout-helpers", "knockout-extenders"], function (ko, Product) {
	function MostActiveMarketsProduct(data, rank, previousRank) {
		Product.apply(this, arguments);

		var self = this;

		self.rank = ko.observable(rank);
		self.rankChange = ko.observable();
		self.rankDirection = ko.observable();
		self.previousRank = ko.observable(previousRank);

		self.rank.subscribeChanged(function (newValue) {
			var change = newValue - self.previousRank();
			self.rankDirection(change < 0 ? "up" : "down");
			self.rankChange(change === 0 ? "" : Math.abs(change));
		});

		self.change = ko.observable(data.Volatility.toFixed(2));
	}

	MostActiveMarketsProduct.prototype = Object.create(Product);
	MostActiveMarketsProduct.prototype.constructor = MostActiveMarketsProduct;

	MostActiveMarketsProduct.prototype.update = function (data, currentRank){
		Product.prototype.update.apply(this, arguments);
		this.change(data.Volatility.toFixed(2));
		this.previousRank(this.rank());
		this.rank(currentRank);
	};

	function createSelect($ul, activeTab) {
		var $select = $("<select>").addClass("custom-select most-active-markets__tabs-select");

		$.each($ul.find(".most-active-markets__tabs-link"), function () {
			var $item = $(this);
			var $option = $("<option>");
			$option.text($item.text()).attr("data-tab", $item.data("tab"));
			if ($item.data("tab") === activeTab) {
				$option.attr("selected", "selected");
			}
			$select.append($option);
		});

		return $select;
	}

	return function ($element, initializeData) {
		var self = this;
		var ANIMATION_DURATION = 800;

		self.products = ko.observableArray();
		var $contentWrapper = $element.find(".most-active-markets__tabs-content");
		var $tabsList = $element.find(".most-active-markets__tabs-list");
		var $activeItem = $tabsList.find(".most-active-markets__tabs-link.active");
		var currentTab = $activeItem.data("tab");

		if (!$activeItem.data("tab")) {
			currentTab = 3; //15 mins default for hero module
		}

		self.maxProducts = initializeData.products.length;//this is to know how many products we need to display when tab changes
		var isMoveRows = initializeData.moveRows;
		//var isMoveRows = false;

		var $select = createSelect($tabsList, currentTab);
		$tabsList.after($select);

		$select.on("change", function (event) {
			var selectedTab = $(event.currentTarget).find(":selected").data("tab");
			$tabsList.find("[data-tab='" + selectedTab + "']").trigger("click");
		});

		var index = "";
		var isFirstLoad = true;

		function getData(shouldFadeIn, clearRanks) {
			if (self.timeoutId) {
				clearTimeout(self.timeoutId);
				initializeData.products = [];// this is for ajax service to know need fresh set of products when tab changes
			}

			clearRanks = clearRanks === true;
			if (clearRanks) {
				self.products([]);
			}

			if (clearRanks || index === "3" || index === "4") {
				index = index === "3" ? "4" : "3";
			}
			else {
				index = index === "" ? "2" : "";
			}
			$.ajax("/_JS/data/dummy/most-active-markets" + index + ".json?" + currentTab, {
				/*$.ajax("/_Srvc/feeds/LiveRates.asmx/GetFacadeBigMoversData", {
				 type: "POST",
				 contentType: 'application/json; charset=utf-8',
				 data: JSON.stringify({ siteId: initializeData.siteId, interval: currentTab, products: initializeData.products }),*/
				dataType: 'json',
				success: function (data) {
					data = data.d;

					if (clearRanks || index === "3" || index === "4") {
						data = data.slice(0, self.maxProducts);//this is to take that many products from the list
					}

					$contentWrapper.fadeOutIn(function () {
						var tempProducts = [];
						var i;

						var volatilitiesArray = data.slice();
						volatilitiesArray.sort(function (left, right) {
							var leftChange = parseFloat(left.Volatility);
							var rightChange = parseFloat(right.Volatility);
							return leftChange === rightChange ? 0 : (leftChange > rightChange ? -1 : 1);
						});

						if (clearRanks || isFirstLoad) {
							data = volatilitiesArray.slice();
							isFirstLoad = false;
						}

						for (i = 0; i < volatilitiesArray.length; i++) {
							if (self.products().length < volatilitiesArray.length) {
								tempProducts.push(new MostActiveMarketsProduct(volatilitiesArray[i], i + 1, "")); //this is to avoid second column ranking for fresh set
							} else {
								var product = self.products.findFirst(function (product) {
									return product.product == volatilitiesArray[i].Product;
								});

								product.update(volatilitiesArray[i], i + 1);
								tempProducts.push(product);
							}
							if (clearRanks) {
								initializeData.products.push(volatilitiesArray[i].Product);//this is to add new set of products for further rate updates after tab changes
							}
						}

						//build list sorted by previous rank value
						tempProducts.sort(function (left, right) {
							var leftChange = left.previousRank();
							var rightChange = right.previousRank();
							return leftChange === rightChange ? 0 : (leftChange > rightChange ? 1 : -1);
						});

						self.products(tempProducts);
						if (!clearRanks && isMoveRows) {
							moveRows();
						}

						self.timeoutId = setTimeout(getData, initializeData.getProductsTimeout);

						if (isMoveRows) {
							var $trs = $contentWrapper.find("tr");
							for (i = 2; i < $trs.length; i++) {
								var $tr = $trs.eq(i);
								var index = $tr.find("[data-bind='text: rank']").text();
								$tr.toggleClass("odd", index % 2 === 0);
								$tr.toggleClass("even", index % 2 === 1);
							}
							$contentWrapper.css("min-height", tempProducts.length * $trs.eq(2).height() + $trs.eq(0).height());
						}
					}, shouldFadeIn ? "slow" : 0);
				},
				failure: function () {
					console.log('error');
				}
			});
		}

		getData();

		self.changeTab = function (data, event) {
			event.preventDefault();

			var $this = $(event.currentTarget);

			if (event.type === "change") {
				$this = $this.find(":selected");
			}

			//if it's the same tab do nothing
			if ($this.data("tab") === currentTab) {
				return;
			}

			currentTab = $this.data("tab");
			$tabsList.find("li > a").removeClass("active");
			$this.closest("li > a").addClass("active");
			$select.find("[data-tab='" + currentTab + "']").attr("selected", "selected").siblings().removeAttr("selected");
			getData(true, true);
		};

		function moveRows() {
			var $table = $element.find(".active-markets__table");
			var $trs = $table.find("tr");
			var $headerRow = $trs.eq(0);
			$headerRow.addClass("odd");
			var headerHeight = Math.ceil(parseFloat($headerRow.height()));
			headerHeight += Math.ceil(parseFloat($headerRow.css('borderBottomWidth'))) || 0;
			var $tr;
			//2 - because spinner is the 2nd row
			if ($trs.length > 2) {
				var defaultRowHeight = Math.ceil(parseFloat($trs.eq(2).height()));
				for (var i = 2; i < $trs.length; i++) {
					$tr = $trs.eq(i);
					var index = $tr.find("[data-bind='text: rank']").text();
					var oldOffset = parseInt($tr.css("top"));
					$tr.css("position", "absolute");
					var newOffset = (index - 1) * defaultRowHeight + headerHeight;
					if (newOffset === oldOffset) {
						continue;
					}
					if (isNaN(oldOffset) || index == i) {
						$tr.css("top", newOffset);
					} else {
						$tr.css("top", (i - 1) * defaultRowHeight + headerHeight);
						$tr.animate({top: newOffset}, ANIMATION_DURATION);
					}
				}
			}
		}
	};
});
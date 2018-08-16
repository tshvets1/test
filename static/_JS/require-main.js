//////  CONFIGURATION OF REQUIRE JS ////////
(function () {
	if (typeof scriptsVersion === "undefined") {
		var scriptsVersion = "";
	} else {
		scriptsVersion = ".js?v=" + scriptsVersion;
	}
	require.config({
		baseUrl: "/_JS",
		paths: {
			"knockout": "library/knockout-3.3.0" + scriptsVersion,
			"knockout-helpers": "partials/ko/handlers" + scriptsVersion,
			"knockout-extenders": "partials/ko/extenders" + scriptsVersion,
			"scrollspy": "plugins/jquery.scrollspy" + scriptsVersion,
			"echarts": "plugins/echarts.min" + scriptsVersion,

            "baseProduct": "partials/ko/models/base-product" + scriptsVersion,
			"product": "partials/ko/models/product" + scriptsVersion,
			"productLiveRates": "partials/ko/models/product-live-rates" + scriptsVersion,
			"glossaryAlphabetBar": "partials/ko/models/glossary-alphabet-bar" + scriptsVersion,
			"themes": "partials/ko/models/themes" + scriptsVersion,
			"currentRates": "partials/ko/models/current-rates" + scriptsVersion,
			"mostActiveMarkets": "partials/ko/models/most-active-markets" + scriptsVersion,
			"bidAskBar": "partials/ko/models/bid-ask-bar" + scriptsVersion,
			"quoteBoard": "partials/ko/models/quote-board" + scriptsVersion,
			"swapRates": "partials/ko/models/swap-rates" + scriptsVersion,
			"clientSentiment": "partials/ko/models/client-sentiment" + scriptsVersion,
			"relatedMarkets": "partials/ko/models/related-markets" + scriptsVersion,
			"marginPipCalculator": "partials/ko/models/margin-pip-calculator" + scriptsVersion,
			"pivotPoints": "partials/ko/models/pivot-points" + scriptsVersion,
			"currencyConverter": "partials/ko/models/currency-converter" + scriptsVersion,
			"mostPopularMarkets": "partials/ko/models/most-popular-markets" + scriptsVersion,
			"search": "partials/ko/models/search" + scriptsVersion,

			"footerCommentForm": "partials/footer-comment-form" + scriptsVersion,

			"chart": "partials/charts/chart" + scriptsVersion,
			"horizontalBarChart": "partials/charts/horizontalBarChart" + scriptsVersion,
			"pieChart": "partials/charts/pieChart" + scriptsVersion,
			"tileChart": "partials/charts/tileChart" + scriptsVersion,
			"triangleChart": "partials/charts/triangleChart" + scriptsVersion,
			"verticalBarChart": "partials/charts/verticalBarChart" + scriptsVersion,
			"triangleChartView": "partials/charts/triangle/triangleView" + scriptsVersion,
			"viewportOptions": "partials/charts/viewportOptions" + scriptsVersion
		}
	});
//////  INITIALIZE KNOCKOUT HANDLERS WHEN KNOCKOUT FRAMEWORK AVAILABLE ////////
	$("[data-apply-ko]").each(function () {
		var $module = $(this);
		var initializeData = $.extend($module.data() || {}, {
			siteId: $("#SiteSpecificConfigId").val()
		});

		require(["knockout", $module.data("applyKo")], function (ko, module) {
			ko.applyBindings(new module($module, initializeData), $module[0]);
		});
	});

	var queryParams = window.location.search.slice(1).split("&");
	var workflowItemId;
	for (var i = 0; i < queryParams.length; i++) {
		var param = queryParams[i].split("=");
		if (param[0].toLowerCase() === "workflowitemid") {
			workflowItemId = param.length === 2 ? decodeURIComponent(param[1]) : "";
			break;
		}
	}
	if (workflowItemId && workflowItemId.length > 0) {
		require(["footerCommentForm"], function (footerCommentForm) {
			footerCommentForm(workflowItemId);
		});
	}

	if ($("[data-chart]").length) {
		require(["chart"], function (Chart) {
			$("[data-chart]").each(function () {
				var $this = $(this);
				var chartType = $this.data("chart");

				new Chart(chartType, $this);
			});
		});
	}
//////  /INITIALIZE PARTIALS & PLUGINS ////////
})();
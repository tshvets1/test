define(function () {
	return function (chartType, $chartSection) {
		var chartSelector = $chartSection.find("div[data-role='chart']")[0];
		var chartData = [];
		var $dataContainer = $chartSection.find("#chart-data");
		var $spinner = $chartSection.find(".spinner");
		var chartModuleName = "";

		if ($dataContainer.length) {
			for (var i = 0; i < $dataContainer.children().length; i++) {
				var $item = $dataContainer.children().eq(i);
				var title = $item.attr("data-type");
				var value = parseInt($item.attr("data-value"));
				var label = $item.attr("data-label");
				var color = $item.attr("data-color");
				var isMe = $item.attr("data-selected") == "true" || $item.attr("data-selected") == "True";

				var newRow = {Title: title, Label: label, Value: value, Color: color, IsMe: isMe};
				chartData.push(newRow);
			}
		}

		switch (chartType) {
			case "vertical":
				chartModuleName = "verticalBarChart";
				break;
			case "horizontal":
				chartModuleName = "horizontalBarChart";
				break;
			case "tile":
				chartModuleName = "tileChart";
				break;
			case "pie":
				chartModuleName = "pieChart";
				break;
			case "triangle":
				chartModuleName = "triangleChart";
				break;
		}

		require([chartModuleName], function (module) {
			var chart = new module(chartData, chartSelector);
			chart.draw(function () {
				$spinner.fadeOut();
			});
		});
	}
});
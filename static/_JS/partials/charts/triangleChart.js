define(["echarts","viewportOptions", "triangleChartView"], function (echarts, ViewportOptions) {
	return function (chartData, chartSelector) {
		var self = this;
		var viewportOptions = new ViewportOptions({
			chartHeight: 340,
			grid: {
				top: 40,
				bottom: 40
			},
			axisLabel: {
				margin: 20,
				fontSize: 14
			},
			markPointSize: 40,
			labelFontSize: 26
		}, {
			chartHeight: 140,
			grid: {
				top: 20,
				bottom: 20
			},
			axisLabel: {
				margin: 8,
				fontSize: 10
			},
			markPointSize: 30,
			labelFontSize: 16
		});

		var $chart = $(chartSelector);
		var indicatorUrl = $chart.siblings().filter("[data-role='isMeIndicator']")[0].src;

		//should be called before chart init due to chart height initialization
		var options = getOptions();

		var chart = echarts.init(chartSelector);

		self.draw = function (callback) {
			chart.setOption(options);
			callback && callback();

			$(window).on("resize:width", function () {
				chart.setOption(getOptions());
				chart.resize();
			});
		};

		function getOptions(){
			var xAxisData = [];
			var seriesData = [];
			var markerPointData = [];
			var options = viewportOptions.getOptions();

			$chart.css("height", options.chartHeight);

			prepareData();

			function prepareOptions() {
				return {
					silent: true,
					animation: false,
					tooltip: {
						show: false
					},
					grid: {
						top: options.grid.top,
						bottom: options.grid.bottom,
						left: 0,
						right: 0
					},
					xAxis: {
						data: xAxisData,
						axisLine: {
							show: false
						},
						axisTick: {
							show: false
						},
						axisLabel: {
							show: true,
							interval: 0,
							margin: options.axisLabel.margin,
							textStyle: {
								fontSize: options.axisLabel.fontSize,
								fontName: 'Gotham',
								fontWeight: "bold",
								color: "#073b51"
							}
						},
						splitLine: {
							show: false
						}
					},
					yAxis: {
						axisLine: {
							show: false
						},
						axisTick: {
							show: false
						},
						axisLabel: {
							show: false
						},
						splitLine: {
							show: false
						}
					},
					triangle: {},
					series: [{
						type: 'bar',
						triangle: true,
						barWidth: "100%",
						barMinHeight: 30,
						label: {
							normal: {
								show: true,
								position: "outside",
								textStyle: {
									fontSize: options.labelFontSize,
									bold: true,
									fontFamily: "Gotham",
									color: "#073b51"
								},
								formatter: function (params) {
									return params.data.name;
								}
							}
						},
						data: seriesData,
						markPoint: {
							symbol: "image://" + indicatorUrl,
							symbolSize: options.markPointSize,
							data: markerPointData
						}
					}]
				}
			}

			function prepareData() {
				for (var i = 0; i < chartData.length; i++) {
					xAxisData.push(chartData[i].Title.toUpperCase());
					seriesData.push({
						value: chartData[i].Value,
						name: chartData[i].Label,
						itemStyle: {
							normal: {
								color: chartData[i].Color
							}
						}
					});

					if (chartData[i].IsMe) {
						markerPointData.push({
							coord: [chartData[i].Title.toUpperCase(), chartData[i].Value * 0.4],
							label: {
								normal: {
									show: false
								}
							}
						});
					}
				}
			}

			return prepareOptions();
		}
	};
});
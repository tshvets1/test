define(["echarts", "viewportOptions"], function (echarts, ViewportOptions) {
	return function (chartData, chartSelector) {
		var self = this;
		var viewportOptions = new ViewportOptions({
			chartHeight: 410,
			barWidth: 100,
			barGap: 25,
			grid: {
				width: 500,
				left: "center",
				bottom: 40
			},
			axisLabel: {
				fontSize: 14,
				margin: 20
			},
			label: {
				fontSize: 30
			},
			markPoint: {
				symbolSize: 45,
				position: 0.8
			}
		}, {
			chartHeight: 160,
			barWidth: 50,
			barGap: 20,
			grid: {
				width: "100%",
				left: 0,
				bottom: 20
			},
			axisLabel: {
				fontSize: 10,
				margin: 10
			},
			label: {
				fontSize: 16
			},
			markPoint: {
				symbolSize: 30,
				position: 0.4
			}
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

		function getOptions() {
			var xAxisData = [];
			var seriesData = [];
			var markerPointData = [];
			var options = viewportOptions.getOptions();

			$chart.css("height", options.chartHeight);

			prepareData();

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
							coord: [chartData[i].Title.toUpperCase(), chartData[i].Value * options.markPoint.position]
						});
					}
				}
			}

			function prepareOptions() {
				return {
					silent: true,
					animation: false,
					tooltip: {
						show: false
					},
					grid: {
						left: options.grid.left,
						right: options.grid.left,
						top: 20,
						bottom: options.grid.bottom,
						width: options.grid.width
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
					series: [{
						type: 'bar',
						barWidth: options.barWidth,
						barMinHeight: 50,
						barGap: options.barGap,
						label: {
							normal: {
								show: true,
								position: "outside",
								textStyle: {
									fontSize: options.label.fontSize,
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
							symbolSize: options.markPoint.symbolSize,
							data: markerPointData,
							label: {
								normal: {
									show: false
								}
							}
						}
					}]
				};
			}

			return prepareOptions();
		}
	};
});
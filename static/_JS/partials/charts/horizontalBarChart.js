define(["echarts", "viewportOptions"], function (echarts, ViewportOptions) {
	return function (chartData, chartSelector) {
		var self = this;

		var $chart = $(chartSelector);
		var $indicator = $chart.siblings().filter("[data-role='isMeIndicator']");
		var indicatorUrl = $indicator[0].src;
		var indicatorReplacementText = $indicator.data("replacementText");

		var viewportOptions = new ViewportOptions({
			barWidth: 40,
			barGap: 10,
			grid: {
				left: 140
			},
			axisLabel: {
				fontSize: 14,
				margin: 20
			},
			label: {
				fontSize: 22
			},
			markPoint: {
				symbol: "image://" + indicatorUrl,
				showLabel: false
			}
		}, {
			barWidth: 20,
			barGap: 10,
			grid: {
				left: 80
			},
			axisLabel: {
				fontSize: 10,
				margin: 10
			},
			label: {
				fontSize: 12
			},
			markPoint: {
				symbol: "rect",
				symbolSize: 10,
				showLabel: true
			}
		});

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

			$chart.css("height", options.barWidth * chartData.length + options.barGap * (chartData.length - 1));

			prepareData();

			function prepareData() {
				for (var i = chartData.length - 1; i >= 0; i--) {
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
						markerPointData.push({coord: [2, chartData[i].Title.toUpperCase()]});
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
						top: 0,
						bottom: 0,
						left: options.grid.left,
						right: 0
					},
					xAxis: {
						type: "value",
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
					yAxis: {
						type: "category",
						data: xAxisData,
						axisLine: {
							show: true,
							lineStyle: {
								color: "#c8d2d2"
							}
						},
						axisTick: {
							show: false
						},
						axisLabel: {
							show: true,
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
					series: [{
						type: 'bar',
						barWidth: options.barWidth,
						barMinHeight: 30,
						barGap: options.barGap,
						label: {
							normal: {
								show: true,
								position: "insideRight",
								textStyle: {
									fontSize: options.label.fontSize,
									bold: true,
									fontFamily: "Gotham"
								},
								formatter: function (params) {
									return params.data.name;
								}
							}
						},
						data: seriesData,
						markPoint: {
							symbol: options.markPoint.symbol,
							symbolSize:  32,
							data: markerPointData,
							label: {
								normal: {
									show:  options.markPoint.showLabel,
									formatter: indicatorReplacementText,
									position: [15,10],
									textStyle: {
										fontSize: 12,
										fontWeight: "bold",
										fontFamily: "Gotham",
										color: "#fff"
									}
								}
							},
							itemStyle: {
								normal: {
									color: "transparent"
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
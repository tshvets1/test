define(["echarts", "viewportOptions"], function (echarts, ViewportOptions) {
	return function (chartData, chartSelector) {
		var self = this;
		var viewportOptions = new ViewportOptions({
			chartHeight: 340,
			paddingBottom: 0,
			indicator: {
				paddingLeft: 40,
				imageSize: 40
			},
			radius: "100%",
			radiusCenter: ["40%", "50%"],
			legend: {
				itemGap: 20,
				itemSize: 20,
				fontSize: 14,
				right: "19%"
			},
			label: {
				fontSize: 22,
				fontSizeMax: 30
			}
		}, {
			chartHeight: 190,
			paddingBottom: 50,
			indicator: {
				paddingLeft: 20,
				imageSize: 25
			},
			radius: "90%",
			radiusCenter: ["35%", "50%"],
			legend: {
				itemGap: 10,
				itemSize: 10,
				fontSize: 10,
				right: "right"
			},
			label: {
				fontSize: 16,
				fontSizeMax: 20
			}
		});

		var $chart = $(chartSelector);
		var indicatorUrl = $chart.siblings().filter("[data-role='isMeIndicator']")[0].src;
		var indicator;

		//should be called before chart init due to chart height initialization
		var options = getOptions();

		var chart = echarts.init(chartSelector);

		var indicatorPointData;

		self.draw = function (callback) {
			chart.setOption(options);
			callback && callback();

			$(window).on("resize:width", function () {
				chart.setOption(getOptions());
				chart.resize();
				indicator.resize();
			});

			indicator = new Indicator(chart, viewportOptions, indicatorPointData, indicatorUrl);
			indicator.draw();
		};

		function getOptions() {
			var legendData = [];
			var seriesData = [];
			var options = viewportOptions.getOptions();

			$chart.css("height", options.chartHeight);

			prepareData(legendData, seriesData);

			function prepareData(legendData, seriesData) {
				var maxIndex = 0;
				var max = 0;

				for (var i = 0; i < chartData.length; i++) {
					legendData.push({
						name: chartData[i].Title.toUpperCase(),
						icon: "rect"
					});
					seriesData.push({
						value: chartData[i].Value,
						name: chartData[i].Title.toUpperCase(),
						labelText: chartData[i].Label,
						itemStyle: {
							normal: {
								color: chartData[i].Color
							}
						}
					});
					if (chartData[i].Value > max) {
						max = chartData[i].Value;
						maxIndex = i;
					}

					if (chartData[i].IsMe) {
						indicatorPointData = chartData[i];
					}
				}

				seriesData[maxIndex].label = {
					normal: {
						textStyle: {
							fontSize: options.label.fontSizeMax
						}
					}
				};
			}

			function prepareOptions() {
				return {
					silent: true,
					animation: false,
					grid: {
						top: 0,
						bottom: options.paddingBottom
					},
					legend: {
						itemGap: options.legend.itemGap,
						itemWidth: options.legend.itemSize,
						itemHeight: options.legend.itemSize,
						top: "middle",
						right:  options.legend.right,
						orient: "vertical",
						selectedMode: false,
						textStyle: {
							fontSize: options.legend.fontSize,
							fontName: "Gotham",
							fontWeight: "bold",
							color: "#073b51"
						},
						data: legendData
					},
					tooltip: {
						show: false
					},
					xAxis: {
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
						type: "pie",
						z: 0,
						radius: options.radius,
						center: options.radiusCenter,
						label: {
							normal: {
								show: true,
								position: "inside",
								textStyle: {
									fontSize: options.label.fontSize,
									bold: true,
									fontFamily: "Gotham"
								},
								formatter: function (params) {
									return params.data.labelText;
								}
							}
						},
						data: seriesData
					}]
				};
			}

			return prepareOptions();
		}

		function Indicator(chart, viewportOptions, chartData, indicatorUrl) {
			var zr = chart.getZr();
			var indicatorGroup = new echarts.graphic.Group();
			zr.add(indicatorGroup);

			this.draw = function () {
				var options = viewportOptions.getOptions();
				var shapes = zr.storage.getDisplayList();

				for (var i = 0; i < shapes.length; i++) {
					var shape = shapes[i];
					if (shape.type === "text"
						&& shape.style.text === chartData.Label) {
						var titleShape = drawIndicator(indicatorUrl, shape.style, options.indicator);
						indicatorGroup.add(titleShape);
					}
				}

				zr.refresh();
			};

			this.resize = function () {
				indicatorGroup.removeAll();
				zr.refresh();
				this.draw();
			};

			function drawIndicator(indicatorUrl, position, options) {
				var x = position.x + options.paddingLeft;
				var y = position.y - options.imageSize / 2;

				return new echarts.graphic.Image({
					z: 1,
					style: {
						width: options.imageSize,
						height: options.imageSize,
						image: indicatorUrl
					},
					position: [x, y]
				});
			}
		}
	};
});
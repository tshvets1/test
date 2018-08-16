define(["echarts", "viewportOptions"], function (echarts, ViewportOptions) {
	return function (chartData, chartSelector) {
		var self = this;
		var viewportOptions = new ViewportOptions({
			chartHeight: 410,
			indicator: {
				paddingRight: 15,
				paddingBottom: 40,
				imageSize: 55
			},
			axisLabelFontSize: 14,
			label: {
				fontSize: 60,
				fontWeight: 200
			}
		}, {
			chartHeight: 250,
			indicator: {
				paddingRight: 15,
				paddingBottom: 20,
				imageSize: 32
			},
			axisLabelFontSize: 10,
			label: {
				fontSize: 20,
				fontWeight: "bold"
			}
		});
		var titles;

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
				titles.resize();
			});

			titles = new Titles(chart, viewportOptions, chartData, indicatorUrl);
			titles.draw();
		};

		function getOptions() {
			var seriesData = [];
			var levelColors = [];
			var options = viewportOptions.getOptions();

			$chart.css("height", options.chartHeight);

			prepareData();

			function prepareOptions() {
				return {
					silent: true,
					tooltip: {
						show: false
					},
					series: [{
						type: 'treemap',
						nodeClick: false,
						silent: true,
						animation: false,
						animationDuration: 0,
						width: "100%",
						height: "100%",
						z: 0,
						label: {
							normal: {
								show: true,
								position: "insideTopLeft",
								textStyle: {
									fontSize: options.label.fontSize,
									fontWeight: options.label.fontWeight,
									fontFamily: "Gotham"
								}
							}
						},
						breadcrumb: {
							show: false
						},
						levels: [{
							color: levelColors
						}],
						data: seriesData,
						roam: false
					}]
				};
			}

			function prepareData() {
				var maxIndex = 0;
				var max = 0;

				for (var i = 0; i < chartData.length; i++) {
					levelColors.push(chartData[i].Color);
					seriesData.push({
						value: chartData[i].Value,
						name: chartData[i].Label
					});
					if (chartData[i].Value > max) {
						max = chartData[i].Value;
						maxIndex = i;
					}
				}

				seriesData[maxIndex].label = {
					normal: {
						textStyle: {
							fontSize: options.label.fontSize * 2
						}
					}
				};
			}

			return prepareOptions();
		}

		function Titles(chart, viewportOptions, chartData, indicatorUrl) {
			var zr = chart.getZr();
			var titlesGroup = new echarts.graphic.Group({
				z: 1
			});
			zr.add(titlesGroup);

			this.draw = function () {
				var options = viewportOptions.getOptions();
				var shapes = zr.storage.getDisplayList();

				for (var i = 0; i < shapes.length; i++) {
					var shape = shapes[i];
					if (shape.type === "rect") {
						var textToDraw;
						var isMe;

						if (chartData.some(function (data) {
								if (data.Label === shape.style.text
									&& data.Color === shape.style.fill) {
									textToDraw = data.Title.toUpperCase();
									isMe = data.IsMe;
									return true;
								}
								return false;
							})) {
							var titleShape = drawTitle(textToDraw, shape.parent.position, shape.shape, options);
							titlesGroup.add(titleShape);

							if (isMe) {
								var indicatorShape = drawIndicator(indicatorUrl, shape.parent.position, shape.shape, options.indicator);
								titlesGroup.add(indicatorShape);
							}
						}
					}
				}

				zr.refresh();
			};

			this.resize = function () {
				titlesGroup.removeAll();
				zr.refresh();
				this.draw();
			};

			function drawTitle(textToDraw, position, shape, options) {
				return new echarts.graphic.Rect({
					shape: {
						height: shape.height,
						width: shape.width
					},
					style: {
						fill: "transparent",
						textFill: "#fff",
						text: textToDraw,
						cursor: "default",
						textPosition: "insideBottomRight",
						textFont: "bold " + options.axisLabelFontSize + "px Gotham"
					},
					position: position
				});
			}

			function drawIndicator(indicatorUrl, position, shape, options) {
				var x = position[0] + shape.width - options.paddingRight - options.imageSize;
				var y = position[1] + shape.height - options.paddingBottom - options.imageSize;


				return new echarts.graphic.Image({
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
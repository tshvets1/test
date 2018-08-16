;(function ($) {
	$.fn.tabsSwitch = function () {
		this.each(function () {
			var $module = $(this);
			var tabsHtml = this.innerHTML;
			var accordionHtml = getAccordionStructureFromTabs($module);
			var prevWidget = "tabs";

			prevWidget = applyTabsOrAccordion($module, tabsHtml, accordionHtml, prevWidget);
			$(window).on("resize:device", function () {
				prevWidget = applyTabsOrAccordion($module, tabsHtml, accordionHtml, prevWidget);
			});
		});

		function applyTabsOrAccordion($module, tabsHtml, accordionHtml, prevWidget) {
			var widget = "tabs";
			var html = tabsHtml;
			var options = {
				heightStyle: "content",
				active: 0,
				show: true,
				hide: true
			};

			if ($.viewport.isMobile()) {
				widget = "accordion";
				html = accordionHtml;
				options.heightStyle = "content";
				options.activate = function (event, ui) {
					ui.newHeader.length && ui.newHeader.scrollToElement();
				}
			}

			var instance = $module[prevWidget]("instance");
			if (instance) {
				options.active = $module[prevWidget]("option", "active");
				$module[prevWidget]("destroy");
			}

			$module.html(html);
			$module[widget](options);
			return widget;
		}

		function getAccordionStructureFromTabs($tabs) {
			var $div = $("<div>");
			$tabs.children("ul").find("a").each(function () {
				var $this = $(this);
				var $content = $tabs.find($this.attr("href"));
				$div.append($this).append($content);
			});
			return $div[0].innerHTML;
		}

		return this;
	};
})(jQuery);
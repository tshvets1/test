function knowledgeCenter($section) {
	var $window = $(window);
	var $filter = $section.find(".knowledge-center__tabs-filters");
	var $tabs = $filter.find("ul > li");
	var $anchorLists = $section.find(".knowledge-center__questions-listing");
	var $select;

	//show hide on filter click
	if ($section.data("onePage")) {
		var $items = $section.find(".knowledge-center__item");
		$section.find(".knowledge-center-filter-module .category-filter__list")
			.hideShowItem($items, window.location.hash);
	}

	$anchorLists.each(updateAnchorsList);

	//tabs filter
	if ($tabs.length) {
		$select = createSelect($tabs);
		$filter.append($select);

		$select.on("change", function (e, callback) {
			var $this = $(this);
			$tabs.filter("[data-filter-content='" + $this.val() + "']").trigger("click", callback);
		});

		$window.on("resize:device", function () {
			$select.find(":selected").removeAttr("selected");
			var value = $tabs.filter(".selected").data("filterContent");
			$select.find("[value='" + value + "']").attr("selected", "selected");
		});

		$tabs.on("click", function (e, callback) {
			e.preventDefault();

			var $tab = $(this);
			var $groups = $tab.closest(".knowledge-center__item").find("[data-filter]");
			var filterContent = $tab.data("filterContent");
			var isSelectAllTab = !filterContent || filterContent == "all";
			var filter = isSelectAllTab ? "*" : "[data-filter='" + filterContent + "']";
			$tab.siblings().removeClass("selected");

			if (!$tab.hasClass("selected")) {
				$tab.addClass("selected");

				if (callback) {
					$groups.filter(filter).addClass("active").finish().show();
					$groups.filter(":not(" + filter + ")").removeClass("active").hide();
					callback();
				} else {
					$groups.filter(filter).addClass("active").finish().slideDown("slow");
					$groups.filter(":not(" + filter + ")").removeClass("active").finish().slideUp("slow");
				}
			}

		});
	}


	$(window).on("load", function () {
		var faqIdStartIndex = window.location.search.indexOf("faqid");
		if (faqIdStartIndex != -1) {
			var faqId = window.location.search.slice(faqIdStartIndex + 6);
			var $element = $section.find("#" + faqId);
			if ($element.length) {
				var groupId = $element.closest(".knowledge-center__group").data("filter");
				var $header = $("#header");
				$header.trigger("header:forceHide", function () {
					var callback = function () {
						$element.scrollToElement(function () {
							$header.trigger("header:resetHide");
						});
					};
					//change tab only if tabs exist and selected tab isn't show all
					if ($tabs.length && $tabs.filter(".selected").data("filterContent") !== "all") {
						$select.val(groupId).trigger("change", callback);
					} else {
						callback();
					}
				});
			}
		}
	});

	$section.on("click", ".knowledge-center__read-more", function (e) {
		e.preventDefault();
		$(this).closest(".knowledge-center__question").addClass("show-read-more");
	});

	function createSelect($tabs) {
		var $select = $("<select>");

		$tabs.each(function () {
			var $tab = $(this);
			var $option = $("<option>");
			$option.attr("value", $tab.data("filterContent")).text($tab.text());
			if ($tab.hasClass("selected")) {
				$option.attr("selected", "selected");
			}
			$select.append($option);
		});
		return $select;
	}

	function updateAnchorsList(index, anchorList) {
		var $anchorList = $(anchorList);
		var $anchors = $anchorList.find("li");

		var colsCount = 2;
		var anchorsInColumn = Math.round($anchors.length / colsCount);

		for (var i = 0; i < colsCount; i++) {
			var $tempCol = $("<div>").addClass("knowledge-center__questions-listing-col");
			var startIndex = i * anchorsInColumn;
			$tempCol.append($anchors.slice(startIndex, startIndex + anchorsInColumn));
			$anchorList.append($tempCol);
		}
	}
}
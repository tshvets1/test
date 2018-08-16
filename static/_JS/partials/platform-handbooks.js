function platformHandbooks($section) {
	var $window = $(window);
	$(".platform-handbooks-filter-module .category-filter__list")
		.hideShowItem($section, window.location.hash);

	var $anchorLists = $section.find(".platform-handbooks__anchor-list");

	$anchorLists.each(updateAnchorsList);

	$window.on("resize:device", function () {
		$anchorLists.each(updateAnchorsList);
	});

	function updateAnchorsList(index, anchorList) {
		var $anchorList = $(anchorList);
		var $anchors = $anchorList.find("li");

		var colsCount = 3;
		if ($.viewport.isMobile()) {
			colsCount = 2;
		}

		var anchorsInColumn = Math.ceil($anchors.length / colsCount);

		for (var i = 0; i < colsCount; i++) {
			var $tempCol = $("<div>").addClass("platform-handbooks__anchor-list-col");
			var startIndex = i * anchorsInColumn;
			$tempCol.append($anchors.slice(startIndex, startIndex + anchorsInColumn));
			$anchorList.append($tempCol);
		}
	}
}
function platformComparison() {
	var $window = $(window);
	var colWidth;
	var firstShownColumn = 0;

	var $section = $(".platform-comparison-section");
	$section.closest(".wrapper").css({
		"max-width": "none",
		"padding-left": 0,
		"padding-right": 0
	});

	var $header = $section.children(".comparison__table:eq(1)");
	$section.children(".comparison__table:nth-child(odd)").addClass("odd");
	$section.children(".comparison__table:last-child").addClass("last-child");
	$header.addClass("comparison__table-header");
	var slidingPlatformsCount = $header.find("td").length - 1;

	var $actions = $section.find(".comparison__actions");
	var $rows = $section.find(".comparison__table-row");
	var mobileSlideDurationIndex = 2500;

	$window.on("load", function (e) {
		createMobileSlider();
		createAndApplySlider();
	});

	$window.on("resize:width", function (e) {
		createAndApplySlider();
	});

	$actions.find(".comparison__left").click(function (e) {
		e.preventDefault();

		if (firstShownColumn != 0) {
			firstShownColumn--;
			scrollLeft();
		}
	});

	$actions.find(".comparison__right").click(function (e) {
		e.preventDefault();

		var shownPlatforms = $.viewport.isTablet() ? 2 : 3;
		if (firstShownColumn === slidingPlatformsCount - shownPlatforms) {
			return;
		}

		if (firstShownColumn != slidingPlatformsCount) {
			firstShownColumn++;
			scrollLeft();
		}
	});

	$section.on("click", ".comparison__table-mobile-menu-headline", function () {
		var $menuItem = $(this).closest("li");
		var $action = $menuItem.find(".comparison__table-mobile-menu-action");
		if ($menuItem.hasClass("active")) {
			$action.addClass("open");
			$menuItem.removeClass("active").children("table").slideUpSpeed(mobileSlideDurationIndex);
		} else {
			$action.removeClass("open");
			$menuItem.scrollToElement();
			$menuItem.addClass("active").children("table").slideDownSpeed(mobileSlideDurationIndex);
		}
	});

	function createAndApplySlider() {
		var wrapperWidth = $(".comparison__table .wrapper").width();
		var slideColumnsCount = 3;

		if ($.viewport.isMobile()) {
			$actions.hide();
			$rows.css("width", "").find("table td")
				.css({"width": "", "height": ""});
		} else {
			if ($.viewport.isTablet()) {
				slideColumnsCount = 2;
			}

			colWidth = wrapperWidth / (slideColumnsCount + 1);
			$rows.find("table td")
				.css("width", colWidth);

			setRowsHeight($rows);

			var top = $header.height() / 2 - 40;
			setActionsPosition(top);

			firstShownColumn = 0;
			$rows.scrollLeft(firstShownColumn * colWidth);

			$actions.toggle(slidingPlatformsCount > slideColumnsCount);
		}
	}

	function createMobileSlider() {
		var $mobileSection = $("<div>").addClass("comparison__table comparison__table-mobile");
		var $menu = $("<ul>").addClass("comparison__table-mobile-menu");

		var mobileRows = [];
		$rows.children("table").each(function (rowIndex, row) {
			var $row = $(this).clone();

			if (rowIndex == 0) {
				copyHeader($row, $menu, mobileRows);
			}
			copyTDs($row, mobileRows, rowIndex);
		});

		$menu.children("li").each(function (i) {
			$(this).append(mobileRows[i]);
		});

		$mobileSection.append($menu);
		$section.append($mobileSection);

		function copyHeader($header, $menu, mobileRows) {
			$header.find("td").each(function (i) {
				var $li = $("<li>").addClass(i == 0 ? " active" : "");

				var $h2 = $(this).find("h2:eq(0)");
				if ($h2.length && $h2.find("img").length) {
					$h2.text($h2.find("img").attr("alt"));
				}

				$li.append($h2.addClass("comparison__table-mobile-menu-headline"));
				$h2.append($("<span>").addClass("comparison__table-mobile-menu-action").addClass(i == 0 ? "" : "open"));
				$menu.append($li);

				mobileRows[i] = $("<table>").css("display", i == 0 ? "" : "none");
			});
		}

		function copyTDs($table, tables, rowIndex) {
			var $header;
			if (rowIndex != 0) {
				$header = $table.find("td:eq(0)>h2:eq(0)").clone();
			}

			$table.find("td").each(function (i, col) {
				var $tr = $("<tr>").addClass(rowIndex % 2 == 0 ? "even" : "odd");
				if (i != 0 && $header && $header.length) {
					$(col).prepend($header.clone());
				}
				$tr.append(col);
				tables[i].append($tr);
			});
		}
	}

	function setActionsPosition(top) {
		$actions.find(".comparison__action").each(function () {
			$(this).css("top", top);
		});
	}

	function scrollLeft() {
		var scroll = firstShownColumn * Math.floor(colWidth) - 2;
		$rows.animate({scrollLeft: scroll}, "slow");
	}

	function setRowsHeight($rows) {
		$rows.each(function () {
			var $row = $(this);
			$row.find("td").css("height", $row.find("td").first().css("height", "").height() + 40);
		})
	}
}
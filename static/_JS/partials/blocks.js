function blocks($selector) {
	$selector.each(function() {
		var $this = $(this);
		var layout = $this.data("layout");
		var items = $this.data("items");

		var $cols = $this.find(".block__group-col");
		var $colLeft = $cols.eq(0);
		var $colRight = $cols.eq(1);

		setHeights();

		function setHeights() {
			if ($.viewport.isMobile()) {
				return;
			}

			var leftIsBigger = true;
			var height = $colLeft.height();

			if (height < $colRight.height()) {
				leftIsBigger = false;
				height = $colRight.height();
			}

			if (items <= 2) {
				$cols.children().height(height);
			} else if (layout == "left") {
				setColHeights($colLeft, $colRight, leftIsBigger, height);
			} else {
				setColHeights($colRight, $colLeft, !leftIsBigger, height);
			}

			function setColHeights($itemCol, $itemsCol, itemsIsBigger, height) {
				if (itemsIsBigger) {
					setItemsHeights($itemsCol.children(), height - 10);
				} else {
					$itemCol.children().height(height);
				}
			}

			function setItemsHeights($items, height) {
				var $firstItem = $items.eq(0);
				var firstItemHeight = $firstItem.height();
				var $lastItem = $items.eq(1);
				var lastItemHeight = $lastItem.height();

				if (firstItemHeight > lastItemHeight) {
					setItemsHeights($lastItem, firstItemHeight);
				} else {
					setItemsHeights($firstItem, lastItemHeight);
				}

				function setItemsHeights($lastItem, firstItemHeight) {
					if (firstItemHeight > height / 2) {
						$lastItem.height(height - firstItemHeight);
					} else {
						$items.height(height / 2);
					}
				}
			}
		}

		$(window).on("load resize:width", function() {
			$cols.children().css("height", "");
			setHeights();
		});
	});
}
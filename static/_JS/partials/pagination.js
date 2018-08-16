(function ($) {
	$.fn.pagination = function (options) {
		var self = this;

		var settings = $.extend({
			pagesCountBeforeWrap: 10,
			pageHref: "",
			pageNumberPlaceHolder: "{pageNumber}",
			currentPage: 2,
			pagesCount: 5,
			breakPlaceholder: "...",
			pagesCountBetweenBreaks: 5,
			previousButtonText: "Previous",
			nextButtonText: "Next",
			activePageClass: "is-active",
			showDisabledArrows: false
		}, options || {});
		var $pagination = $(this);
		this.currentPage = options.currentPage;

		var $pagesListTemplate = $("<ul/>").addClass("pagination__list");
		var $pageItemTemplate = $("<li/>").addClass("pagination__item");
		$pageItemTemplate.append($("<a/>").addClass("pagination__link"));

		createPagination(settings.currentPage, settings.pagesCount);

		function createPagination(currentPage, pagesCount) {
			$pagination.empty();

			if (pagesCount != 0) {
				$pagination.addClass("pagination").attr("role", "navigation");
				var $pagesList = $pagesListTemplate.clone();

				if (currentPage != 1 || settings.showDisabledArrows) {
					$pagesList.append(createArrow(currentPage, 1, currentPage - 1, settings.previousButtonText, "pagination__prev"));
				}

				if (pagesCount <= settings.pagesCountBeforeWrap) {
					createPageItems($pagesList, 1, pagesCount, currentPage);
				} else if (pagesCount == settings.pagesCountBeforeWrap + 1 || currentPage <= 2 + 2 || currentPage >= pagesCount - 2 - 2) {
					//123456...11
					if (currentPage <= settings.pagesCountBetweenBreaks + 1) {
						createPageItems($pagesList, 1, settings.pagesCountBetweenBreaks + 1, currentPage);
						$pagesList.append(createDots());
						$pagesList.append(createPageItem(pagesCount, currentPage));
					}

					//1...7891011
					if (currentPage >= pagesCount - settings.pagesCountBetweenBreaks) {
						$pagesList.append(createPageItem(1, currentPage));
						$pagesList.append(createDots());
						createPageItems($pagesList, pagesCount - settings.pagesCountBetweenBreaks, pagesCount, currentPage);
					}
				} else {
					//1...34567...12
					$pagesList.append(createPageItem(1, currentPage));
					$pagesList.append(createDots());
					createPageItems($pagesList, currentPage - 2, currentPage + 2, currentPage);
					$pagesList.append(createDots());
					$pagesList.append(createPageItem(pagesCount, currentPage));
				}

				if (currentPage != pagesCount || settings.showDisabledArrows) {
					var $nextPage = createArrow(currentPage, pagesCount, currentPage + 1, settings.nextButtonText, "pagination__next");
					var $nextPageLink = $nextPage.find("a");
					$nextPageLink.attr("href", $nextPageLink.attr("href") + "&last=true");
					$pagesList.append($nextPage);
				}
				$pagination.append($pagesList);
				if (pagesCount >= 2) {
					$pagination.show();
				} else {
					$pagination.hide();
				}
			}
		}

		function createPageItems($pagesList, startIndex, endIndex, currentPage) {
			for (var i = startIndex; i <= endIndex; i++) {
				$pagesList.append(createPageItem(i, currentPage));
			}
		}

		function createPageItem(pageIndex, currentPage) {
			var $pageItem = $pageItemTemplate.clone();
			var $pageItemLink = $pageItem.find("a");
			if (pageIndex == currentPage) {
				$pageItemLink.removeAttr("href").addClass("is-active");
			} else {
				var href = settings.pageHref.replace(settings.pageNumberPlaceHolder, pageIndex);
				if (pageIndex === settings.pagesCount) {
					href += "&last=true";
				}
				$pageItemLink.attr("href", href);

				$pageItemLink.click(function (e) {
					$pagination.trigger("pageChanged", {event: e, target: this, pageIndex: pageIndex});
				});
			}
			$pageItemLink.text(pageIndex).data("pageIndex", pageIndex);

			return $pageItemLink;
		}

		function createArrow(currentPage, testPage, pageNumber, arrowText, arrowClass) {
			var $button = $pageItemTemplate.clone().addClass(function () {
				return currentPage == testPage ? "disabled" : "";
			});
			var $link = $button.find(".pagination__link").addClass(arrowClass).text(arrowText);
			if (currentPage != testPage) {
				$link.attr("href", settings.pageHref.replace(settings.pageNumberPlaceHolder, pageNumber))
					.data("pageIndex", pageNumber);
				$link.click(function (e) {
					$pagination.trigger("pageChanged", {event: e, target: this, pageIndex: pageNumber});
				});
			}

			return $button;
		}

		function createDots() {
			var $dots = $pageItemTemplate.clone();
			var $dotsItemLink = $dots.find("a");
			$dotsItemLink.removeAttr("href").addClass("is-active").text(settings.breakPlaceholder);

			return $dots;
		}

		this.update = function (pagesCount, currentPage) {
			createPagination(currentPage || settings.currentPage, pagesCount || settings.pagesCount);
		};

		this.option = function (method, option, value) {
			if (method === "get") {
				return settings[option];
			}
			if (method === "set") {
				if (option && typeof value !== "undefined") {
					settings[option] = value;
				}
			}
		};

		$pagination.data("pagination", this);
	}
})(jQuery);
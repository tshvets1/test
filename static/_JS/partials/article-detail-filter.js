function articleDetailFilter() {
	var $filterSection = $(".education-article-detail-filter");
	var $filter = $filterSection.find(".filters");
	var $badge = $filterSection.find(".badge");
	var ajaxUrl = $filter.data("ajaxUrl");
	var $body = $("html");
	var $topicsSection = $filterSection.find(".fixed-menu__hideable-content.topics");
	var applyScrollbarItemsCount = 6;
	var articles;
	var filters = [];
	var badgeValue = 0;
	var filtered = false;
	var ARTICLE_DETAIL_FILTER_KEY = "articleDetailFilter";
	var FILTERED_KEY = "articleDetailFilter.filtered";

	saveFilterState();
	if (sessionStorage.getItem(FILTERED_KEY)) {
		sessionStorage.removeItem(FILTERED_KEY);
		restoreFilter(JSON.parse(sessionStorage.getItem(ARTICLE_DETAIL_FILTER_KEY)));
	}

	var isDesktop = $.viewport.isDesktop();
	applyScrollbar();
	$(window).on("resize:device", function () {
		isDesktop = $.viewport.isDesktop();
		applyScrollbar();

		$filter.css("display", "");
	});

	$filterSection.find(".fixed-menu__toggle")
		.on("click", ".pull-left", function () {
			toggleFixedMenu($(this), "topics-open", "filter-open");
		})
		.on("click", ".pull-right", function (e, triggered) {
			if (isDesktop) {
				if ($filter.is(":visible")) {
					!triggered && restoreFilterState();
					$filter.slideUp("slow");
				} else {
					$filter.slideDown("slow");
				}
				return;
			}
			!triggered && toggleFixedMenu($(this), "filter-open", "topics-open");
		});

	$filter.find("#filterResults").click(function (e) {
		e.preventDefault();

		if (filtered) {
			!articles && updateBadge();
			articles.done(function (data) {
				updateArticles(data);
				filtered = false;
				saveFilterState();
				saveFilter(data, filters);
			});
		}
	});

	$filter.find("[name='filter[]']").on("change", function () {
		updateBadge();
		if (!isDesktop) {
			$filter.find("#filterResults").click();
		}
	});

	$topicsSection.on("click", "a", function (e) {
		e.preventDefault();

		var url = $(this).attr("href");
		if (sessionStorage.getItem(ARTICLE_DETAIL_FILTER_KEY)) {
			sessionStorage.setItem(FILTERED_KEY, "true");
		}
		location.href = url;
	});

	function toggleFixedMenu($element, parentClass, removeParentClass) {
		var $parent = $element.parent();
		if ($body.hasClass("fixed-menu-open")) {
			restoreFilterState();
			if ($parent.hasClass(parentClass)) {
				$body.removeClass("fixed-menu-open").trigger("toggle-fixed-menu");
				$parent.removeClass(parentClass);
			} else {
				$parent.removeClass(removeParentClass).addClass(parentClass);
			}
		} else {
			$body.addClass("fixed-menu-open").trigger("toggle-fixed-menu");
			$parent.addClass(parentClass);
		}
	}

	function saveFilterState() {
		filters = $filter.find("[name='filter[]']:checked").map(function () {
			return $(this).data("value");
		}).get();
		badgeValue = $badge.text();
	}

	function restoreFilterState() {
		$filter.find("[name='filter[]']").attr("checked", false);
		$filter.find("[name='filter[]']").each(function () {
			if (filters.indexOf($(this).data("value")) !== -1) {
				this.checked = true;
			}
		});

		$badge.html(badgeValue);
		filtered = false;
	}

	function saveFilter(articles, filters) {
		sessionStorage.setItem(ARTICLE_DETAIL_FILTER_KEY, JSON.stringify({
			articles: articles,
			filters: filters
		}));
	}

	function restoreFilter(data) {
		articles = data.articles;
		filters = data.filters;
		badgeValue = articles ? articles.length : 0;
		restoreFilterState();
		updateArticles(data.articles);
	}

	function updateBadge() {
		filtered = true;
		articles = getArticles();
		articles.done(function (data) {
			$badge.html(data.length);
		});
	}

	function getArticles() {
		var deferred = new $.Deferred();

		var filters = $filter.find("[name='filter[]']:checked").map(function () {
			return $(this).data("value");
		}).get().join();

		$.ajax({
			url: ajaxUrl + encodeURIComponent(filters)
		}).done(function (data) {
			if (data.EducationTopicDetailPage == null) {
				data.EducationTopicDetailPage = [];
			}

			deferred.resolve(data.EducationTopicDetailPage);
		}).fail(function () {
			deferred.resolve([]);
		});

		return deferred.promise();
	}

	function updateArticles(articles) {
		$filterSection.find(".fixed-menu__toggle .pull-right").trigger("click", true);

		var template = $filterSection.find("#articleTemplate");
		var $template = $(template.html());
		var $topics = $topicsSection.find("ul").empty();
		var urlName = template.data("urlName");

		$.each(articles, function () {
			var $li = $("<li/>");
			if (urlName == this.Navigation_Title.toLowerCase()) {
				$li.addClass("active");
			}
			$li.append($template.clone());
			$li.children("a").attr("href", this.Url);
			var $icon = $li.find("#icon-image");
			$icon.attr("data-article-type-default", "white");
			if (this.IconPath && this.IconPath != "") {
				var url = "url('" + this.IconPath + "')";
				$icon.css("background-image", url).append($("<span>").css("background-image", url));
			}
			var $title = $li.find(".topics-list__article-title");
			if (!this.Teaser) {
				$title.addClass("no-teaser");
			}

			$title.children().first().before(this.Navigation_Title);
			$title.children("#hideTitle").val(this.Navigation_Title);
			$title.children("#hideUrl").val(this.Url);
			$title.children(".topics-list__article-teaser").text(this.Teaser);

			$topics.append($li);
		});

		applyScrollbar();
	}

	function applyScrollbar() {
		if (isDesktop) {
			var visibleContentHeight = 0;
			var $items = $topicsSection.find(".fixed-menu__hideable-content-list > *");

			if ($items.length > applyScrollbarItemsCount) {
				$items.filter(":lt(" + applyScrollbarItemsCount + ")").each(function () {
					visibleContentHeight += $(this).outerHeight(true);
				});
				var options = {};
				if ($items.filter(".active").length > 0) {
					options.scrollTo = $items.filter(".active");
				}
				$topicsSection.css("height", visibleContentHeight + "px").applyScrollbar({
					contentElementSelector: ".fixed-menu__hideable-content-list",
					alwaysVisible: true,
					disableResize: true
				}).nanoScroller(options);
			} else {
				destroyScrollbar();
			}
		} else {
			destroyScrollbar();
		}

		function destroyScrollbar() {
			if ($topicsSection.destroyScrollbar) {
				$topicsSection.destroyScrollbar().css("height", "");
			}
		}
	}
}
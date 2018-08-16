function latestResearch($section) {
	var $research = $section.find(".research");
	var $switchView = $research.find(".research__switch");
	var $researchList = $research.find(".research__list");
	var $filter = $research.find(".research-filter-section");
	var $pagination = $section.find(".pagination").data("pagination");

	$researchList.children("li:nth-child(even)").addClass("nth-child-even");
	$researchList.children("li:nth-child(16n+4)").addClass("nth-child-16n-4");
	$researchList.children("li:nth-child(16n+11)").addClass("nth-child-16n-11");

	$switchView.length && applySwitchView($switchView);

	$researchList.length && applyResearchList();

	$filter.length && applyFilter($researchList, $filter);

	$(".research-filter__tagged-close").on("tap click", function (e) {
		var $tagFilter = $(e.currentTarget).closest(".research-filter__tagged");
		window.location = $tagFilter.data("redirectUrl");
		$tagFilter.remove();
		return false;
	});

	function applySwitchView($switchView) {
		var paginationHref = $pagination.option("get", "pageHref");
		var $switchViewBtns = $switchView.find(".research__switch-trigger");

		$switchView.on("click", ".research__switch-grid", function (e) {
			e.preventDefault();

			var $this = $(this);
			$pagination.option("set", "pageHref", paginationHref);
			$pagination.update();
			switchBetweenGridAndList($this);
			equalizeBlocks();
		})
			.on("click", ".research__switch-list", function (e) {
				e.preventDefault();

				var $this = $(this);
				$pagination.option("set", "pageHref", paginationHref + "&view=list");
				$pagination.update();
				switchBetweenGridAndList($this);
				equalizeBlocks();
			});

		$switchViewBtns.filter(".is-active").click();

		function switchBetweenGridAndList($el) {
			if (!$el.hasClass("is-active")) {
				$research.toggleClass("research-grid");
				$switchViewBtns.toggleClass("is-active");
			}
		}
	}

	function applyResearchList() {
		equalizeBlocks();

		$(window).on("resize:device", function () {
			applyDots();
		});
		applyDots();

		function applyDots() {
			if ($.viewport.isMobile()) {
				$researchList.find(".research-article__teaser").dotdotdot({
					watch: "window",
					wrap: "letter"
				});
			} else {
				$researchList.find(".research-article__teaser").trigger("destroy");
			}
		}
	}

	function equalizeBlocks() {
		var byRow = $("ul").hasClass("research__list");
		$.each($.fn.matchHeight._groups, function () {
			this.byRow = byRow;
		});

		if ($research.hasClass("research-grid")) {
			$researchList.each(function () {
				$(this).children("li").matchHeight(byRow);
			});
		} else {
			$researchList.each(function () {
				$(this).children("li").matchHeight("remove");
			});
		}
	}

	function applyFilter($researchList, $filter) {
		var $nothingFound = $section.find(".research__nothing-found");
		var $spinner = $section.find(".spinner").hide();
		var $toggleFilterBtn = $filter.find(".fixed-menu__toggle > h2.filter");

		var $filters = $filter.find(":not(.research-filter__save-settings)>:checkbox");
		var $filterBtn = $filter.find(".research-filter__filter-btn");
		var $filterIndicator = $toggleFilterBtn.find(".research-filter__badge");
		var state = new State($filters, $filterIndicator, $filter.find(".research-filter__save-settings>:checkbox"));

		//load articles for saved filter
		state.currentState.length > 0 && $filterBtn.trigger("click");

		var ajaxUrl = $filter.data("ajaxUrl");
		var $template = $section.find("#articleTemplate");
		var $livePromo2 = $researchList.find("#livePromo2Template.research__item").clone();
		var hasLivePromo2 = $researchList.find("#livePromo2Template").length ? 1 : 0;
		var $livePromo10 = $researchList.find("#livePromo10Template.research__item").clone();
		var hasLivePromo10 = $researchList.find("#livePromo10Template").length ? 1 : 0;
		//UX testing only
		var currentPage = $pagination.currentPage;
		var isMobilePagination = $.viewport.isMobile();
		var $mobilePagination = $section.find(".pagination__load-more");
		//$livePromo10 = $livePromo10.length ? $livePromo10.clone() : $livePromo2;

		showHideFilter($filter, $toggleFilterBtn);

		$filters.change(function () {
			var checkedFilterCount = $filters.filter(":checked").length;
			if (checkedFilterCount > 0) {
				$filterIndicator.text(checkedFilterCount);
				$filterIndicator.css("display", "inline-block");
			} else {
				$filterIndicator.hide();
			}

			if ($.viewport.isTablet()) {
				getArticles(getFilters(), 1);
			}
		});

		$researchList.on("click", ".article-tags__link, .research-article__author", function (e) {
			e.preventDefault();

			var filterId = $(e.currentTarget).data("value");
			searchByFilterId(filterId);
		});

		$filterBtn.on("click", function (e) {
			e.preventDefault();

			if ($.viewport.isDesktop()) {
				getArticles(getFilters(), 1);
			}
			$toggleFilterBtn.click();
		});

		$section.on("click", ".pagination__link", function (e) {
			e.preventDefault();

			var pageNumber = $(this).data("pageIndex");
			if (pageNumber) {
				getArticles(getFilters(), pageNumber);
			}
		});

		$mobilePagination.on("click", function (e) {
			e.preventDefault();

			currentPage++;
			getArticles(getFilters(), currentPage);
		});

		if (window.location.hash.indexOf("filterId") != -1) {
			searchByFilterId(window.location.hash.split("filterId=")[1])
		}

		function createListOfArticles(data) {
			$.each(data.ResearchArticleDetailPage, function (index, article) {
				//append live promos
				if (hasLivePromo2 == 1 && index == 1 && $livePromo2.length) {
					$researchList.append($livePromo2[0].outerHTML);
				}
				if (hasLivePromo10 == 1 && index == 8 && $livePromo10.length) {
					$researchList.append($livePromo10[0].outerHTML);
				}

				var $article = createArticle(article, $template);
				$researchList.append($article);
				$article.find(".research-article__teaser").dotdotdot();
			});

			equalizeBlocks();
		}

		function createArticle(article, $template) {
			//create empty article
			var $article = $($template.html());
			//show/hide teaser/headline according to Top_Story
			if (article.Top_Story) {
				$article.addClass("top-story");
				$article.find(".research-article__teaser").remove();
			} else {
				$article.find(".research-article__headline").remove();
				$article.find(".research-article__teaser").text(article.Teaser);
			}

			//populate article with data
			$article.find(".research-article__title-link").text(article.Headline);

			//create authors
			var $authorTemplate = $article.find(".research-article__author");
			$authorTemplate.after(joinList(article.Authors, $authorTemplate, "Author_Name", "Id"));
			$authorTemplate.remove();

			$article.find(".research-article__date").append(article.ArticleDateFormat);

			//populate article tags
			var $tagTemplate = $article.find(".article-tags__link");
			$tagTemplate.after(joinList(article.RelatedTags, $tagTemplate, "Tag_Name", "Id"));
			$tagTemplate.remove();

			return $article;
		}

		function joinList(data, $template, name, id) {
			var items = [];

			if (data != null) {
				$.each(data, function (i, item) {
					var $item = $template.clone().text(item[name]);
					$item.attr("data-value", item[id]);
					items.push($item[0].outerHTML);
				});
			}
			return items.join(", ");
		}

		function searchByFilterId(filterId) {
			$filterIndicator.hide();
			$filters.filter(":checked").removeAttr("checked");
			$filters.filter("[data-value='" + filterId + "']").prop("checked", true).trigger("change");
			getArticles(["", "", filterId, ""], 1);
		}

		function getFilters() {
			return $filter.find("[data-filter-name]").map(function () {
				return $(this).find(":checkbox:checked").map(function () {
					return $(this).data("value");
				}).get().join("$");
			}).get();
		}

		function getArticles(dataToSend, pageNumber) {
			var itemsPerPage = isMobilePagination ? 7 - hasLivePromo2 : 15 - hasLivePromo2 - hasLivePromo10;
			state.set();

			$spinner.show();
			$.ajax({
				url: "/_JS/data/dummy/latest_research_grid.json",
				//url: ajaxUrl + encodeURIComponent(dataToSend.join()),
				data: {
					pageNum: pageNumber,
					itemsPerPage: itemsPerPage
				}
			}).done(function (data) {
				$nothingFound.hide();
				if (!isMobilePagination || pageNumber == 1) {
					$researchList.empty();
				}

				if (!isMobilePagination) {
					var pagesCount = data.TotalPageCount == null ? 0 : Math.floor((data.TotalPageCount - 1) / itemsPerPage) + 1;
					$pagination.update(pagesCount, pageNumber);
				}

				$pagination.toggle(!isMobilePagination);
				$mobilePagination.toggle(isMobilePagination
					&& data.ResearchArticleDetailPage != null
					&& data.ResearchArticleDetailPage.length == itemsPerPage);

				if (data.TotalPageCount != null && data.TotalPageCount != 0) {
					createListOfArticles(data);
				} else {
					$nothingFound.show();
				}
			}).always(function () {
				$spinner.hide();
			});
		}

		function showHideFilter($filter, $toggleFilterBtn) {
			var $filterContent = $filter.find(".fixed-menu__hideable-content");
			var $btnText = $toggleFilterBtn.find("span[data-statictext][data-activetext]");
			$toggleFilterBtn.on("click", function () {
				$toggleFilterBtn.toggleClass("open");
				var shouldSlide = $.viewport.isDesktop();
				if ($toggleFilterBtn.hasClass("open")) {
					show(shouldSlide);
				} else {
					hide(shouldSlide);
				}
			});

			function show(shouldSlide) {
				if (shouldSlide) {
					$filterContent.stop().slideDownSpeed();
					$filter.scrollToElement();
				} else {
					$filterContent.show();
				}
				$btnText.text($btnText.data("activetext"));
			}

			function hide(shouldSlide) {
				if (shouldSlide) {
					$filterContent.stop().slideUpSpeed();
				} else {
					$filterContent.hide();
				}
				$btnText.text($btnText.data("statictext"));
				state.reset();
			}
		}

		function State($filters, $badge, $shouldSaveState) {
			var self = this;

			self.RESEARCH_FILTER_STATE = "researchFilterState";
			self.currentState = [];
			self.shouldSaveState = $shouldSaveState && localStorage.getItem(self.RESEARCH_FILTER_STATE);

			self.set = function () {
				self.currentState = [];
				$filters.filter(":checked").each(function () {
					self.currentState[self.currentState.length] = $(this).attr("id");
				});
				self._saveState();
				self._updateBadge();
			};

			self.reset = function () {
				$filters.each(function () {
					var $this = $(this);
					$this.prop("checked", self.currentState.indexOf($this.attr("id")) != -1);
				});
				self._updateBadge();
			};

			self._updateBadge = function () {
				if (self.currentState.length == 0) {
					$badge.hide();
				} else {
					$badge.text(self.currentState.length);
					$badge.css("display", "inline-block");
				}
			};

			self._saveState = function () {
				if (self.shouldSaveState) {
					localStorage.setItem(self.RESEARCH_FILTER_STATE, JSON.stringify(self.currentState));
				} else {
					localStorage.removeItem(self.RESEARCH_FILTER_STATE);
				}
			};

			$shouldSaveState && $shouldSaveState.prop("checked", self.shouldSaveState)
				.on("change", function () {
					self.shouldSaveState = $(this).is(":checked");
				});

			if (self.shouldSaveState) {
				self.currentState = JSON.parse(localStorage.getItem(self.RESEARCH_FILTER_STATE));
			}
			self.reset();

			return self;
		}
	}
}
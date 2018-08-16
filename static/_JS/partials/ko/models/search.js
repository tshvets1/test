define("search", ["knockout", "knockout-helpers", "knockout-extenders"], function (ko) {
	return function ($element, initializeData) {
		var self = this;

		self.checkedFilter = ko.observableArray(initializeData.searchFilters);
		self.checkedFilter.subscribe(function () {
			search(1);
		});

		self.results = ko.observableArray([]);
		self.totalResults = ko.observable("");
		self.filters = ko.observableArray([]);
		self.searchTextHeadline = ko.observable(initializeData.searchText);
		self.searchText = ko.observable(initializeData.searchText);
		self.displaySpinner = ko.observable(false);
		self.pager = {
			"pagesCount": ko.observable(0),
			"currentPage": ko.observable(1)
		};
		self.isMobile = ko.observable($.viewport.isMobile());

		self.search = function () {
			search(1);
		};

		search(1);
		function search(pageNumber) {
			self.displaySpinner(true);
			$.ajax({
				url: "/_JS/data/dummy/search.json",
				type: "GET",
				dataType: "json",
				data: {"search": self.searchText(), "pageNumber": pageNumber, "filters": self.checkedFilter()}
			}).done(function (data) {
				if (self.isMobile() && pageNumber != 1) {
					self.results.pushAll(data.ResultItems);
				} else {
					self.results(data.ResultItems);
					self.totalResults(data.TotalResults);
					self.pager.pagesCount(Math.floor((data.TotalResults - 1) / data.ResultsPerPage) + 1);
				}
				self.filters(data.FilterMe);
				self.pager.currentPage(pageNumber);
			}).complete(function () {
				self.searchTextHeadline(self.searchText());
				self.displaySpinner(false);
			});
		}

		self.loadMore = function () {
			search(self.pager.currentPage() + 1);
		};

		self.pageChanged = function (data, e, pageItem) {
			pageItem.event.preventDefault();
			search(pageItem.pageIndex);
		}
	}
});

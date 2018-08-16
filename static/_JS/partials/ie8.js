(function ($) {
	window["isIE8"] = true;

	$(function () {
		$("[data-ie8-selector]").each(function () {
			var $this = $(this);
			var ie8Selectors = $this.data("ie8Selector").split("|");
			var ie8Classes = $this.data("ie8Class") ? $this.data("ie8Class").split("|") : [];
			var defaultIE8Classes = {
				":nth-child(odd)": "nth-child-odd",
				":nth-child(even)": "nth-child-even",
				":nth-of-type(even)": "nth-of-type-even",
				":nth-of-type(odd)": "nth-of-type-odd",
				":last-child": "last-child",
				":nth-child(2n+1)": "nth-child-2n-1",
				":nth-child(3n)": "nth-child-3n",
				":nth-child(3n+1)": "nth-child-3n-1",
				":nth-child(3n+3)": "nth-child-3n-3",
				":nth-child(4n+1)": "nth-child-4n-1",
				":nth-child(5n+1)": "nth-child-5n-1",
				":nth-child(16n+4)": "nth-child-16n-4",
				":nth-child(16n+11)": "nth-child-16n-11",
				":not(:first-child)": "not-first-child"
			};

			for (var i = 0; i < ie8Selectors.length; i++) {
				if ($this.is(ie8Selectors[i])) {
					if (ie8Classes.length) {
						$this.addClass(ie8Classes[i]);
					} else {
						$this.addClass(defaultIE8Classes[ie8Selectors[i]]);
					}
				}
			}
		});

		(function addStripingRules() {
			var $sections = $("[data-sectionbg='alternate']");
			$sections.filter(":odd").removeClass("section-default").addClass("section-light");
			$sections.filter(":even").removeClass("section-light").addClass("section-default");
		})();

		$("a:not(.cta-btn)").addClass("not-cta-btn");
	});
})(jQuery);
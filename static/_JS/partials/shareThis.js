(function ($) {
	$.fn.shareThis = function () {
		this.each(function () {
			var $element = $(this);
			var social = $element.data("shareThis");

			var options = getOptions($element);

			var socialFunction = socials[social];
			var url = (socialFunction && socialFunction(options)) || "";

			if (mobileOnlySocials.indexOf(social) != -1) {
				$element.toggle($.viewport.isMobile());
				$(window).on("resize:device", function () {
					$element.toggle($.viewport.isMobile());
				});
			}

			if (notHttpSocials.indexOf(social) != -1) {
				var $href = $("<a>").attr("href", url).html(this.innerHTML);
				$element.empty().append($href);
			} else {
				$element.on("click", function () {
					navigate(url);
				});
			}
		});
	};

	var notHttpSocials = ["whatsapp"];

	var mobileOnlySocials = ["whatsapp"];

	var socials = {
		"facebook": function (options) {
			return "https://www.facebook.com/sharer.php?"
				+ "u=" + encodeURIComponent(options.url)
				+ "&quote=" + encodeURIComponent(options.title)
				+ "&display=popup";
		},
		"twitter": function (options) {
			return "http://twitter.com/share?"
				+ "url=" + encodeURIComponent(options.url)
				+ "&text=" + encodeURIComponent(options.title);
		},
		"linkedin": function (options) {
			return "http://www.linkedin.com/shareArticle?mini=true"
				+ "&url=" + encodeURIComponent(options.url)
				+ "&title=" + encodeURIComponent(options.title)
				+ "&summary=" + encodeURIComponent(options.description);
		},
		"googleplus": function (options) {
			return "https://plus.google.com/share?url=" + encodeURIComponent(options.url);
		},
		"vk": function (options) {
			return "http://vkontakte.ru/share.php?"
				+ "url=" + encodeURIComponent(options.url)
				+ "&title=" + encodeURIComponent(options.title)
				+ "&description=" + encodeURIComponent(options.description)
				+ "&image=" + encodeURIComponent(options.image)
				+ "&noparse=true";
		},
		"whatsapp": function (options) {
			return "whatsapp://send?text="
				+ "" + encodeURIComponent(options.title)
				+ " " + encodeURIComponent(options.description)
				+ "   " + encodeURIComponent(options.url);
		}
	};

	function getOptions($element) {
		var $metas = $("meta");
		var data = $element.data();
		var options = {};

		options.title = data.title || getMetaContent("title") || document.title;
		options.url = data.url || getMetaContent("url") || location.href;
		options.description = data.description || getMetaContent("description") || "";
		options.image = data.image || getMetaContent("image") || "";
		options.siteName = data.siteName || getMetaContent("site_name") || "";

		function getMetaContent(propertyName) {
			return $metas.filter("[property='og:" + propertyName + "']").attr("content")
		}

		options.isOpenGraph = options.description || options.image || options.siteName;

		return options;
	}

	function navigate(url) {
		window.open(url, "_blank");
	}
})(jQuery);

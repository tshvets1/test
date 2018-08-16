function myAccount(selector) {
	if (!selector) {
		return;
	}

	$(selector).each(function () {
		var $element = $(this);
		var deviceName = $element.data("appLink") || navigator.userAgent;
		var links = $element.data("appLinksJson") || $element.data();
		var link = getAppLink(links, deviceName.toLowerCase());
		$element.click(function () {
			window.location.href = link;
		});
	});

	function getAppLink(links, deviceName) {
		switch (true) {
			case /iphone|ipod/i.test(deviceName): {
				return links.iosIphone;
			}
			case /ipad/i.test(deviceName): {
				return links.iosIpad;
			}
			case /android/i.test(deviceName): {
				return links.android;
			}
			case /windows/i.test(deviceName): {
				return links.windows;
			}
		}
		return links.desktop;
	}
}

(function () {
	myAccount("[data-app-link]");
})();
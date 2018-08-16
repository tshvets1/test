define(function () {
	return function (desktopOptions, mobileOptions, tabletOptions) {
		this.getOptions = function () {
			switch ($.viewport.currentDevice()) {
				case $.viewport.VIEWPORT_DEVICE.MOBILE: {
					return mobileOptions || tabletOptions || desktopOptions;
				}
				case $.viewport.VIEWPORT_DEVICE.TABLET: {
					return tabletOptions || desktopOptions;
				}
				default: {
					return desktopOptions;
				}
			}
		}
	}
});

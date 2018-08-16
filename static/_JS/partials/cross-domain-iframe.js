function crossDomainIframe() {
	return {
		message: function (origin, callback) {
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventer = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child window
			eventer(messageEvent, function (e) {
				if (origin && e.origin.replace("https:", "http:") == origin) {
					var key = e.message ? "message" : "data";
					var data = e[key];
					callback(data);
				}
			}, false);
		},
		postMessage: function (origin, data) {
			parent.postMessage(data, origin);
		}
	}
}

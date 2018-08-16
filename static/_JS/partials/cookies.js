function cookies() {
	return {
		set: function (cname, cvalue, exdays, path, domain) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			var _cookieStr = cname + "=" + cvalue +
				(exdays != false ? ";expires=" + d.toUTCString() : "") +
				(path ? ";path=" + path : "") + (domain ? ";domain=" + domain : "");
			document.cookie = _cookieStr;
		},
		sessionCookie: function (cname, cvalue) {
			document.cookie = cname + "=" + cvalue + "; ";
		},
		get: function (cname) {
			var name = cname + "=";
			var ca = document.cookie.split(";");
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == " ") c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
			}
			return "";
		},
		remove: function (name) {
			this.set(name, "", -1);
		}
	}
}
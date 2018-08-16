function textToLinks(searchText, replacement, $startElement, ignoreSelector) {
	if (!searchText || typeof replacement === 'undefined') {
		return;
	}
	ignoreSelector = ignoreSelector ? "," + ignoreSelector : "";
	$startElement = $startElement || $("body");
	var regex = typeof searchText === 'string' ?
		new RegExp(searchText, 'g') : searchText;
	$startElement.find(":not(style,link,meta,script,object,iframe,a,a *" + ignoreSelector + ")")
		.each(function (index, element) {
			for (var i = 0; i < element.childNodes.length; i++) {
				var textNode = element.childNodes[i];
				replaceTextWithLinks(element, textNode);
			}
		});

	function replaceTextWithLinks(element, textNode) {
		if (!textNode || !textNode.data || !regex.test(textNode.data)) {
			return textNode;
		}

		var $div = $("<div/>");
		if ($.isFunction(replacement)) {
			$div.append(textNode.data.replace(regex, function (text) {
				return replacement(element, text);
			}));
		} else {
			$div.append(textNode.data.replace(regex, replacement));
		}

		element.insertBefore($div[0], textNode);
		element.removeChild(textNode);
	}
}

function prepareSearchText(searchText) {
	searchText = searchText || "";
	var replacementObj = {};
	var newSearch = [];

	$.each(searchText.split("|"), function () {
		var pair = this.split("~");
		replacementObj[pair[0]] = pair[1];
		newSearch.push(pair[0]);
		if (pair[0].indexOf("/") != -1) {
			var prop = pair[0].replace("/", "");
			replacementObj[prop] = pair[1];
			newSearch.push(prop);
		}
	});

	return {
		replacementObj: replacementObj,
		searchText: newSearch.join("|")
	};
}
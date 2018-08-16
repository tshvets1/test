define(["knockout", "baseProduct"], function (ko, BaseProduct) {
	function Product(data) {
		var self = this;

		self.product = new BaseProduct(data.Product, data.SEOName);

		// used for backward compatibility
		self.alias = data.AliasName;
		self.bid = ko.observable(+data.Bid);
		self.bid_prev = ko.observable(+data.Bid);
		self.ask = ko.observable(+data.Offer);
		self.ask_prev = ko.observable(+data.Offer);
		self.decimals = +data.Decimals;
		self.spread = ko.computed(function () {
			var diff = parseFloat(self.ask()) - parseFloat(self.bid());
			var pow = self.decimals - (self.decimals % 2);
			var spread = diff * Math.pow(10, pow);
			return spread.toFixed(1);
		});
		self.spread_prev = ko.observable();

		createOrUpdateProperties(this, data);
	}

	function createOrUpdateProperties(objectToUpdate, newData) {
		for (var key in newData) {
			if (newData.hasOwnProperty(key)) {
				var prevValue = newData[key];
				var newValue = newData[key];
				var prevKey = key + "_prev";

				if ($.isNumeric(newValue)) {
					prevValue = +prevValue;
					newValue = +newValue;
				}

				if (objectToUpdate.hasOwnProperty(key)) {
					objectToUpdate[prevKey](objectToUpdate[key]());
					objectToUpdate[key](newValue);
				} else {
					objectToUpdate[prevKey] = ko.observable(prevValue);
					objectToUpdate[key] = ko.observable(prevValue);
				}
			}
		}
	}

	Product.prototype.update = function (data) {
		// used for backward compatibility
		this.spread_prev(this.spread());
		this.bid_prev(this.bid());
		this.ask_prev(this.ask());
		this.bid(+data.Bid);
		this.ask(+data.Offer);
		createOrUpdateProperties(this, data);
	};

	return Product;
});

define(["knockout", "product", "knockout-helpers"], function (ko, Product) {
    return function ($element, initializeData) {
        var self = this;

        self.product = ko.observable();
        self.isDataUpdated = ko.observable(true);
        getData();

        var index = "";

        function getData() {
            self.isDataUpdated = ko.observable(false);
            index = index === "" ? "2" : "";

            if (self.getProductTimeoutId) {
                clearTimeout(self.getProductTimeoutId);
            }

            $.ajax("/_JS/data/dummy/bid_ask_bar" + index + ".json", {
                //data: initializeData.product,
                type: "GET",
                dataType: 'json',
                success: function (data) {
                    data = data.d || [];
                    //filter received data
                    var product = $.grep(data, function (item) {
                        return item.Product === initializeData.product;
                    });

                    if (product.length > 0) {
                        self.product(new Product(product[0]));
                    }

                    self.isDataUpdated = ko.observable(true);
                    self.getProductTimeoutId = setTimeout(getData, initializeData.getProductTimeout);
                }
            });
        }
    }
});

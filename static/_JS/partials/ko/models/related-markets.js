define(["knockout", "product", "knockout-helpers"], function (ko, Product) {
    return function ($element, initializeData) {
        var self = this;

        initializeData.products = initializeData.products.split(",");
        self.products = ko.observableArray();
        self.isDataUpdated = ko.observable(true);
        getData();

        var index = "";

        function getData() {
            self.isDataUpdated = ko.observable(false);
            index = index === "" ? "2" : "";

            if (self.getProductTimoutId) {
                clearTimeout(self.getProductTimoutId);
            }

            $.ajax("/_JS/data/dummy/bid_ask_bar" + index + ".json", {
                //data: initializeData.products,
                type: "GET",
                dataType: 'json',
                success: function (data) {
                    data = data.d || [];

                    var products = data.map(function (item) {
                        return new Product(item);
                    });

                    if (products.length > 0) {
                        self.products(products);
                    }

                    self.isDataUpdated = ko.observable(true);
                    self.getProductTimoutId = setTimeout(getData, initializeData.getProductsTimeout);
                }
            });
        }
    }
});

define(["knockout", "product", "knockout-helpers", "knockout-extenders"], function (ko, Product) {
    return function ($element, initializeData) {
        var self = this;
        self.products = ko.observableArray([]);

        initializeData.products = initializeData.products ? initializeData.products.split(",") : [];
        getData();

        var index = "";

        function getData(callback) {
            index = index === "" ? "2" : "";
            $.ajax("/_JS/data/dummy/bid_ask_bar" + index + ".json", {
                /*$.ajax("/_Srvc/feeds/LiveRates.asmx/GetProductRates", {
                 type: "POST",
                 contentType: 'application/json; charset=utf-8',
                 data: JSON.stringify({ siteId: initializeData.siteId, products: initializeData.products }),
                 dataType: 'json',*/
                success: function (data) {
                    data = data.d;
                    var tempProducts = [];

                    for (var i = 0; i < data.length; i++) {
                        if (self.products().length) {
                            self.products()[i].update(data[i]);
                        } else {
                            tempProducts.push(new Product(data[i]));
                        }
                    }

                    if (tempProducts.length) {
                        self.products(tempProducts);
                    }

                    self.getProductTimoutId = setTimeout(getData, initializeData.getProductsTimeout);
                    if (callback) {
                        callback();
                    }
                },
                failure: function () {
                    console.log('error');
                }
            });
        }
    };
});
define(["knockout", "product", "knockout-helpers", "knockout-extenders"], function (ko, Product) {
    return function ($element, initializeData) {
        var self = this;

        self.products = ko.observableArray([]);
        self.standart = ko.observable(initializeData.defaultStandart);

        initializeData.products = initializeData.products ? initializeData.products.split(",") : [];
        getData();

        self.changeTab = function (data, object, event) {
            event.preventDefault();
            self.standart(data);
        };

        self.update = function (data, event) {
            event.preventDefault();
            getData();
        };

        var index = "";

        function getData(callback) {
            index = index === "" ? "2" : "";
            $.ajax("/_JS/data/dummy/bid_ask_bar" + index + ".json", {
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
define("currentRates", ["knockout", "product", "knockout-helpers", "knockout-extenders"], function (ko, Product) {
    return function ($element, initializeData) {
        var self = this;

        self.products = ko.observableArray();
        self.recordsToDisplay = initializeData.recordsToDisplay;
        self.isTwoColumn = ko.observable(initializeData.isTwoColumn);
        self.selectedOption = ko.observable(initializeData.productType);

        self.selectedOption.subscribe(function (newValue) {
            getData();
        });

        self.isFadeVisible = ko.observable(true);
        self.fadeDuration = ko.observable(initializeData.getFadeDuration);

        self.productsToShow = ko.computed(function () {
            var sliceAmount = Math.round(self.products().length / 2);
            return self.isTwoColumn() ? self.products().slice(0, sliceAmount) : self.products();
        });

        self.productsToShowSecondTable = ko.computed(function () {
            var sliceAmount = Math.round(self.products().length / 2);
            return self.products().slice(sliceAmount, self.products().length);
        });

        getData();
        var index = "";

        function getData() {
            index = index === "" ? "2" : "";

            if (self.timeoutId) {
                clearTimeout(self.timeoutId);
            }

            $.ajax("/_JS/data/dummy/current-rates" + index + ".json", {
                /*$.ajax("/_Srvc/feeds/LiveRates.asmx/GetSpreadsWithBidAsk", {
                 type: "POST",
                 contentType: 'application/json; charset=utf-8',
                 data: JSON.stringify({ siteId: initializeData.siteId, products: initializeData.products /!*here you can place self.selectedOption()*!/ }),*/
                dataType: 'json',
                success: function (data) {
                    self.isFadeVisible(false);
                    data = data.d.slice(0, initializeData.recordsToDisplay);
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

                    $element.find(".current-rates__table tr:nth-child(odd)").addClass("nth-child-odd");
                    self.isFadeVisible(true);
                    self.timeoutId = setTimeout(getData, initializeData.getProductsTimeout);

                },
                failure: function (data) {
                    console.log('error');
                }
            });
        }
    }
});

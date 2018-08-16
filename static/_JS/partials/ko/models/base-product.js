define(function () {
    function ProductName(product, nameInUrl) {
        this.nameInUrl = nameInUrl || product;
        this.value = product;
    }

    ProductName.prototype.toString = function () {
        return this.value;
    };

    ProductName.prototype.toUrl = function (noSlash) {
        var trailingSlash = noSlash ? "" : "/";
        return this.nameInUrl.replace("/", "_").replace(/ /g, "-") + trailingSlash;
    };

    return ProductName;
});
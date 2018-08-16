(function ($) {
    var $window = $(window);

    $("body").on("change", "form.form-dirty :input", function () {
        var $this = $(this);
        if ($.isFunction($this.valid)) {
            $this.valid();
        }
    }).on("focus", "form:not(.form-dirty) :input", function () {
        var $this = $(this);
        if ($this.closest(".site-search").length) {
            return;
        }
        $this.closest("form").addClass("form-dirty");
    }).on("click tap", "form:not(.form-dirty) button", function () {
        $(this).closest("form").addClass("form-dirty");
    });

    var $siteSearch = $(".site-search .site-search__input");

    $siteSearch.autofill(function () {
        this.siblings(".site-search__submit").trigger("click");
    });

    $.validator.setDefaults({
        focusInvalid: false,
        errorPlacement: function ($error, $element) {
            $element.after($error.css("bottom", $element.parent().outerHeight() + "px"));
        }
    });

    $window.on("load resize", function () {
        //todo: replace parent outerHeight with input outerHeight
        $("form.form-dirty").find("label.error").each(function () {
            var $error = $(this);
            if ($error.parent().outerHeight() !== 0) {
                $error.css("bottom", $error.parent().outerHeight() + "px");
            }
        });
    });

    $("[data-validate-form]").each(function () {
        $(this).validate();
    });
})(jQuery);

function newsletter(section) {
    $(document).ready(function () {
        var $section = $(section);
        var ajaxUrl = $section.data("ajaxUrl");
        var $form = $section.find("form");

        $form.submit(function (e) {
            if ($form.valid()) {
                $.ajax({
                    url: ajaxUrl,
                    type: "POST",
                    data: $form.serialize()
                }).done(function () {
                    var template = $section.find("#newsletterSuccessTemplate").html();
                    $section.html(template);
                }).fail(function (a, b, c) {
                    console.log(a + b + c);
                });
            }

            e.preventDefault();
        });
    });
}
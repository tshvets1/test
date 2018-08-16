define(function () {
    return function (workflowItemId) {
        var $form = $("<form data-action='/sitecore/processRequest.aspx' class='form footer-comment__form'></form>");
        $form.append("<h2>Comment</h2>");
        var $textareaDiv = $("<div class='form-div textarea'>" +
                "<textarea name='comment' class='form-textarea' data-rule-required='true' data-should-scroll-to-element></textarea>" +
            "</div>");
        $form.append($textareaDiv);
        $form.append("<input type='hidden' value='" + workflowItemId + "' name='workflowItemID' data-rule-required='true' />");
        $form.append("<input type='hidden' value='' name='requestedAction' data-rule-required='true' />");
        var $buttons = $("<div class='footer-comment__form-buttons'>"
            + "    <button class='cta-btn green' type='button' value='approved' data-min-comment-length='8'>Approve</button>"
            + "    <button class='cta-btn rose' type='button' value='rejected' data-min-comment-length='30'>Reject</button>"
            + "</div>");
        $form.append($buttons);
        $("body").append($form);

        $form.validate();

        $form.on("click", "button", function (e) {
            e.preventDefault();

            var $this = $(this);
            $form.find("[name='requestedAction']").val($this.val());

            var minCommentLength = $this.data("minCommentLength") || 8;

            $form.find("textarea[name='comment']").rules("add", {
                minlength: minCommentLength
            });

            if ($form.valid()) {
                var dataToSend = $form.serialize();
                $form.find("input,textarea,select").prop("disabled", true);
                $.ajax({
                    "type": "POST",
                    "url": $form.data("action"),
                    "data": dataToSend,
                    "success": function (data) {
                        $form.prepend(data || "Succeed").addClass("complete").children().slideUp("fast");
                    },
                    "error": function () {
                        $form.find("input,textarea,select").prop("disabled", "");
                        alert("An error occured");
                    }
                });
            }
        });
    }
});
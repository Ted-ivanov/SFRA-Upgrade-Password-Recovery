    $('body').on('submit', '.reset-password-form', function (e) {
        var form = $(this);
        e.preventDefault();
        var url = form.attr('action');
        form.spinner().start();
        $('.reset-password-form').trigger('login:register', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {
                form.spinner().stop();
                if (!data.success) {
                    formValidation(form, data);
                } else {
                    $('.request-password-title').text(data.receivedMsgHeading);
                    $('.modal-body').html(data.pinFormHtml);
                    $('#reset-password-pin').attr('data-email', data.emailData);
                    $('#reset').val(data.emailData);

                    if (false) {
                        // problem here

                        $('#submitEmailButton').text(data.buttonText)
                            .attr('data-dismiss', 'modal');
                    } else {
                        $('.reset-password-form').html(data.pinFormHtml);
                        $('#reset-password-pin').attr('data-email', data.emailData);
                        $('#reset').val(data.emailData);
                        $('.send-email-btn').empty()
                            .html('<a href="'
                                + data.returnUrl
                                + '" class="btn btn-primary btn-block">'
                                + data.buttonText + '</a>'
                            );
                    }
                }
            },
            error: function () {
                form.spinner().stop();
            }
        });
        return false;
    });

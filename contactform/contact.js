jQuery(document).ready(function($) {
  "use strict";

  function validateField(field, rule, exp, emailExp) {
    var value = field.val();
    var ierror = false;

    switch (rule) {
      case 'required':
        if (value === '') {
          ierror = true;
        }
        break;

      case 'minlen':
        if (value.length < parseInt(exp, 10)) {
          ierror = true;
        }
        break;

      case 'email':
        if (!emailExp.test(value)) {
          ierror = true;
        }
        break;

      case 'checked':
        if (!field.is(':checked')) {
          ierror = true;
        }
        break;

      case 'regexp':
        exp = new RegExp(exp);
        if (!exp.test(value)) {
          ierror = true;
        }
        break;
    }

    return ierror;
  }

  // Contact
  $('form.contactForm').submit(function(e) {
    e.preventDefault();

    var $form = $(this);
    var f = $form.find('.form-group');
    var ferror = false;
    var emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

    $("#sendmessage").removeClass("show");
    $("#errormessage").removeClass("show").html("");

    f.children('input, textarea').each(function() {
      var i = $(this);
      var rule = i.attr('data-rule');

      if (rule !== undefined) {
        var ierror = false;
        var pos = rule.indexOf(':', 0);
        var exp = '';
        if (pos >= 0) {
          exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        ierror = validateField(i, rule, exp, emailExp);
        if (ierror) {
          ferror = true;
        }

        i.next('.validation')
          .html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : ''))
          .show('blind');
      }
    });

    if (ferror) {
      return false;
    }

    var action = $form.attr('action');
    if (!action) {
      action = 'https://api.web3forms.com/submit';
    }

    var $submit = $form.find('button[type="submit"]');
    $submit.prop('disabled', true);

    $.ajax({
      type: "POST",
      url: action,
      data: $form.serialize(),
      dataType: "json",
      success: function(resp) {
        if (resp && resp.success) {
          $("#sendmessage").addClass("show");
          $("#errormessage").removeClass("show");
          $form.find("input, textarea").val("");
        } else {
          var message = (resp && resp.message) ? resp.message : "Submission failed. Please try again.";
          $("#sendmessage").removeClass("show");
          $("#errormessage").addClass("show").html(message);
        }
      },
      error: function(xhr) {
        var message = "Submission failed. Please try again.";
        if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
          message = xhr.responseJSON.message;
        }
        $("#sendmessage").removeClass("show");
        $("#errormessage").addClass("show").html(message);
      },
      complete: function() {
        $submit.prop('disabled', false);
      }
    });

    return false;
  });

});

// AddUser.js
// Clean, DOM-ready initialization so handlers always attach.
// Global functions exposed via window.* so inline onclick attributes work.

(function ($) {
    'use strict';
    // Validation regexes
    var emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var usernameRegex = /^[A-Za-z]+$/; // letters only
    var phoneRegex = /^03[0-9]{9}$/; // starts with 03 and 11 digits total
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;

    // Format ISO date string to local readable form
    function FormatDate(date) {
        if (!date) return "";
        try {
            var d = new Date(date);
            if (isNaN(d)) return date;
            return d.toLocaleDateString() + " " + d.toLocaleTimeString();
        } catch (e) {
            return date;
        }
    }

    // Clear all error messages
    function clearErrors() {
        $("#errFirstName").text("");
        $("#errLastName").text("");
        $("#errEmail").text("");
        $("#errPhone").text("");
        $("#errUsername").text("");
        $("#errPassword").text("");
    }

    // Add suggestions options to datalists
    function addSuggestionOptions(user) {
        try {
            if (!user) return;
            if (user.Username) {
                var uname = user.Username || user.username;
                if (uname && $('#usernameList option[value="' + uname + '"]').length === 0) {
                    $('#usernameList').append($('<option>').val(uname));
                }
            }
            if (user.Email) {
                var em = user.Email || user.email;
                if (em && $('#emailList option[value="' + em + '"]').length === 0) {
                    $('#emailList').append($('<option>').val(em));
                }
            }
            if (user.Phone) {
                var ph = user.Phone || user.phone;
                if (ph && $('#phoneList option[value="' + ph + '"]').length === 0) {
                    $('#phoneList').append($('<option>').val(ph));
                }
            }
        } catch (e) { console.error(e); }
    }

    // Clear form values
    function ClearForm() {
        $("#txtFirstName").val("");
        $("#txtLastName").val("");
        $("#txtEmail").val("");
        $("#txtPhone").val('03');
        $("#txtUsername").val("");
        $("#txtPassword").val("");
        $("#hdnUserId").val('');
        $('#btnRegister').text('Register');
        clearErrors();
    }

    // Validate current form values, returns boolean
    function validateForm() {
        var valid = true;

        var firstName = $("#txtFirstName").val().trim();
        var lastName = $("#txtLastName").val().trim();
        var email = $("#txtEmail").val().trim();
        var phone = $("#txtPhone").val().trim();
        var username = $("#txtUsername").val().trim();
        var password = $("#txtPassword").val();

        clearErrors();

        if (!firstName) {
            $("#errFirstName").text("First Name is required.");
            valid = false;
        }

        if (!lastName) {
            $("#errLastName").text("Last Name is required.");
            valid = false;
        }

        if (!email) {
            $("#errEmail").text("Email is required.");
            valid = false;
        } else if (!emailFormat.test(email)) {
            $("#errEmail").text("Enter a valid Email.");
            valid = false;
        } else {
            // Must contain both letters and digits and no spaces
            if (!/[A-Za-z]/.test(email) || !/\d/.test(email)) {
                $("#errEmail").text("Email must contain both letters and digits.");
                valid = false;
            } else if (/\s/.test(email)) {
                $("#errEmail").text("Email must not contain spaces.");
                valid = false;
            }
        }

        if (!phone) {
            $("#errPhone").text("Phone Number is required.");
            valid = false;
        } else if (!phoneRegex.test(phone)) {
            $("#errPhone").text("Phone must start with 03 and contain 11 digits.");
            valid = false;
        }

        if (!username) {
            $("#errUsername").text("Username is required.");
            valid = false;
        } else if (!usernameRegex.test(username)) {
            $("#errUsername").text("Username must contain letters only (no digits or spaces).");
            valid = false;
        }

        var editing = ($('#hdnUserId').val() || '') ? true : false;
        if (!password) {
            if (!editing) {
                $("#errPassword").text("Password is required.");
                valid = false;
            }
        } else if (/\s/.test(password)) {
            $("#errPassword").text("Password must not contain spaces.");
            valid = false;
        } else if (!passwordRegex.test(password)) {
            $("#errPassword").text("Password must contain uppercase, lowercase, number, special character and minimum 8 characters.");
            valid = false;
        }

        return valid;
    }

    // AJAX submit
    function RegisterUser() {
        clearErrors();
        if (!validateForm()) return;

        // build user object from form fields
        var user = {
            Id: ($('#hdnUserId').val() || '') ? parseInt($('#hdnUserId').val()) : 0,
            FirstName: $('#txtFirstName').val().trim(),
            LastName: $('#txtLastName').val().trim(),
            Email: $('#txtEmail').val().trim(),
            Phone: $('#txtPhone').val().trim(),
            Username: $('#txtUsername').val().trim(),
            Password: $('#txtPassword').val()
        };

        $.ajax({
            url: '/RegistrationUser/RegisterUser',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(user),
            success: function (response) {
                try {
                    var success = false;
                    if (response) {
                        if (response.status === 1 || response.status === 200) success = true;
                        else if (response.success === true) success = true;
                        else if (response.data && (response.data.status === 1 || response.data.status === 200 || response.data.success === true)) success = true;
                    }

                    if (!success) {
                        // handle validation or error messages
                        if (response && response.fieldErrors) {
                            var messages = [];
                            if (response.fieldErrors.Username) { $('#errUsername').text(response.fieldErrors.Username); messages.push(response.fieldErrors.Username); }
                            if (response.fieldErrors.Email) { $('#errEmail').text(response.fieldErrors.Email); messages.push(response.fieldErrors.Email); }
                            if (response.fieldErrors.Phone) { $('#errPhone').text(response.fieldErrors.Phone); messages.push(response.fieldErrors.Phone); }
                            Swal.fire({ icon: 'warning', title: 'Validation', text: messages.join('\n') || response.message || 'Validation failed' });
                            return;
                        }

                        Swal.fire({ icon: 'error', title: 'Error', text: (response && response.message) ? response.message : 'Save failed' });
                        return;
                    }

                    // Success: response.data should contain the created/updated user
                    var updated = response.data || response;
                    var id = updated && (updated.id || updated.Id) ? (updated.id || updated.Id) : null;
                    var firstName = updated && (updated.firstName || updated.FirstName) ? (updated.firstName || updated.FirstName) : user.FirstName;
                    var lastName = updated && (updated.lastName || updated.LastName) ? (updated.lastName || updated.LastName) : user.LastName;
                    var email = updated && (updated.email || updated.Email) ? (updated.email || updated.Email) : user.Email;
                    var phone = updated && (updated.phone || updated.Phone) ? (updated.phone || updated.Phone) : user.Phone;
                    var username = updated && (updated.username || updated.Username) ? (updated.username || updated.Username) : user.Username;
                    var createdDate = updated && (updated.createdDate || updated.CreatedDate) ? (updated.createdDate || updated.CreatedDate) : null;

                    var rowHtml = '<tr>' +
                        '<td>' + (id || '') + '</td>' +
                        '<td>' + firstName + '</td>' +
                        '<td>' + lastName + '</td>' +
                        '<td>' + email + '</td>' +
                        '<td>' + phone + '</td>' +
                        '<td>' + username + '</td>' +
                        '<td>' + (createdDate ? FormatDate(createdDate) : '') + '</td>' +
                        '<td>' +
                            '<button type="button" class="btn btn-warning btn-sm editBtn" data-id="' + (id || '') + '" data-url="/RegistrationUser/RegistrationUser" data-json-url="/RegistrationUser/GetUser/' + (id || '') + '" title="Edit"><i class="bi bi-pencil-square"></i></button> ' +
                            '<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="' + (id || '') + '" data-url="/RegistrationUser/Delete" title="Delete"><i class="bi bi-trash"></i></button>' +
                        '</td>' +
                        '</tr>';

                    Swal.fire({ icon: 'success', title: 'Success', text: (response && response.message) ? response.message : 'Saved' }).then(function () {
                        if (user && user.Id && parseInt(user.Id) > 0) {
                            // edit: update existing row if visible, else reload grid
                            var editBtn = $('#tblUsers tbody')
                                .find("button.editBtn[data-id='" + user.Id + "']");
                            if (editBtn.length) {
                                var $tr = editBtn.closest('tr');
                                $tr.find('td').eq(1).text(firstName);
                                $tr.find('td').eq(2).text(lastName);
                                $tr.find('td').eq(3).text(email);
                                $tr.find('td').eq(4).text(phone);
                                $tr.find('td').eq(5).text(username);
                                $tr.find('td').eq(6).text(createdDate ? FormatDate(createdDate) : $tr.find('td').eq(6).text());
                            } else {
                                window.location.href = '/RegisterUser/User';
                                return;
                            }
                        } else {
                            // create: append
                            if ($('#tblUsers tbody').length) $('#tblUsers tbody').append(rowHtml);
                        }

                        // update datalist suggestions
                        try { addSuggestionOptions({ Username: username, Email: email, Phone: phone }); } catch (e) { }

                        ClearForm();
                        if (window.reloadUsers) window.reloadUsers();
                    });
                    $("#btnRegister").text("Register");
                    $("#hdnUserId").val("");

                } catch (e) {
                    console.error('Error handling RegisterUser response', e, response);
                    var details = e && e.message ? e.message : 'Unexpected response from server.';
                    try { if (response) details += '\nServer response: ' + JSON.stringify(response); } catch (js) { details += '\n[Could not stringify response]'; }
                    Swal.fire({ icon: 'error', title: 'Error', text: details });
                }
            },
            error: function (xhr) {
                var msg = 'Server error';
                try {
                    if (xhr && xhr.responseJSON) {
                        var json = xhr.responseJSON;
                        if (json.message) msg = json.message;
                        else if (json.fieldErrors) msg = Object.values(json.fieldErrors).join('\n');
                    } else if (xhr && xhr.responseText) {
                        var txt = xhr.responseText;
                        try { var parsed = JSON.parse(txt); if (parsed.message) msg = parsed.message; else if (parsed.fieldErrors) msg = Object.values(parsed.fieldErrors).join('\n'); else msg = txt; } catch (e) { msg = txt; }
                    }
                } catch (e) { console.error('Error parsing error response', e); }
                Swal.fire({ icon: 'error', title: 'Server Error', text: msg });
            }
        });
    }

    // Expose global functions for inline onclick usage
    window.RegisterUser = RegisterUser;
    window.ClearForm = ClearForm;

    // DOM ready: attach handlers
    $(function () {
        // If grid table exists on the page, load users
        function loadUsers() {
            var $tbl = $("#tblUsers");
            if ($tbl.length === 0) return;
            var $tbody = $tbl.find('tbody');
            $tbody.html('<tr><td colspan="8" class="text-center">Loading...</td></tr>');
            $.ajax({
                url: '/RegistrationUser/GetUsers',
                type: 'GET',
                dataType: 'json'
            }).done(function (users) {
                // If the endpoint returned an error object instead of an array, show its message
                if (!Array.isArray(users)) {
                    console.error('GetUsers returned non-array:', users);
                    var msg = (users && users.message) ? users.message : 'Unexpected response from server';
                    $tbody.html('<tr><td colspan="8" class="text-center text-danger">' + msg + '</td></tr>');
                    return;
                }

                if (users.length === 0) {
                    $tbody.html('<tr><td colspan="8" class="text-center">No users found</td></tr>');
                    return;
                }

                // populate suggestion datalists
                try { 
                    var suggestions = users.map(function(s){ return { Username: s.Username || s.username, Email: s.Email || s.email, Phone: s.Phone || s.phone }; });
                    suggestions.forEach(function(s){ addSuggestionOptions(s); });
                } catch(e) { }

                var rows = users.map(function (u) {
                    var id = (u.Id || u.id || '');
                    return '<tr>' +
                        '<td>' + id + '</td>' +
                        '<td>' + (u.FirstName || u.firstName || '') + '</td>' +
                        '<td>' + (u.LastName || u.lastName || '') + '</td>' +
                        '<td>' + (u.Email || u.email || '') + '</td>' +
                        '<td>' + (u.Phone || u.phone || '') + '</td>' +
                        '<td>' + (u.Username || u.username || '') + '</td>' +
                        '<td>' + (u.CreatedDate || u.createdDate || '') + '</td>' +
                        '<td>' +
                            '<button type="button" class="btn btn-warning btn-sm editBtn" data-id="' + id + '" data-url="/RegistrationUser/RegistrationUser" data-json-url="/RegistrationUser/GetUser/' + id + '" title="Edit"><i class="bi bi-pencil-square"></i></button> ' +
                            '<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="' + id + '" data-url="/RegistrationUser/Delete" title="Delete"><i class="bi bi-trash"></i></button>' +
                        '</td>' +
                        '</tr>';
                }).join('');
                $tbody.html(rows);
            }).fail(function (xhr, status, err) {
                var text = 'Failed to load users';
                try {
                    if (xhr && xhr.responseJSON && xhr.responseJSON.message) text = xhr.responseJSON.message;
                    else if (xhr && xhr.responseText) text = xhr.responseText;
                } catch (e) { /**/ }
                console.error('GetUsers failed', status, err, xhr);
                $tbody.html('<tr><td colspan="8" class="text-center text-danger">' + $('<div/>').text(text).html() + '</td></tr>');
            });
        }

        // call once on ready
        loadUsers();

        // If datalists for suggestions exist on pages without the users table (e.g., registration page), populate them
        if ($('#usernameList').length || $('#emailList').length || $('#phoneList').length) {
            $.ajax({
                url: '/RegistrationUser/GetUsers',
                type: 'GET',
                dataType: 'json'
            }).done(function (users) {
                if (Array.isArray(users)) {
                    users.forEach(function (u) {
                        addSuggestionOptions({ Username: u.Username || u.username, Email: u.Email || u.email, Phone: u.Phone || u.phone });
                    });
                }
            }).fail(function () { /**/ });
        }
        // Password show/hide toggle (delegated so it works when rendered later)
        $(document).on('click', '#btnTogglePassword', function () {
            var $pwd = $('#txtPassword');
            var $icon = $('#pwdIcon');
            if ($pwd.attr('type') === 'password') {
                $pwd.attr('type', 'text');
                $icon.removeClass('bi-eye').addClass('bi-eye-slash');
            } else {
                $pwd.attr('type', 'password');
                $icon.removeClass('bi-eye-slash').addClass('bi-eye');
            }
        });
        // Ensure phone starts with 03
        var $phone = $("#txtPhone");
        if (!$phone.val() || $phone.val().length < 2 || $phone.val().substring(0, 2) !== '03') {
            $phone.val('03');
        }

        // Prevent typing spaces in certain fields and remove on paste
        $("#txtFirstName,#txtLastName,#txtEmail,#txtUsername,#txtPassword").on('keydown', function (e) {
            if (e.which === 32) { // space
                e.preventDefault();
                var id = $(this).attr('id');
                var errId = '#err' + id.replace('txt', '');
                $(errId).text('No spaces allowed.');
            }
        }).on('input', function () {
            var id = $(this).attr('id');
            var errId = '#err' + id.replace('txt', '');
            var val = $(this).val();
            if (val.indexOf(' ') !== -1) {
                val = val.replace(/\s+/g, '');
                $(this).val(val);
                $(errId).text('No spaces allowed.');
                return;
            }
            // Clear specific errors when field becomes valid
            if (id === 'txtEmail') {
                if (val.length > 0 && emailFormat.test(val) && /[A-Za-z]/.test(val) && /\d/.test(val)) $(errId).text('');
            } else if (id === 'txtUsername') {
                if (val.length > 0 && usernameRegex.test(val)) $(errId).text('');
            } else if (id === 'txtPassword') {
                if (val.length > 0 && !/\s/.test(val) && passwordRegex.test(val)) $(errId).text('');
            } else {
                if (val.length > 0) $(errId).text('');
            }
        });

        // Username: strip non-letter characters immediately
        $("#txtUsername").on('input', function () {
            var newVal = $(this).val().replace(/[^A-Za-z]/g, '');
            $(this).val(newVal);
            if (newVal.length > 0 && usernameRegex.test(newVal)) $("#errUsername").text('');
        });

        // Phone handling: enforce prefix 03, sanitize digits, prevent deleting prefix
        $phone.on('focus', function () {
            var el = this;
            setTimeout(function () { try { el.setSelectionRange(el.value.length, el.value.length); } catch {} }, 0);
        });

        $phone.on('keydown', function (e) {
            var pos = this.selectionStart;
            if ((e.key === 'Backspace' || e.key === 'Delete') && pos <= 2) {
                e.preventDefault();
            }
            // allow only digits, navigation
            if (e.key.length === 1 && !/\d/.test(e.key)) {
                e.preventDefault();
            }
        });

        $phone.on('input', function () {
            var val = $(this).val();
            val = val.replace(/\D/g, '');
            if (val.substring(0, 2) !== '03') {
                // ensure starts with 03
                val = '03' + val.replace(/^0+/, '');
            }
            if (val.length > 11) val = val.substring(0, 11);
            $(this).val(val);

            if (!phoneRegex.test(val)) {
                $("#errPhone").text('Phone must start with 03 and contain 11 digits.');
            } else {
                $("#errPhone").text('');
            }
        });

        // Real-time validation for other fields: clear errors when fixed
        $("#txtFirstName,#txtLastName").on('input', function () {
            var id = $(this).attr('id');
            var errId = '#err' + id.replace('txt', '');
            if ($(this).val().trim().length > 0) $(errId).text('');
        });
        // Handle delete and edit actions for dynamic rows/buttons
        $(document).on("click", ".deleteBtn", function () {

            var id = $(this).data("id");

            // allow override of the delete endpoint via data-url attribute on the button
            var url = $(this).data("url") || '/Users/Delete';

            Swal.fire({
                title: "Delete User?",
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Delete"
            }).then((result) => {

                if (result.isConfirmed) {

                    // try to read anti-forgery token if present on the page
                    var tokenInput = $('input[name="__RequestVerificationToken"]');
                    var token = tokenInput.length ? tokenInput.val() : null;

                    var data = { id: id };
                    if (token) data.__RequestVerificationToken = token;

                    $.ajax({
                        url: url,
                        type: 'POST',
                        data: data,
                        success: function (response) {
                            // response may be JSON or simple text
                            var message = (response && response.message) ? response.message : 'User deleted.';
                            Swal.fire('Deleted!', message, 'success').then(function () {
                                // try to remove the row from the table if present, otherwise reload
                                var row = $("[data-id='" + id + "']").closest('tr');
                                if (row.length) {
                                    row.remove();
                                } else {
                                    if (window.reloadUsers) window.reloadUsers();
                                    else location.reload();
                                }
                            });
                        },
                        error: function (xhr) {
                            var err = 'Could not delete user.';
                            try {
                                if (xhr && xhr.responseJSON && xhr.responseJSON.message) err = xhr.responseJSON.message;
                                else if (xhr && xhr.responseText) err = xhr.responseText;
                            } catch (e) { }
                            Swal.fire('Error', err || 'Could not delete user.', 'error');
                        }
                    });

                }

            });

        });

        $(document).on("click", ".editBtn", function () {

            var id = $(this).data("id");
            // Allow configuring the edit page or the JSON endpoint via data attributes
            var editPageUrl = $(this).data('url') || ('/Users/Edit/' + id);
            var jsonUrl = $(this).data('json-url');

            // If the editPage is the registration page, redirect with ?id= to let that page populate the form
            if (editPageUrl && editPageUrl.indexOf('/RegistrationUser/RegistrationUser') !== -1) {
                window.location.href = editPageUrl + '?id=' + id;
                return;
            }

            // Otherwise, if a JSON url is provided, try to load data to populate a modal
            if (jsonUrl) {
                $.get(jsonUrl).done(function (data) {
                    if (data && typeof data === 'object') {
                        // find a modal or form with id 'editUserModal' and populate inputs by name
                        var modal = $('#editUserModal');
                        if (modal.length) {
                            for (var key in data) {
                                if (!data.hasOwnProperty(key)) continue;
                                var input = modal.find('[name="' + key + '"]');
                                if (!input.length) continue;
                                var val = data[key];
                                if (val === null || typeof val === 'undefined') val = '';
                                if (key.toLowerCase() === 'password') {
                                    // Do not populate password from server; leave blank for security
                                    val = '';
                                }
                                if (input.is(':checkbox')) {
                                    input.prop('checked', !!val);
                                } else if (input.is(':radio')) {
                                    // select matching radio by string value
                                    var v = (val === null || typeof val === 'undefined') ? '' : String(val);
                                    modal.find('[name="' + key + '"][value="' + v + '"]').prop('checked', true);
                                } else {
                                    input.val(val);
                                }
                            }
                            // show the modal (assumes Bootstrap or similar)
                            if (modal.modal) modal.modal('show');
                        } else {
                            // no modal on page, fall back to redirecting to edit page
                            window.location.href = editPageUrl;
                        }
                    } else {
                        // unexpected response, redirect
                        window.location.href = editPageUrl;
                    }
                }).fail(function () {
                    // couldn't fetch JSON, redirect to edit page
                    window.location.href = editPageUrl;
                });
            } else {
                // no json url, just redirect
                window.location.href = editPageUrl;
            }

        });

    });

})(jQuery);

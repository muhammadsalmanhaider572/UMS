// AddUser.js
// Clean, DOM-ready initialization so handlers always attach.
// Global functions exposed via window.* so inline onclick attributes work.


(function ($) {
    'use strict';
    // Store all users loaded from database
    var usersList = [];
    // Validation regexes
    var emailFormat = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    var usernameRegex = /^[a-z]+$/; // lowercase letters only
    var nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/; // letters and spaces only
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
            if (user.FirstName) {
                var firstName = user.FirstName || user.firstName;
                if (firstName && $('#firstNameList option[value="' + firstName + '"]').length === 0) {
                    $('#firstNameList').append($('<option>').val(firstName));
                }
            }
            if (user.LastName) {
                var lastName = user.LastName || user.lastName;
                if (lastName && $('#lastNameList option[value="' + lastName + '"]').length === 0) {
                    $('#lastNameList').append($('<option>').val(lastName));
                }
            }
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

    function updateClearButtonLabel() {
        var editing = (($('#hdnUserId').val() || '').toString().trim() !== '');
        $('#btnClear').text(editing ? 'Cancel' : 'Clear');
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
        updateClearButtonLabel();
    }

    function applyFieldErrors(fieldErrors) {
        if (!fieldErrors) return;
        if (fieldErrors.Username) { $('#errUsername').text(fieldErrors.Username); }
        if (fieldErrors.Email) { $('#errEmail').text(fieldErrors.Email); }
        if (fieldErrors.Phone) { $('#errPhone').text(fieldErrors.Phone); }
        if (fieldErrors.Password) { $('#errPassword').text(fieldErrors.Password); }
    }

    function CancelEditOrClear() {
        var editing = (($('#hdnUserId').val() || '').toString().trim() !== '');
        if (editing) {
            window.location.href = '/RegisterUser/User';
            return;
        }

        ClearForm();
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
        } else if (!nameRegex.test(firstName)) {
            $("#errFirstName").text("First Name can only contain letters and spaces.");
            valid = false;
        }

        if (!lastName) {
            $("#errLastName").text("Last Name is required.");
            valid = false;
        } else if (!nameRegex.test(lastName)) {
            $("#errLastName").text("Last Name can only contain letters and spaces.");
            valid = false;
        }

        if (!email) {
            $("#errEmail").text("Email is required.");
            valid = false;
        } else if (!emailFormat.test(email)) {
            $("#errEmail").text("Email must be lowercase and use a valid format.");
            valid = false;
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
            $("#errUsername").text("Username must contain lowercase letters only.");
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

    function checkDuplicateFields() {

        var id = parseInt($("#hdnUserId").val()) || 0;

        var username = $("#txtUsername").val().trim().toLowerCase();
        var email = $("#txtEmail").val().trim().toLowerCase();
        var phone = $("#txtPhone").val().trim();
        var password = $("#txtPassword").val();

        var duplicateFound = false;

        clearErrors();

        $.each(usersList, function (index, user) {

            // Ignore same user while editing
            if (id > 0 && user.Id == id)
                return true;

            if (user.Username &&
                user.Username.toLowerCase() === username) {

                $("#errUsername").text("Username already exists.");
                duplicateFound = true;
            }

            if (user.Email &&
                user.Email.toLowerCase() === email) {

                $("#errEmail").text("Email already exists.");
                duplicateFound = true;
            }

            if (user.Phone &&
                user.Phone === phone) {

                $("#errPhone").text("Phone already exists.");
                duplicateFound = true;
            }

            if (user.Password &&
                user.Password === password) {

                $("#errPassword").text("Password already exists.");
                duplicateFound = true;
            }

        });

        return !duplicateFound;
    }

    // AJAX submit
    function RegisterUser() {
        clearErrors();
        if (!validateForm())
            return;

        if (!checkDuplicateFields())
            return;

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

                        clearErrors();

                        // Email Duplicate
                        if (response.status == 409 &&
                            response.message.toLowerCase().indexOf("email") >= 0) {

                            $("#errEmail").text(response.message);

                            Swal.fire({
                                icon: "warning",
                                title: "Duplicate Email",
                                text: response.message
                            });

                            return;
                        }

                        // Username Duplicate
                        if (response.status == 409 &&
                            response.message.toLowerCase().indexOf("username") >= 0) {

                            $("#errUsername").text(response.message);

                            Swal.fire({
                                icon: "warning",
                                title: "Duplicate Username",
                                text: response.message
                            });

                            return;
                        }

                        // Any other error
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: response.message || "Save failed."
                        });

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
                        if (!user || !user.Id || parseInt(user.Id) <= 0) {
                            window.location.href = '/RegisterUser/User';
                            return;
                        }

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
                var response = null;
                var msg = 'Server error';
                try {
                    if (xhr && xhr.responseJSON) {
                        response = xhr.responseJSON;
                    } else if (xhr && xhr.responseText) {
                        var txt = xhr.responseText;
                        try { response = JSON.parse(txt); } catch (e) { response = null; }
                    }

                    if (response) {
                        if (response.fieldErrors) {
                            applyFieldErrors(response.fieldErrors);
                            var messages = [];
                            if (response.fieldErrors.Username) { messages.push(response.fieldErrors.Username); }
                            if (response.fieldErrors.Email) { messages.push(response.fieldErrors.Email); }
                            if (response.fieldErrors.Phone) { messages.push(response.fieldErrors.Phone); }
                            if (response.fieldErrors.Password) { messages.push(response.fieldErrors.Password); }
                            msg = messages.join('\n') || response.message || 'Validation failed';
                        } else if (response.message) {
                            msg = response.message;
                        }
                    }
                } catch (e) { console.error('Error parsing error response', e); }

                var icon = (response && response.fieldErrors) ? 'warning' : 'error';
                Swal.fire({ icon: icon, title: (response && response.fieldErrors) ? 'Validation' : 'Server Error', text: msg });
            }
        });
    }

    // Expose global functions for inline onclick usage
    window.RegisterUser = RegisterUser;
    window.ClearForm = ClearForm;
    window.CancelEditOrClear = CancelEditOrClear;

    // DOM ready: attach handlers
    $(function () {
        updateClearButtonLabel();

        if (!$('#hdnUserId').val()) {
            $('#txtPassword').val('');
        }

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
                usersList = users;
                console.log("Users Loaded:", usersList);
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
                    var suggestions = users.map(function(s){ return { FirstName: s.FirstName || s.firstName, LastName: s.LastName || s.lastName, Username: s.Username || s.username, Email: s.Email || s.email, Phone: s.Phone || s.phone }; });
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
                        addSuggestionOptions({ FirstName: u.FirstName || u.firstName, LastName: u.LastName || u.lastName, Username: u.Username || u.username, Email: u.Email || u.email, Phone: u.Phone || u.phone });
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

        // Validate names, email, username, and password in real time
        $("#txtFirstName,#txtLastName").on('input', function () {
            var id = $(this).attr('id');
            var errId = '#err' + id.replace('txt', '');
            var val = $(this).val();
            var sanitized = val.replace(/[^A-Za-z\s]/g, '');
            if (sanitized !== val) {
                $(this).val(sanitized);
                val = sanitized;
            }

            if (!val.trim()) {
                $(errId).text(id === 'txtFirstName' ? 'First Name is required.' : 'Last Name is required.');
            } else if (!nameRegex.test(val.trim())) {
                $(errId).text(id === 'txtFirstName' ? 'First Name can only contain letters and spaces.' : 'Last Name can only contain letters and spaces.');
            } else {
                $(errId).text('');
            }
        });

        $("#txtEmail").on('input', function () {
            var val = $(this).val().toLowerCase();
            if ($(this).val() !== val) {
                $(this).val(val);
            }

            if (!val) {
                $("#errEmail").text('Email is required.');
            } else if (!emailFormat.test(val)) {
                $("#errEmail").text('Email must be lowercase and use a valid format.');
            } else {
                $("#errEmail").text('');
            }
        });

        $("#txtUsername").on('input', function () {
            var val = $(this).val().toLowerCase();
            if ($(this).val() !== val) {
                $(this).val(val);
            }
            val = val.replace(/[^a-z]/g, '');
            $(this).val(val);

            if (!val) {
                $("#errUsername").text('Username is required.');
            } else if (!usernameRegex.test(val)) {
                $("#errUsername").text('Username must contain lowercase letters only.');
            } else {
                $("#errUsername").text('');
            }
        });

        $("#txtPassword").on('input', function () {
            var val = $(this).val();
            if (val.length > 0 && !/\s/.test(val) && passwordRegex.test(val)) {
                $("#errPassword").text('');
            }
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
                                    // Preserve the existing password when editing so the form is prefilled.
                                    val = (val === null || typeof val === 'undefined') ? '' : String(val);
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

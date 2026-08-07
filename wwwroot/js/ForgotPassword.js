$(function () {

    $("#btnUpdate").click(function () {

        updatePassword();

    });

});

function updatePassword() {

    var username = $("#txtUsername").val().trim();

    var password = $("#txtPassword").val();

    var confirmPassword = $("#txtConfirmPassword").val();

    if (username == "") {

        Swal.fire("Validation",
            "Enter Username",
            "warning");

        return;
    }

    if (password == "") {

        Swal.fire("Validation",
            "Enter Password",
            "warning");

        return;
    }

    if (password != confirmPassword) {

        Swal.fire("Validation",
            "Passwords do not match",
            "warning");

        return;
    }

    $.ajax({

        url: "/Login/UpdatePassword",

        type: "POST",

        data: {

            username: username,

            password: password

        },

        success: function (response) {

            if (response.status != 200) {

                Swal.fire(

                    "Error",

                    response.message,

                    "error");

                return;
            }

            Swal.fire({

                icon: "success",

                title: "Success",

                text: response.message

            }).then(function () {

                window.location.href = "/Login/Login";

            });

        },

        error: function () {

            Swal.fire(

                "Error",

                "Server Error",

                "error");

        }

    });

}
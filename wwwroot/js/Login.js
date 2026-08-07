$(function () {

    $("#btnTogglePassword").click(function () {

        var txt = $("#txtPassword");

        var icon = $("#pwdIcon");

        if (txt.attr("type") == "password") {

            txt.attr("type", "text");

            icon.removeClass("bi-eye");

            icon.addClass("bi-eye-slash");

        }
        else {

            txt.attr("type", "password");

            icon.removeClass("bi-eye-slash");

            icon.addClass("bi-eye");

        }

    });

    $("#btnLogin").click(function () {

        Login();

    });

});

function Login() {

    var username = $("#txtUsername").val().trim();

    var password = $("#txtPassword").val();

    if (username == "") {

        Swal.fire("Validation", "Enter Username", "warning");

        return;

    }

    if (password == "") {

        Swal.fire("Validation", "Enter Password", "warning");

        return;

    }

    $.ajax({

        url: "/Login/Login",

        type: "POST",

        contentType: "application/json",

        data: JSON.stringify({

            Username: username,

            Password: password

        }),

        success: function (response) {

            if (response.status == 404) {

                Swal.fire({

                    icon: "error",

                    title: "Username",

                    text: response.message

                });

                return;

            }

            if (response.status == 401) {

                Swal.fire({

                    icon: "error",

                    title: "Password",

                    text: response.message

                });

                return;

            }

            if (response.status == 200) {

                Swal.fire({

                    icon: "success",

                    title: "Success",

                    text: response.message

                }).then(function () {

                    window.location.href = "/Home/Dashboard";

                });

            }

        },

        error: function () {

            Swal.fire(

                "Error",

                "Server Error",

                "error"

            );

        }

    });

}
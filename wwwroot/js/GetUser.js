//==========================================
// GetUser.js
//==========================================

$(document).ready(function () {

    LoadUsers();

});

//==========================================
// Load Users
//==========================================

// function LoadUsers() {

//     $.ajax({

//         url: "/RegistrationUser/GetUsers",

//         type: "GET",

//         dataType: "json",

//         success: function (response) {

//             $("#tblUsers tbody").empty();

//             if (response == null || response.length == 0) {

//                 $("#tblUsers tbody").append(`
//                     <tr>
//                         <td colspan="8" class="text-center">
//                             No Users Found
//                         </td>
//                     </tr>
//                 `);

//                 return;
//             }

//             $.each(response, function (index, user) {

//                 var row = `
//                     <tr>

//                         <td>${user.id ?? user.Id}</td>

//                         <td>${user.firstName ?? user.FirstName}</td>

//                         <td>${user.lastName ?? user.LastName}</td>

//                         <td>${user.email ?? user.Email}</td>

//                         <td>${user.phone ?? user.Phone}</td>

//                         <td>${user.username ?? user.Username}</td>

//                         <td>${FormatDate(user.createdDate ?? user.CreatedDate)}</td>

//                         <td>
//                             <button type="button" class="btn btn-warning btn-sm editBtn" data-id="${user.id ?? user.Id}" data-url="/RegistrationUser/RegistrationUser" data-json-url="/RegistrationUser/GetUser/${user.id ?? user.Id}" title="Edit">
//                                 <i class="bi bi-pencil-square"></i>
//                             </button>
//                             <button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="${user.id ?? user.Id}" data-url="/RegistrationUser/Delete" title="Delete">
//                                 <i class="bi bi-trash"></i>
//                             </button>
//                         </td>

//                     </tr>
//                 `;

//                 $("#tblUsers tbody").append(row);

//             });

//         },

//         error: function (xhr) {

//             console.log(xhr);

//             $("#tblUsers tbody").html(`
//                 <tr>
//                     <td colspan="8" class="text-center text-danger">
//                         Failed to load users.
//                     </td>
//                 </tr>
//             `);

//         }

//     });

// }

//==========================================
// Format Date
//==========================================

function FormatDate(date) {

    if (!date)
        return "";

    var d = new Date(date);

    if (isNaN(d))
        return date;

    return d.toLocaleDateString() + " " + d.toLocaleTimeString();

}
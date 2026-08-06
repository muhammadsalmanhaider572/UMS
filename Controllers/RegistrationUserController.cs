using Microsoft.AspNetCore.Mvc;
using UMS.Models;
using UMS.Services.Interfaces;
using System;
using System.Collections;
using UMS.Models;

namespace UMS.Controllers
{
    public class RegistrationUserController : Controller
    {
        private readonly IRegistrationUserService _service;
        private readonly IWebHostEnvironment _env;

        public RegistrationUserController(
            IRegistrationUserService service,
            IWebHostEnvironment env)
        {
            _service = service;
            _env = env;
        }

        //==========================================
        // GET USER BY ID (FOR EDIT)
        //==========================================
        [HttpGet("/RegistrationUser/GetUser/{id}")]
        public IActionResult GetUser(int id)
        {
            try
            {
                var user = _service.GetUserById(id);

                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User not found."
                    });
                }

                return Json(user);
            }
            catch (Exception ex)
            {
                if (_env.IsDevelopment())
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = ex.Message,
                        detail = ex.ToString()
                    });
                }

                return StatusCode(500, new
                {
                    success = false,
                    message = "Unable to load user."
                });
            }
        }

        //==========================================
        // DELETE USER
        //==========================================
        [HttpPost("/RegistrationUser/Delete")]
        public IActionResult Delete([FromForm] int id)
        {
            try
            {
                var deleted = _service.DeleteUser(id);

                if (!deleted)
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Failed to delete user."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "User deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        //==========================================
        // USER GRID
        //==========================================
        [HttpGet("/RegisterUser/User")]
        public IActionResult User()
        {
            return View("User");
        }

        //==========================================
        // REGISTRATION PAGE
        //==========================================
        [HttpGet("/RegistrationUser/RegistrationUser")]
        public IActionResult RegistrationUser([FromQuery] int? id)
        {
            if (id.HasValue && id.Value > 0)
            {
                try
                {
                    var user = _service.GetUserById(id.Value);

                    if (user != null)
                    {
                        ViewBag.EditUser = true;
                        ViewBag.User = user;
                    }
                    else
                    {
                        ViewBag.EditUser = false;
                    }
                }
                catch
                {
                    ViewBag.EditUser = false;
                }
            }

            return View();
        }

        //==========================================
        // GET ALL USERS
        //==========================================
        [HttpGet("/RegistrationUser/GetUsers")]
        public IActionResult GetUsers(
     int pageNumber = 1,
     int pageSize = 10,
     string search = "")
        {
            try
            {
                var result = _service.GetUsers(pageNumber, pageSize, search);

                return Json(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        //==========================================
        // REGISTER / UPDATE USER
        //==========================================
        [HttpPost("/RegistrationUser/RegisterUser") ]
        public IActionResult RegisterUser([FromBody] User user)
        {
            try
            {
                if (user == null)
                {
                    return BadRequest(new
                    {
                        status = 400,
                        message = "Invalid user data."
                    });
                }

                // Duplicate validation has been removed.
                // JavaScript performs the client-side check.
                // The Stored Procedure should still handle duplicates.

                RegisterUserResponse result = _service.RegisterUser(user);

                return Ok(new
                {
                    status = result.Status,
                    message = result.Message,
                    data = result
                });
            }
            catch (Exception ex)
            {
                if (_env.IsDevelopment())
                {
                    return StatusCode(500, new
                    {
                        status = 500,
                        message = ex.Message,
                        detail = ex.ToString()
                    });
                }

                return StatusCode(500, new
                {
                    status = 500,
                    message = "An unexpected error occurred."
                });
            }
        }
    }
}
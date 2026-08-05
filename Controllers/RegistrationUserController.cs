using Microsoft.AspNetCore.Mvc;
using UMS.Models;
using UMS.Services.Interfaces;
using System;
using System.Collections;
using System.Reflection;

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
        // GET USER BY ID (for edit)
        //==========================================
        [HttpGet("/RegistrationUser/GetUser/{id}")]
        public IActionResult GetUser(int id)
        {
            try
            {
                var user = _service.GetUserById(id);
                if (user == null) return NotFound(new { message = "User not found" });
                return Json(user);
            }
            catch (Exception ex)
            {
                if (_env.IsDevelopment())
                {
                    return StatusCode(500, new { success = false, message = ex.Message, detail = ex.ToString() });
                }
                return StatusCode(500, new { success = false, message = "Unable to load user." });
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
                    return StatusCode(500, new { success = false, message = "Failed to delete user." });
                }
                return Ok(new { success = true, message = "User deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
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
            // If an id is provided, load the user and pass via ViewBag for server-side rendering of edit form
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
        // GET USERS
        //==========================================
        [HttpGet("/RegistrationUser/GetUsers")]
        public IActionResult GetUsers()
        {
            try
            {
                var users = _service.GetUsers();

                return Json(users);
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
                    message = "Unable to load users."
                });
            }
        }

        //==========================================
        // REGISTER USER
        //==========================================
        [HttpPost("/RegistrationUser/RegisterUser")]
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

                object result = _service.RegisterUser(user);

                int respStatus = 200;
                string respMessage = "";

                if (result != null)
                {
                    if (result is IDictionary dict)
                    {
                        foreach (DictionaryEntry item in dict)
                        {
                            string key = item.Key?.ToString();

                            if (key.Equals("Status", StringComparison.OrdinalIgnoreCase))
                                respStatus = Convert.ToInt32(item.Value);

                            if (key.Equals("Message", StringComparison.OrdinalIgnoreCase))
                                respMessage = item.Value?.ToString();
                        }
                    }
                }

                return Ok(new
                {
                    status = respStatus,
                    message = respMessage,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = 500,
                    message = ex.Message
                });
            }
        }
    }
}
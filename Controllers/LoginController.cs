using Microsoft.AspNetCore.Mvc;
using UMS.Models;
using UMS.Services.Interfaces;

namespace UMS.Controllers
{
    public class LoginController : Controller
    {
        private readonly IRegistrationUserService _service;

        public LoginController(IRegistrationUserService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = _service.LoginUser(request);

                if (result == null)
                {
                    return Ok(new
                    {
                        status = 500,
                        message = "Unable to login."
                    });
                }

                if (result.Status != 200)
                {
                    return Ok(result);
                }

                HttpContext.Session.SetInt32("UserId", result.Id);
                HttpContext.Session.SetString("Username", result.Username);

                return Ok(result);
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

        [HttpGet]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();

            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public IActionResult UpdatePassword(string username, string password)
        {
            var result = _service.UpdatePassword(username, password);

            return Ok(result);
        }
    }
}
using Microsoft.AspNetCore.Mvc;

namespace UMS.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Dashboard()
        {
            if (HttpContext.Session.GetString("Username") == null)
            {
                return RedirectToAction("Login", "Login");
            }

            ViewBag.Username = HttpContext.Session.GetString("Username");

            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();

            return RedirectToAction("Login", "Login");
        }
    }
}
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Sitemap()
        {
            return View();
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.Controllers
{
    [Authorize]
    public class EducationController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

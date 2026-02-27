using Microsoft.AspNetCore.Mvc;

namespace FinTrack.Controllers.Api
{
    public class BudgetController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

using Microsoft.AspNetCore.Mvc;

namespace SantaReporter.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

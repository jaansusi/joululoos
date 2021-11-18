using Microsoft.AspNetCore.Mvc;
using SantaReporter.Models;

namespace SantaReporter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Get(Guid code)
        {
            using (var db = new SantaContext())
            {
                Santa? santa = db.Santas?.First(x => x.Id == code);
                if (santa != null)
                    return Ok(santa.DesignatedPerson);
                else
                    return BadRequest();
            }
        }
    }
}

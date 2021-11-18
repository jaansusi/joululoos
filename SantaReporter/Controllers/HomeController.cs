using Microsoft.AspNetCore.Mvc;
using SantaReporter.Models;

namespace SantaReporter.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly string EncryptionKey;

        public HomeController(IConfiguration configuration)
        {
            EncryptionKey = configuration.GetValue(typeof(string), "EncryptionKey")?.ToString() ?? String.Empty;
            if (String.IsNullOrEmpty(EncryptionKey))
                throw new Exception("EncryptionKey missing from config!");
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Get(Guid code)
        {
            using (var db = new SantaContext())
            {
                Santa? santa = db.Santas?.First(x => x.Id == code);
                if (santa != null)
                {
                    var ef = new EncryptionFactory(EncryptionKey);
                    var decryptedName = ef.Decrypt(santa.DesignatedPerson);
                    return Ok(decryptedName);
                }
                else
                    return BadRequest();
            }
        }
    }
}

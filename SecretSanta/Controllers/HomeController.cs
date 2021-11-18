using Microsoft.AspNetCore.Mvc;
using SecretSanta.Models;

namespace SecretSanta.Controllers
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
                    var symmetricEncryptDecrypt = new EncryptionFactory();
                    var decryptedName = symmetricEncryptDecrypt.Decrypt(santa.DesignatedPerson, santa.IVBase64, EncryptionKey);
                    db.LogEntries?.Add(new LogEntry(santa.Id, Request.Headers["User-Agent"], Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? String.Empty));
                    db.SaveChanges();
                    var response = new SantaDto
                    {
                        Name = santa.Name,
                        DesignatedPerson = decryptedName
                    };
                    return Ok(response);
                }
                else
                    return BadRequest();
            }
        }
    }
}

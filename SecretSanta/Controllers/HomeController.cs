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
            EncryptionKey = configuration.GetValue(typeof(string), "EncryptionKey")?.ToString() ?? string.Empty;
            if (string.IsNullOrEmpty(EncryptionKey))
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
                    var userAgent = Request.Headers["User-Agent"];
                    var ip = Request.Headers["X-Forwarded-For"].Count > 0 ? Request.Headers["X-Forwarded-For"].ToString() : string.Empty;

                    db.LogEntries?.Add(new LogEntry(santa.Id, userAgent, ip));
                    db.SaveChanges();

                    var logEntries = db.LogEntries?.Where(entry => entry.CodeOwner == code);
                    var response = new SantaDto(
                        santa.Name,
                        decryptedName,
                        logEntries?.Count() ?? 0,
                        logEntries?.Select(x => x.UserAgent).Distinct().Count() ?? 0
                    );
                    return Ok(response);
                }
                else
                    return BadRequest();
            }
        }
    }
}

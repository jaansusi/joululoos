using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecretSanta.Models;
using System.Net;

namespace SecretSanta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly string AdminSecret;
        private readonly string EncryptionKey;

        public AdminController(IConfiguration configuration)
        {
            AdminSecret = configuration.GetValue(typeof(string), "AdminSecret")?.ToString() ?? String.Empty;
            EncryptionKey = configuration.GetValue(typeof(string), "EncryptionKey")?.ToString() ?? String.Empty;
            if (String.IsNullOrEmpty(AdminSecret) || String.IsNullOrEmpty(EncryptionKey))
                throw new Exception("AdminSecret or EncryptionKey missing from config!");
        }

        [HttpGet]
        [Route("getFamilies")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Family>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetFamilies()
        {
            if (Request.Headers.Authorization != AdminSecret)
            {
                return Unauthorized();
            }


            using (var db = new SantaContext())
            {
                var santas = db.Santas?.ToList() ?? new List<Santa>();
                return Ok(santas);
            }
        }

        [HttpPost]
        [Route("setFamilies")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult SetFamilies([FromBody] List<Family> families)
        {
            if (Request.Headers.Authorization != AdminSecret)
            {
                return Unauthorized();
            }
            var response = new Dictionary<string, string>();
            bool done = false;
            using (var db = new SantaContext())
            {

                db.Santas?.RemoveRange(db.Santas);
                db.SaveChanges();
                
                do
                {
                    var transaction = db.Database.BeginTransaction();
                    try
                    {
                        for (int i = 0; i < families.Count; i++)
                        {
                            Family currentFamily = families.ElementAt(i);
                            IEnumerable<Family> otherFamilies = families.Where(x => x.Id != currentFamily.Id);
                            foreach (Person person in currentFamily.Members)
                            {
                                //Assuming that this person is not gifting to anyone!
                                //Get people that are not getting a gift from anyone, random them up
                                List<Person> personsWithoutIsGiftedTo = otherFamilies
                                                                        .SelectMany(x => x.Members)
                                                                        .Where(x => !x.IsGiftedTo)
                                                                        .OrderBy(x => Guid.NewGuid())
                                                                        .ToList();
                                Person giftingTo = personsWithoutIsGiftedTo.First();
                                
                                person.GiftingTo = giftingTo;
                                giftingTo.IsGiftedTo = true;

                            }
                        }
                        done = true;
                        foreach (Family family in families)
                        {
                            foreach (Person person in family.Members)
                            {
                                if (person.GiftingTo == null)
                                    throw new Exception("GiftingTo is Null!");

                                var name = person.GiftingTo.Name;

                                var symmetricEncryptDecrypt = new EncryptionFactory();
                                var IVBase64 = symmetricEncryptDecrypt.InitSymmetricEncryptionIV(EncryptionKey);

                                var encryptedName = symmetricEncryptDecrypt.Encrypt(name, IVBase64, EncryptionKey);
                                var santa = new Santa(person.Name, encryptedName, IVBase64);
                                db.Santas?.Add(santa);
                                response.Add(person.Name, santa.Id.ToString());
                            }
                        }
                        db.LogEntries?.RemoveRange(db.LogEntries);
                        db.SaveChanges();
                    }
                    catch (Exception ex)
                    {
                        if (ex is InvalidOperationException)
                        {
                            //All good, this exception is expected, reset and try again!
                            transaction.Rollback();
                            response = new Dictionary<string, string>();
                        }
                        else
                        {
                            throw;
                        }
                    }
                    transaction.Commit();
                } while (!done);
            }
                


            return Ok(response);
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SantaReporter.Models;
using System.Net;

namespace SantaReporter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        protected string adminSecret = "a";
        [HttpGet]
        [Route("getFamilies")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Family>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetFamilies()
        {
            if (Request.Headers.Authorization != this.adminSecret)
            {
                return Unauthorized();
            }
            var families = new List<Family>();

            using (var db = new SantaContext())
            {
                return Ok(db.Santas?.ToList());
            }
        }

        [HttpPost]
        [Route("setFamilies")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult SetFamilies([FromBody] List<Family> families)
        {
            if (Request.Headers.Authorization != this.adminSecret)
            {
                return Unauthorized();
            }
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
                                if (person.GiftingTo != null)
                                    db.Santas?.Add(new Santa(person.Name, person.GiftingTo.Name));
                            }
                        }

                        db.SaveChanges();
                    }
                    catch (Exception ex)
                    {
                        if (ex is InvalidOperationException)
                        {
                            //All good, this exception is expected, try again!
                            transaction.Rollback();
                        }
                        else
                        {
                            throw;
                        }
                    }
                    transaction.Commit();
                } while (!done);

            }
                


            return Ok();
        }
    }
}

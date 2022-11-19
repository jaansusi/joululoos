using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecretSanta.Models;
using System;
using System.Net;
using System.Xml.Linq;

namespace SecretSanta.Controllers
{
    /// <summary>
    /// Includes all the necessary functionalities to create
    /// and validate Santas and their giftees to make sure
    /// that everyone does indeed get a present.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly string AdminSecret;
        private readonly string EncryptionKey;

        public AdminController(IConfiguration configuration)
        {
            AdminSecret = configuration.GetValue(typeof(string), "AdminSecret")?.ToString() ?? string.Empty;
            EncryptionKey = configuration.GetValue(typeof(string), "EncryptionKey")?.ToString() ?? string.Empty;
            if (string.IsNullOrEmpty(AdminSecret) || string.IsNullOrEmpty(EncryptionKey))
                throw new Exception("AdminSecret or EncryptionKey missing from config!");
        }

        [HttpGet]
        [Route("getSantas")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Family>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetSantas()
        {
            using (var db = new SantaContext())
            {
                var santas = db.Santas?.ToList() ?? new List<Santa>();
                return Ok(santas);
            }
        }

        [HttpPost]
        [Route("generateSantas")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public IActionResult GenerateSantas([FromBody] List<Family> families)
        {
            var response = new Dictionary<string, string>();
            using (var db = new SantaContext())
            {
                // Clean out old santas and logs
                db.Santas?.RemoveRange(db.Santas);
                db.LogEntries?.RemoveRange(db.LogEntries);
                db.SaveChanges();
                try
                {
                    List<PersonGraphNode> personGraph = new List<PersonGraphNode>();
                    // Populate graph
                    families.ForEach(family =>
                        family.Members.ForEach(person =>
                            personGraph.Add(new PersonGraphNode(person, families.FindAll(x => x.Id != family.Id).SelectMany(x => x.Members).ToList()))
                        )
                    );
                    List <PersonGraphNode>? path = FindHamiltonianPath(personGraph.OrderBy(a => Guid.NewGuid()).ToList(), new List<PersonGraphNode>());

                    for (int i = 0; i < path.Count; i++)
                    {
                        var person = path[i].Person;
                        var symmetricEncryptDecrypt = new EncryptionFactory();
                        var IVBase64 = symmetricEncryptDecrypt.InitSymmetricEncryptionIV(EncryptionKey);

                        var name = i + 1 == path.Count ? path[0].Person.Name : path[i + 1].Person.Name;
                        var encryptedName = symmetricEncryptDecrypt.Encrypt(name, IVBase64, EncryptionKey);
                        var santa = new Santa(person.Name, encryptedName, IVBase64);
                        db.Santas?.Add(santa);
                        response.Add(person.Name, santa.Id.ToString());
                    }
                    if (path.Count > 0)
                    {
                        db.SaveChanges();
                        return Ok(response);
                    }
                    return UnprocessableEntity("Lahendust ei leitud");
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex);
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }
        }

        [HttpPost]
        [Route("validateSantas")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public IActionResult ValidateSantas([FromBody] Dictionary<string, string> santas)
        {
            var response = new ValidationDto();
            using (var db = new SantaContext())
            {
                foreach (var santa in santas)
                {
                    response.Santas.Add(santa.Key);
                    var thisSanta = db.Santas?.Find(Guid.Parse(santa.Value));
                    if (thisSanta == null)
                        return UnprocessableEntity("EI KLAPI");
                    var symmetricEncryptDecrypt = new EncryptionFactory();
                    var decryptedName = symmetricEncryptDecrypt.Decrypt(thisSanta.DesignatedPerson, thisSanta.IVBase64, EncryptionKey);
                    response.Receivers.Add(decryptedName);
                }
            }
            response.Santas = response.Santas.OrderBy(x => x).ToList();
            response.Receivers = response.Receivers.OrderBy(x => x).ToList();
            return Ok(response);
        }

        // Recursive function, 
        private List<PersonGraphNode> FindHamiltonianPath(List<PersonGraphNode> graph, List<PersonGraphNode> path)
        {
            // Find nodes that are not already in the path
            // and that can be accessed from this node
            var remainingNodeCandidates = graph.Where(node => 
                !path.Contains(node) && 
                (
                    path.Count() == 0 || 
                    path.Last().AvailablePersons.Contains(node.Person)
                )
            ).ToList();

            if (graph.Count - path.Count == 1 && remainingNodeCandidates.Count > 0)
            {
                var node = remainingNodeCandidates.First();
                if (node.AvailablePersons.Contains(path.First().Person))
                {
                    var a = new List<PersonGraphNode>();
                    a.Add(node);
                    return a;
                }
                return new List<PersonGraphNode>();
            }
                

            foreach (PersonGraphNode node in remainingNodeCandidates)
            {
                var _path = new List<PersonGraphNode>(path);
                _path.Add(node);
                var a = FindHamiltonianPath(graph, _path);
                if (_path.Count + a.Count == graph.Count)
                {
                    a.Insert(0, node);
                    return a;
                }
            }
            return new List<PersonGraphNode>();
        }

        private class ValidationDto
        {
            public ValidationDto()
            {
                Santas = new List<string>();
                Receivers = new List<string>();
            }

            public bool SantasEqualReceivers => Santas.All(x => Receivers.Contains(x));
            public int AmountOfUniqueSantas => Santas.Distinct().Count();
            public int AmountOfUniqueReceivers => Receivers.Distinct().Count();
            public List<string> Santas { get; set; }
            public List<string> Receivers { get; set; }
        }
    }

}

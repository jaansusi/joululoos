using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace SantaReporter.Models
{

    public class Family
    {
        public Family(List<Person> members)
        {
            Id = Guid.NewGuid();
            _members = new List<Person>();
            members.ForEach(x => _members.Add(x));
        }

        public Guid Id { get; set; }

        private List<Person> _members { get; set; }
        public List<Person> Members { get => _members ?? new List<Person>(); set { _members = value; } }
    }
    static class FamilyExtensions
    {
        public static void SaveToFiles(this List<Family> families)
        {
            string directory = @".\Loos\";
            Directory.CreateDirectory(directory);
            foreach (Person person in families.SelectMany(x => x.Members))
            {
            }
        }

        public static List<Family> ReadFromFile()
        {
            using (StreamReader r = new StreamReader("input.json"))
            {
                string json = r.ReadToEnd(); 
                var res = JsonConvert.DeserializeObject<List<Family>>(json)?.OrderBy(x => Guid.NewGuid()).ToList();
                if (res != null)
                    return res;
                return new List<Family>();
            }
        }
    }
}

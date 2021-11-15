using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Jõululoos
{

    class Family
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
                using (StreamWriter file =
                    new StreamWriter(directory + person.Name + $".{person.FileExtension}"))
                {
                    file.WriteLine(person.GiftingTo.Name);
                }
            }
        }
    }
}

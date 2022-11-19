using System;
using System.Collections.Generic;
using System.Text;

namespace SecretSanta.Models
{
    // Person is not retained in the database,
    // it is purely an object to import data with.
    // Once a person has a confirmed person that they
    // gift to, a Santa is created based on them.
    public class Person
    {
        public Person(string name)
        {
            Name = name;
        }
        public string Name { get; set; }
        public int Code { get; set; }
        public string? PersonalIdCode { get; set; }
    }

    // This class is used in the process of assigning 
    // santas. It represents one person and everyone
    // that this person is able to make a gift to.
    public class PersonGraphNode
    {
        public PersonGraphNode(Person person, List<Person> availablePersons)
        {
            Person = person;
            AvailablePersons = availablePersons.OrderBy(a => Guid.NewGuid()).ToList();
        }
        public Person Person { get; set; }
        public List<Person> AvailablePersons{ get; set; }
    }


}

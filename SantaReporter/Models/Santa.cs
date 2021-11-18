namespace SantaReporter.Models
{
    public class Santa
    {
        public Santa(string name, string designatedPerson)
        {
            this.Id = Guid.NewGuid();
            this.Name = name;
            //to-do: Encrypt this
            this.DesignatedPerson = designatedPerson;
        }
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DesignatedPerson { get; set; }
    }
}

namespace SantaReporter
{
    public class Santa
    {
        Santa(string name, string designatedPerson)
        {
            this.Name = name;
            //to-do: Encrypt this
            this.DesignatedPerson = designatedPerson;
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string DesignatedPerson { get; set; }
    }
}

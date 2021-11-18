namespace SecretSanta.Models
{
    public class Santa
    {
        public Santa(string name, string designatedPerson, string IVBase64)
        {
            Id = Guid.NewGuid();
            Name = name;
            DesignatedPerson = designatedPerson;
            this.IVBase64 = IVBase64;
        }
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DesignatedPerson { get; set; }
        public string IVBase64 { get; set; }
    }
}

namespace SecretSanta.Models
{
    // Santa is someone who has a concrete name
    // to make a present to. Object is saved to the
    // database and contains the IV required to
    // decode the encrypted name of the giftee.
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

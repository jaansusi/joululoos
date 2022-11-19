namespace SecretSanta.Models
{
    // Used to take data from the database for
    // displaying information to the website visitor
    // after decoding the name.
    public class SantaDto
    {
        public string Name { get; set; }
        public string DesignatedPerson { get; set; }
        public int LogEntriesCount { get; set; }

        public int UniqueUserAgentCount { get; set; }

        public SantaDto (string name, string designatedPerson, int logEntriesCount, int uniqueUserAgentCount)
        {
            Name = name;
            DesignatedPerson = designatedPerson;
            LogEntriesCount = logEntriesCount;
            UniqueUserAgentCount = uniqueUserAgentCount;
        }
    }
}

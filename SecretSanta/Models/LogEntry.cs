namespace SecretSanta.Models
{
    // Used to keep track of the IP and User Agent
    // of visitors who decode their giftee in order
    // to discourage code sharing.
    public class LogEntry
    {
        public LogEntry(Guid codeOwner, string userAgent, string ip)
        {
            DateCreated = DateTime.UtcNow;
            CodeOwner = codeOwner;
            UserAgent = userAgent;
            Ip = ip;
        }
        public int Id { get; set; }
        public string UserAgent { get; set; }
        public string Ip { get; set; }
        public Guid CodeOwner { get; set; }
        public DateTime DateCreated { get; set; }
    }
}

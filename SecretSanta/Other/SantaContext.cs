using Microsoft.EntityFrameworkCore;
using SecretSanta.Models;

namespace SecretSanta
{
    public class SantaContext : DbContext
    {
        public DbSet<Santa>? Santas { get; set; }
        public DbSet<LogEntry>? LogEntries { get; set; }

        public string DbPath { get; set; }

        public SantaContext(IConfiguration configuration)
        {
            DbPath = configuration.GetValue(typeof(string), "DbLocation")?.ToString() ?? string.Empty;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite($"Data Source={DbPath}");
    }
}

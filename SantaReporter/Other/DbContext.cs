using Microsoft.EntityFrameworkCore;
using SantaReporter.Models;

namespace SantaReporter
{
    public class SantaContext : DbContext
    {
        public DbSet<Santa>? Santas { get; set; }

        public string DbPath { get; set; }

        public SantaContext()
        {
            var folder = Directory.GetCurrentDirectory();
            DbPath = $"{folder}{System.IO.Path.DirectorySeparatorChar}santa.db";
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite($"Data Source={DbPath}");
    }
}

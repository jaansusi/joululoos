using Microsoft.EntityFrameworkCore;

namespace SantaReporter
{
    public class SantaContext : DbContext
    {
        public DbSet<Santa> Santas { get; set; }

        public string DbPath { get; set; }

        public SantaContext()
        {
            var folder = Environment.SpecialFolder.LocalApplicationData;
            var path = Environment.GetFolderPath(folder);
            DbPath = $"{path}{System.IO.Path.DirectorySeparatorChar}santa.db";
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite($"Data Source={DbPath}");
    }
}

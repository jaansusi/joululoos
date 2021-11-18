using Microsoft.EntityFrameworkCore;
using SecretSanta;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddTransient<IStartupFilter, MigrationStartupFilter<SantaContext>>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.MapControllers();

using (var db = new SantaContext())
    db.Database.Migrate();

app.Run();

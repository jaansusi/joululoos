using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SecretSanta;
using SecretSanta.Other;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddTransient<IStartupFilter, MigrationStartupFilter<SantaContext>>();

#region Authentication
builder.Services.AddAuthentication(o => {
    o.DefaultScheme = "AdminAuthenticationHandler";
})
.AddScheme<AdminAuthenticationOptions, AdminAuthenticationHandler>("AdminAuthenticationHandler", o => { });
#endregion

var app = builder.Build();
Console.WriteLine("App location: " + Directory.GetCurrentDirectory());
string[] fileEntries = Directory.GetFiles(Directory.GetCurrentDirectory());
foreach (string fileName in fileEntries)
    Console.WriteLine(fileName);
Console.WriteLine("DB location: " + app.Configuration.GetValue(typeof(string), "DbLocation")?.ToString() ?? string.Empty);
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.MapControllers();

using (var db = new SantaContext(app.Configuration))
    db.Database.Migrate();

app.Run();

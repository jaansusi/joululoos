using Microsoft.EntityFrameworkCore;

namespace SantaReporter
{
    public class MigrationStartupFilter<TContext> : IStartupFilter where TContext : DbContext
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
        {
            return app =>
            {
                using (var scope = app.ApplicationServices.CreateScope())
                {
                    foreach (var context in scope.ServiceProvider.GetServices<TContext>())
                    {
                        context.Database.SetCommandTimeout(160);
                        context.Database.Migrate();
                    }
                }
                next(app);
            };
        }
    }
}

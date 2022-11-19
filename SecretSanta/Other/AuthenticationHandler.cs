using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;

namespace SecretSanta.Other
{
    public class AdminAuthenticationHandler : AuthenticationHandler<AdminAuthenticationOptions>
    {
        public IServiceProvider ServiceProvider { get; set; }
        private readonly string AdminSecret;

        public AdminAuthenticationHandler(
            IOptionsMonitor<AdminAuthenticationOptions> options, 
            ILoggerFactory logger, 
            UrlEncoder encoder, 
            ISystemClock clock, 
            IServiceProvider serviceProvider,
            IConfiguration configuration
        ) : base(options, logger, encoder, clock)
        {
            ServiceProvider = serviceProvider;
            AdminSecret = configuration.GetValue(typeof(string), "AdminSecret")?.ToString() ?? string.Empty;
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var header = Request.Headers.Authorization;

            if (string.IsNullOrEmpty(header))
            {
                return Task.FromResult(AuthenticateResult.Fail("No Authorization header provided."));
            }

            if (header != AdminSecret)
            {
                return Task.FromResult(AuthenticateResult.Fail("Incorrect Authorization header provided."));
            }

            Claim[] claims = new[] { new Claim("admin", "all") };
            var identity = new ClaimsIdentity(claims, nameof(AdminAuthenticationHandler));

            var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), this.Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }

    public class AdminAuthenticationOptions : AuthenticationSchemeOptions
    {
    }
}

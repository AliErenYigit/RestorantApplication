using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Identity.Client;

namespace Restaurant.Api.Security;

public class AdminApiKeyFilter : IAsyncActionFilter
{
    private const string HeaderName = "X-Admin-Key";

    private readonly IConfiguration _config;

    public AdminApiKeyFilter(IConfiguration config)
    {
        _config = config;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context,ActionExecutionDelegate  next)
    {
        var expected=_config["Admin:ApiKey"];

        if(string.IsNullOrWhiteSpace(expected))
        {
            context.Result = new StatusCodeResult(500);
            return;
        }
        if(!context.HttpContext.Request.Headers.TryGetValue(HeaderName,out var provided)||string.IsNullOrWhiteSpace(provided)){
            context.Result = new UnauthorizedObjectResult(new { message = "Admin API key is missing." });
            return;
        }
        if(!string.Equals(provided,expected))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Invalid admin API key." });
            return;
        }

        await next();
    }
}


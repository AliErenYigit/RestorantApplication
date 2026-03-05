using System.Text.Json;
using Restaurant.Application.Exceptions;

namespace Restaurant.Api.Middleware;

public sealed class ExceptionHandlingMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (AppValidationException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new
            {
                message = ex.Message,
                errors = ex.Errors
            });

            await context.Response.WriteAsync(body);
        }
        catch (AppNotFoundException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new { message = ex.Message });
            await context.Response.WriteAsync(body);
        }
        catch (AppConflictException ex)
        {
            context.Response.StatusCode = StatusCodes.Status409Conflict;
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new { message = ex.Message });
            await context.Response.WriteAsync(body);
        }
        catch (Exception)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new { message = "Unexpected server error." });
            await context.Response.WriteAsync(body);
        }
    }
}
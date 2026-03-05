using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Restaurant.Api.Swagger;

public sealed class AdminApiKeyHeaderOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var path = context.ApiDescription.RelativePath ?? "";
        if (!path.StartsWith("api/admin", StringComparison.OrdinalIgnoreCase))
            return;

        operation.Parameters ??= new List<OpenApiParameter>();

        // aynı header iki kez eklenmesin
        if (operation.Parameters.Any(p => p.Name == "X-Admin-Key")) return;

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "X-Admin-Key",
            In = ParameterLocation.Header,
            Required = true,
            Description = "Admin API Key",
            Schema = new OpenApiSchema { Type = "string" }
        });
    }
}
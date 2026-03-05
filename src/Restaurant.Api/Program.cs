using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Application.Interfaces;
using Restaurant.Infrastructure.Queries;
using Restaurant.Application.Interfaces.Admin;
using Restaurant.Infrastructure.Services.Admin;
using Restaurant.Api.Security;
using System.Threading.RateLimiting;
using Restaurant.Infrastructure.Security;



var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<Restaurant.Api.Swagger.AdminApiKeyHeaderOperationFilter>();
});

builder.Services.AddRateLimiter(options =>
{
    // 429 response döndürelim
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Admin için daha sıkı limit: IP başına
    options.AddPolicy("admin", httpContext =>
    {
        // IP yoksa sabit bir key'e düş
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 60,            // 60 istek
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Public daha geniş limit (istersen)
    options.AddPolicy("public", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 300,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });
});
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("public-menu", policy =>
        policy.Expire(TimeSpan.FromSeconds(60))
              .Tag("menu")               // tag veriyoruz
              .SetVaryByQuery("*")
              .SetVaryByRouteValue("*")
    );
});

builder.Services.AddTransient<Restaurant.Api.Middleware.ExceptionHandlingMiddleware>();

builder.Services.AddScoped<AdminApiKeyFilter>();

builder.Services.AddScoped<IFileScanner, ClamAvFileScanner>();

builder.Services.AddScoped<IAdminCategoryService, AdminCategoryService>();
builder.Services.AddScoped<IAdminProductService, AdminProductService>();
builder.Services.AddScoped<IAdminContentService, AdminContentService>();

builder.Services.AddScoped<IPublicMenuQuery, PublicMenuQuery>();
builder.Services.AddScoped<IPublicContentQuery, PublicContentQuery>();

// DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

  
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

   
    var hasAnyProduct = await db.Products.AnyAsync();
    if (!hasAnyProduct)
    {
        await DbSeeder.SeedAsync(db);
    }
}

app.UseMiddleware<Restaurant.Api.Middleware.ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.MapControllers();

app.UseStaticFiles();

app.UseRateLimiter();
app.UseOutputCache();

app.Run();
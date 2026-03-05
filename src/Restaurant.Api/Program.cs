using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
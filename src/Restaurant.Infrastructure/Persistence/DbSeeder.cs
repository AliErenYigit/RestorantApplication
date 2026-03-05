using Microsoft.EntityFrameworkCore;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Kahvaltı", Slug = "kahvalti", SortOrder = 1, IsActive = true },
                new() { Name = "Ana Yemekler", Slug = "ana-yemekler", SortOrder = 2, IsActive = true },
                new() { Name = "Tatlılar", Slug = "tatlilar", SortOrder = 3, IsActive = true },
                new() { Name = "İçecekler", Slug = "icecekler", SortOrder = 4, IsActive = true },
            };

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();

            // ürün seed
            var kahvaltiId = categories.First(x => x.Slug == "kahvalti").Id;
            var anaYemekId = categories.First(x => x.Slug == "ana-yemekler").Id;
            var icecekId = categories.First(x => x.Slug == "icecekler").Id;

            db.Products.AddRange(
                new Product
                {
                    CategoryId = kahvaltiId,
                    Name = "Serpme Kahvaltı",
                    Price = 349.90m,
                    ImageUrl = "/images/products/hamburger.jpg",
                    Description = "Peynir çeşitleri, zeytin, bal-kaymak, reçel, domates-salatalık, yumurta, çay.",
                    SortOrder = 1,
                    IsActive = true
                },
                new Product
                {
                    CategoryId = anaYemekId,
                    Name = "Izgara Köfte",
                    Price = 289.90m,
                    ImageUrl = "/images/products/hamburger.jpg",
                    Description = "Dana köfte, pilav, salata. (Alerjen: gluten içerir)",
                    SortOrder = 1,
                    IsActive = true
                },
                new Product
                {
                    CategoryId = icecekId,
                    Name = "Ayran",
                    Price = 39.90m,
                    ImageUrl = "/images/products/hamburger.jpg",
                    Description = "Yoğurt, su, tuz.",
                    SortOrder = 1,
                    IsActive = true
                }
            );

            db.SiteContents.AddRange(
                new SiteContent { Key = "Home", Title = "Hoş Geldiniz", Body = "Restoranımıza hoş geldiniz. Taze ve kaliteli ürünlerle hizmetinizdeyiz." },
                new SiteContent { Key = "About", Title = "Hakkımızda", Body = "Lezzet odaklı, yerel üreticileri destekleyen bir mutfak anlayışı." },
                new SiteContent { Key = "Contact", Title = "İletişim", Body = "Adres: ...\nTelefon: ...\nÇalışma Saatleri: ..." }
            );

            await db.SaveChangesAsync();
        }
    }
}
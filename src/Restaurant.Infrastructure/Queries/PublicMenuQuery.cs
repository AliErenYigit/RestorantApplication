using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.Interfaces;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Queries;

public sealed class PublicMenuQuery : IPublicMenuQuery
{
    private readonly AppDbContext _db;

    public PublicMenuQuery(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetActiveCategoriesAsync(CancellationToken ct = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.SortOrder))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ProductDto>> GetActiveProductsByCategorySlugAsync(string categorySlug, CancellationToken ct = default)
    {
        var slug = NormalizeKey(categorySlug);

        return await _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.Category.IsActive && p.Category.Slug == slug)
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.Name)
            .Select(p => new ProductDto(
                p.Id,
                p.CategoryId,
                p.Name,
                p.Price,
                p.Description,
                p.ImageUrl,
                p.SortOrder
            ))
            .ToListAsync(ct);
    }

    public async Task<ProductDto?> GetActiveProductByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.Id == id)
            .Select(p => new ProductDto(
                p.Id,
                p.CategoryId,
                p.Name,
                p.Price,
                p.Description,
                p.ImageUrl,
                p.SortOrder
            ))
            .FirstOrDefaultAsync(ct);
    }

    private static string NormalizeKey(string key)
        => (key ?? "").Trim();
}
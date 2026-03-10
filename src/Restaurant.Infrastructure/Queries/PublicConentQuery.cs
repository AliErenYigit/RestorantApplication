using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.Interfaces;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Queries;

public sealed class PublicContentQuery : IPublicContentQuery
{
    private readonly AppDbContext _db;

    public PublicContentQuery(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SiteContentDto?> GetContentByKeyAsync(string key, CancellationToken ct = default)
    {
        var normalized = NormalizeKey(key);

        return await _db.SiteContents
            .AsNoTracking()
            .Where(x => x.Key.ToLower() == normalized.ToLower())
            .Select(x => new SiteContentDto(x.Key, x.Title, x.Body,x.ImageUrl, x.UpdatedAt))
            .FirstOrDefaultAsync(ct);
    }

    private static string NormalizeKey(string key)
        => (key ?? "").Trim();
}
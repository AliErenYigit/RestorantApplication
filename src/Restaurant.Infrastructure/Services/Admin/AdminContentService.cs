using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces.Admin;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Services.Admin;

public sealed class AdminContentService : IAdminContentService
{
    private readonly AppDbContext _db;

    public AdminContentService(AppDbContext db) => _db = db;

    public async Task<SiteContentDto?> GetByKeyAsync(string key, CancellationToken ct = default)
    {
        var k = Normalize(key);

        return await _db.SiteContents
            .AsNoTracking()
            .Where(x => x.Key == k)
            .Select(x => new SiteContentDto(
                x.Key,
                x.Title,
                x.Body,
                x.ImageUrl,
                x.UpdatedAt
            ))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<SiteContentDto> UpsertAsync(string key, SiteContentUpdateRequest req, CancellationToken ct = default)
    {
        var k = Normalize(key);

        var entity = await _db.SiteContents.FirstOrDefaultAsync(x => x.Key == k, ct);

        if (entity is null)
        {
            entity = new SiteContent
            {
                Key = k,
                Title = req.Title.Trim(),
                Body = req.Body,
                ImageUrl = NormalizeNullable(req.ImageUrl),
                UpdatedAt = DateTime.UtcNow
            };

            _db.SiteContents.Add(entity);
        }
        else
        {
            entity.Title = req.Title.Trim();
            entity.Body = req.Body;
            entity.ImageUrl = NormalizeNullable(req.ImageUrl);
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);

        return new SiteContentDto(
            entity.Key,
            entity.Title,
            entity.Body,
            entity.ImageUrl,
            entity.UpdatedAt
        );
    }

    private static string Normalize(string v) => (v ?? string.Empty).Trim().ToLowerInvariant();

    private static string? NormalizeNullable(string? v)
    {
        if (string.IsNullOrWhiteSpace(v))
            return null;

        return v.Trim();
    }
}
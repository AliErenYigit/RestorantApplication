using Restaurant.Application.DTOs;

namespace Restaurant.Application.Interfaces;

public interface IPublicContentQuery
{
    Task<SiteContentDto?> GetContentByKeyAsync(string key, CancellationToken ct = default);
}
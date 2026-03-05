using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces.Admin;

public interface IAdminContentService
{
    Task<SiteContentDto?> GetByKeyAsync(string key, CancellationToken ct = default);
    Task<SiteContentDto> UpsertAsync(string key, SiteContentUpdateRequest req, CancellationToken ct = default);
}
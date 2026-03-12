using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces.Admin;

public interface IAdminProductService
{
    Task<PagedResult<AdminProductDto>> GetAllAsync(ProductListQuery query, CancellationToken ct = default);
    Task<AdminProductDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<AdminProductDto> CreateAsync(ProductUpsertRequest req, CancellationToken ct = default);
    Task<AdminProductDto?> UpdateAsync(int id, ProductUpsertRequest req, CancellationToken ct = default);
    Task<AdminProductDto?> SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces.Admin;

public interface IAdminProductService
{
Task<PagedResult<ProductDto>> GetAllAsync(ProductListQuery query, CancellationToken ct = default);    Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(ProductUpsertRequest req, CancellationToken ct = default);
    Task<ProductDto?> UpdateAsync(int id, ProductUpsertRequest req, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
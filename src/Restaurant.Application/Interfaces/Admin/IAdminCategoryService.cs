using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces.Admin;

public interface IAdminCategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CategoryUpsertRequest req, CancellationToken ct = default);
    Task<CategoryDto?> UpdateAsync(int id, CategoryUpsertRequest req, CancellationToken ct = default);
    Task<CategoryDto?> SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
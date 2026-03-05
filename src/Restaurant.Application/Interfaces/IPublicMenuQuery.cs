using Restaurant.Application.DTOs;

namespace Restaurant.Application.Interfaces;

public interface IPublicMenuQuery
{
   Task<IReadOnlyList<CategoryDto>> GetActiveCategoriesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetActiveProductsByCategorySlugAsync(string categorySlug, CancellationToken ct = default);
    Task<ProductDto?> GetActiveProductByIdAsync(int id, CancellationToken ct = default);
}
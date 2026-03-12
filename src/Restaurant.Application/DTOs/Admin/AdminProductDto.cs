namespace Restaurant.Application.DTOs;

public sealed record AdminProductDto(
    int Id,
    int CategoryId,
    string Name,
    decimal Price,
    string Description,
    string? ImageUrl,
    int SortOrder,
    bool IsActive
);
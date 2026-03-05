namespace Restaurant.Application.DTOs;

public sealed record ProductDto(
    int Id,
    int CategoryId,
    string Name,
    decimal Price,
    string Description,
    string? ImageUrl,
    int SortOrder
);
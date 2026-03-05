namespace Restaurant.Application.DTOs.Admin;

public sealed record ProductUpsertRequest(
    int CategoryId,
    string Name,
    decimal Price,
    string Description,
    string? ImageUrl,
    int SortOrder,
    bool IsActive
);
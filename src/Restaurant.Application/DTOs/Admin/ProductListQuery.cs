namespace Restaurant.Application.DTOs.Admin;

public sealed record ProductListQuery(
    int? CategoryId,
    string? Search,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20
);
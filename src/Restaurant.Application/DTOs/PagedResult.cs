namespace Restaurant.Application.DTOs;

public sealed record PagedResult<T>(
    int Page,
    int PageSize,
    int TotalCount,
    IReadOnlyList<T> Items
);
namespace Restaurant.Application.DTOs.Admin;

public sealed record CategoryUpsertRequest(
    string Name,
    string Slug,
    int SortOrder,
    bool IsActive
);
namespace Restaurant.Application.DTOs;

public sealed record TeamMemberDto(
    int Id,
    string FullName,
    string Role,
    string? Bio,
    string? ImageUrl,
    int SortOrder
);
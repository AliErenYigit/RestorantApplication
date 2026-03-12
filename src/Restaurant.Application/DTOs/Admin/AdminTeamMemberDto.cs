namespace Restaurant.Application.DTOs;

public sealed record AdminTeamMemberDto(
    int Id,
    string FullName,
    string Role,
    string? Bio,
    string? ImageUrl,
    int SortOrder,
    bool IsActive
);
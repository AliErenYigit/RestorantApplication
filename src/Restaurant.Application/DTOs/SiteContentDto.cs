namespace Restaurant.Application.DTOs;

public sealed record SiteContentDto(
    string Key,
    string Title,
    string Body,
    DateTime UpdatedAt
);
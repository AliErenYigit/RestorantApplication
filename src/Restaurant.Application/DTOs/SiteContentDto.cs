namespace Restaurant.Application.DTOs;

public record SiteContentDto(
    string Key,
    string Title,
    string Body,
    string? ImageUrl,
    DateTime UpdatedAt
);
namespace Restaurant.Application.DTOs.Admin;

public sealed record SiteContentUpdateRequest(
    string Title,
    string Body
);
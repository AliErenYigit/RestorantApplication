namespace Restaurant.Application.DTOs.Admin;

public sealed class SiteContentUpdateRequest
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
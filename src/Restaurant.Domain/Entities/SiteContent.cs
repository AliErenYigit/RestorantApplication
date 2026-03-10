namespace Restaurant.Domain.Entities;

public class SiteContent
{
    public int Id { get; set; }
    public string Key { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Body { get; set; } = default!;

    public string? ImageUrl { get; set; }   // opsiyonel

    public DateTime UpdatedAt { get; set; }
}
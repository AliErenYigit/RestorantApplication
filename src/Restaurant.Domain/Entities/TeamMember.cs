namespace Restaurant.Domain.Entities;

public class TeamMember
{
    public int Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
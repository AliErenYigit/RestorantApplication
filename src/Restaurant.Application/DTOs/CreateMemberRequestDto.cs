using System.ComponentModel.DataAnnotations;

namespace Restaurant.Application.DTOs.Admin;

public sealed class CreateTeamMemberRequest
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Role { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Bio { get; set; }

    public string? ImageUrl { get; set; }

    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;
}
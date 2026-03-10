using System.ComponentModel.DataAnnotations;

namespace Restaurant.Application.DTOs;

public sealed class CreateCommentRequest
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;
}
namespace Restaurant.Application.DTOs;



public sealed record AdminCommentDto(
    int Id,
    string FirstName,
    string LastName,
    string Message,
    bool IsApproved,
    DateTime CreatedAt
);
namespace Restaurant.Application.DTOs;



public sealed record CommentDto(
    int Id,
    string FirstName,
    string LastName,
    string Message,
    DateTime CreatedAt
);
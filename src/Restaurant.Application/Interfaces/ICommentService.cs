using Restaurant.Application.DTOs;

namespace Restaurant.Application.Interfaces;

public interface ICommentService
{
    Task<IReadOnlyList<CommentDto>> GetApprovedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<CommentDto>> GetAllAsync(CancellationToken ct = default);
    Task CreateAsync(CreateCommentRequest request, CancellationToken ct = default);
    
    
}
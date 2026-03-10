using Restaurant.Application.DTOs;

namespace Restaurant.Application.Interfaces;

public interface IAdminCommentService
{
    Task<IReadOnlyList<AdminCommentDto>> GetApprovedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminCommentDto>> GetAllAsync(CancellationToken ct = default);
    Task<bool> ApproveAsync(int id, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
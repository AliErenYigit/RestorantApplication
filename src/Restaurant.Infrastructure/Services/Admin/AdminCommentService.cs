using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Services;

public sealed class AdminCommentService : IAdminCommentService
{
    private readonly AppDbContext _db;

    public AdminCommentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<AdminCommentDto>> GetApprovedAsync(CancellationToken ct = default)
    {
        return await _db.Comments
            .AsNoTracking()
            .Where(x => x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminCommentDto(
                x.Id,
                x.FirstName,
                x.LastName,
                x.Message,
                x.IsApproved,
                x.CreatedAt
            ))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AdminCommentDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Comments
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminCommentDto(
                x.Id,
                x.FirstName,
                x.LastName,
                x.Message,
                x.IsApproved,
                x.CreatedAt
            ))
            .ToListAsync(ct);
    }

 

    public async Task<bool> ApproveAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Comments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return false;

        entity.IsApproved = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }
    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
{
    var entity = await _db.Comments.FirstOrDefaultAsync(x => x.Id == id, ct);

    if (entity is null)
        return false;

    _db.Comments.Remove(entity);

    await _db.SaveChangesAsync(ct);

    return true;
}
  
}
using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Services;

public sealed class CommentService : ICommentService
{
    private readonly AppDbContext _db;

    public CommentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CommentDto>> GetApprovedAsync(CancellationToken ct = default)
    {
        return await _db.Comments
            .AsNoTracking()
            .Where(x => x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CommentDto(
                x.Id,
                x.FirstName,
                x.LastName,
                x.Message,
                x.CreatedAt
            ))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<CommentDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Comments
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CommentDto(
                x.Id,
                x.FirstName,
                x.LastName,
                x.Message,
                x.CreatedAt
            ))
            .ToListAsync(ct);
    }

    public async Task CreateAsync(CreateCommentRequest request, CancellationToken ct = default)
    {
        var entity = new Comment
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Message = request.Message.Trim(),
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Comments.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

  
}
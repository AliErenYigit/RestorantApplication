using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Services;

public sealed class AdminTeamMemberService : IAdminTeamMemberService
{
    private readonly AppDbContext _db;

    public AdminTeamMemberService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TeamMemberDto>> GetActiveAsync(CancellationToken ct = default)
    {
        return await _db.TeamMembers
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.FullName)
            .Select(x => new TeamMemberDto(
                x.Id,
                x.FullName,
                x.Role,
                x.Bio,
                x.ImageUrl,
                x.SortOrder
            ))
            .ToListAsync(ct);
    }

    public async Task<TeamMemberDto> CreateAsync(CreateTeamMemberRequest request, CancellationToken ct = default)
    {
        var entity = new TeamMember
        {
            FullName = request.FullName.Trim(),
            Role = request.Role.Trim(),
            Bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.TeamMembers.Add(entity);
        await _db.SaveChangesAsync(ct);

        return new TeamMemberDto(
            entity.Id,
            entity.FullName,
            entity.Role,
            entity.Bio,
            entity.ImageUrl,
            entity.SortOrder
        );
    }
    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
{
    var entity = await _db.TeamMembers.FirstOrDefaultAsync(x => x.Id == id, ct);
    if (entity is null)
        return false;

    _db.TeamMembers.Remove(entity);
    await _db.SaveChangesAsync(ct);
    return true;
}
}
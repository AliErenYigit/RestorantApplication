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

    public async Task<IReadOnlyList<AdminTeamMemberDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.TeamMembers
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.FullName)
            .Select(x => new AdminTeamMemberDto(
                x.Id,
                x.FullName,
                x.Role,
                x.Bio,
                x.ImageUrl,
                x.SortOrder,
                x.IsActive
            ))
            .ToListAsync(ct);
    }



    public async Task<AdminTeamMemberDto> CreateAsync(CreateTeamMemberRequest request, CancellationToken ct = default)
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

        return new AdminTeamMemberDto(
            entity.Id,
            entity.FullName,
            entity.Role,
            entity.Bio,
            entity.ImageUrl,
            entity.SortOrder,
            entity.IsActive
        );
    }

    public async Task<AdminTeamMemberDto?> UpdateAsync(int id, UpdateTeamMemberRequest request, CancellationToken ct = default)
    {
        var entity = await _db.TeamMembers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return null;

        entity.FullName = request.FullName.Trim();
        entity.Role = request.Role.Trim();
        entity.Bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim();
        entity.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _db.SaveChangesAsync(ct);

        return new AdminTeamMemberDto(
            entity.Id,
            entity.FullName,
            entity.Role,
            entity.Bio,
            entity.ImageUrl,
            entity.SortOrder,
            entity.IsActive
        );
    }

    public async Task<AdminTeamMemberDto?> SetActiveAsync(int id, bool isActive, CancellationToken ct = default)
    {
        var entity = await _db.TeamMembers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return null;

        entity.IsActive = isActive;

        await _db.SaveChangesAsync(ct);

        return new AdminTeamMemberDto(
            entity.Id,
            entity.FullName,
            entity.Role,
            entity.Bio,
            entity.ImageUrl,
            entity.SortOrder,
            entity.IsActive
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
using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Services;

public sealed class TeamMemberService : ITeamMemberService
{
    private readonly AppDbContext _db;

    public TeamMemberService(AppDbContext db)
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

    
}
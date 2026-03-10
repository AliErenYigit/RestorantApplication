using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces;

public interface ITeamMemberService
{
    Task<IReadOnlyList<TeamMemberDto>> GetActiveAsync(CancellationToken ct = default);
    
}
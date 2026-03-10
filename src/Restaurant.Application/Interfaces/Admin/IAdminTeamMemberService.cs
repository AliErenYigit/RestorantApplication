using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces;

public interface IAdminTeamMemberService
{
    Task<IReadOnlyList<TeamMemberDto>> GetActiveAsync(CancellationToken ct = default);
    Task<TeamMemberDto> CreateAsync(CreateTeamMemberRequest request, CancellationToken ct = default);

    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
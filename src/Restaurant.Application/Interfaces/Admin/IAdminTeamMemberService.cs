using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;

namespace Restaurant.Application.Interfaces;

public interface IAdminTeamMemberService
{
    Task<IReadOnlyList<AdminTeamMemberDto>> GetAllAsync(CancellationToken ct = default);
    Task<AdminTeamMemberDto> CreateAsync(CreateTeamMemberRequest request, CancellationToken ct = default);

    Task<AdminTeamMemberDto?> UpdateAsync(int id, UpdateTeamMemberRequest request, CancellationToken ct = default);
    Task<AdminTeamMemberDto?> SetActiveAsync(int id, bool isActive, CancellationToken ct = default);

    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
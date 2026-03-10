using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Restaurant.Api.Security;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces;

namespace Restaurant.Api.Controllers.Admin;

[ApiController]
[EnableRateLimiting("admin")]
[Route("api/admin/team-members")]
[ServiceFilter(typeof(AdminApiKeyFilter))]
public class AdminTeamMembersController : ControllerBase
{
    private readonly IAdminTeamMemberService _service;

    public AdminTeamMembersController(IAdminTeamMemberService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return Ok(result);
    }

      [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound();

        return Ok(new { message = "Çalışan silindi." });
    }
}
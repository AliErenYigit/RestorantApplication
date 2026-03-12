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

 [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items);
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
public async Task<IActionResult> UpdateTeamMember(
    int id,
    [FromBody] UpdateTeamMemberRequest request,
    CancellationToken ct)
{
    var result = await _service.UpdateAsync(id, request, ct);
    if (result is null)
        return NotFound(new { message = "Çalışan bulunamadı." });

    return Ok(result);
}

[HttpPatch("{id:int}/toggle-active")]
    public async Task<IActionResult> ToggleTeamMemberActive(
        int id,
        [FromBody] ToggleTeamMemberActiveRequest request,
        CancellationToken ct)
    {
        var result = await _service.SetActiveAsync(id, request.IsActive, ct);

        if (result is null)
            return NotFound(new { message = "Üye bulunamadı." });

        return Ok(new
        {
            message = request.IsActive
                ? "Üye başarıyla aktifleştirildi."
                : "Üye başarıyla pasifleştirildi.",
            category = result
        });
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
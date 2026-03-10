using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Restaurant.Api.Security;
using Restaurant.Application.Interfaces;

namespace Restaurant.Api.Controllers.Admin;

[ApiController]
[EnableRateLimiting("admin")]
[Route("api/admin/comments")]
[ServiceFilter(typeof(AdminApiKeyFilter))]
public class AdminCommentsController : ControllerBase
{
    private readonly IAdminCommentService _service;

    public AdminCommentsController(IAdminCommentService adminService)
    {
        _service = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items);
    }

    [HttpPatch("{id}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct)
    {
        var ok = await _service.ApproveAsync(id, ct);
        if (!ok)
            return NotFound();

        return Ok(new { message = "Yorum onaylandı." });
    }
}
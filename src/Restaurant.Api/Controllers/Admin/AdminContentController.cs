using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Restaurant.Api.Security;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces.Admin;

namespace Restaurant.Api.Controllers.Admin;

[ApiController]
[EnableRateLimiting("admin")]
[Route("api/admin/content")]
[ServiceFilter(typeof(AdminApiKeyFilter))]
public class AdminContentController : ControllerBase
{
    private readonly IAdminContentService _service;

    public AdminContentController(IAdminContentService service)
    {
        _service = service;
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> Get(string key, CancellationToken ct)
    {
        var item = await _service.GetByKeyAsync(key, ct);

        if (item is null)
            return NotFound();

        return Ok(item);
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Upsert(
        string key,
        [FromBody] SiteContentUpdateRequest req,
        CancellationToken ct)
    {
        var result = await _service.UpsertAsync(key, req, ct);
        return Ok(result);
    }
}
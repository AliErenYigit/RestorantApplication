using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.Security;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces.Admin;
using Microsoft.AspNetCore.RateLimiting;

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
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Upsert(string key, [FromBody] SiteContentUpdateRequest req, CancellationToken ct)
        => Ok(await _service.UpsertAsync(key, req, ct));
}
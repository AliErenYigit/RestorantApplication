using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.Security;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces.Admin;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.OutputCaching;

namespace Restaurant.Api.Controllers.Admin;

[ApiController]
[EnableRateLimiting("admin")]
[Route("api/admin/categories")]
[ServiceFilter(typeof(AdminApiKeyFilter))]
public class AdminCategoriesController : ControllerBase
{
        private readonly IAdminCategoryService _service;
    private readonly IOutputCacheStore _cache;

    public AdminCategoriesController(IAdminCategoryService service,IOutputCacheStore cache)
    {
        _service = service;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _service.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var item = await _service.GetByIdAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

  [HttpPost]
public async Task<IActionResult> Create(CategoryUpsertRequest req, CancellationToken ct)
{
    var created = await _service.CreateAsync(req, ct);
    await _cache.EvictByTagAsync("menu", ct);
    return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
}

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryUpsertRequest req, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, req, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _service.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
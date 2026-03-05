using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.Security;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces.Admin;
using Microsoft.AspNetCore.RateLimiting;

namespace Restaurant.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[EnableRateLimiting("admin")]
[ServiceFilter(typeof(AdminApiKeyFilter))]
public class AdminProductsController : ControllerBase
{
    private readonly IAdminProductService _service;

    public AdminProductsController(IAdminProductService service)
    {
        _service = service;
    }

    [HttpGet]
public async Task<IActionResult> GetAll(
    [FromQuery] int? categoryId,
    [FromQuery] string? search,
    [FromQuery] bool? isActive,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    var query = new ProductListQuery(categoryId, search, isActive, page, pageSize);
    return Ok(await _service.GetAllAsync(query, ct));
}

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var item = await _service.GetByIdAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductUpsertRequest req, CancellationToken ct)
        => Ok(await _service.CreateAsync(req, ct));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpsertRequest req, CancellationToken ct)
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
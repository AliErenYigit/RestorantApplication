using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Interfaces;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.OutputCaching;

namespace Restaurant.Api.Controllers.Public;

[ApiController]
[EnableRateLimiting("public")]
[Route("api/public")]

public class PublicMenuController : ControllerBase
{
    private readonly IPublicMenuQuery _menu;

    public PublicMenuController(IPublicMenuQuery menu)
    {
        _menu = menu;
    }

    // GET /api/public/categories
    [HttpGet("categories")]
    [OutputCache(PolicyName = "public-menu")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var items = await _menu.GetActiveCategoriesAsync(ct);
        return Ok(items);
    }

    // GET /api/public/categories/{slug}/products
    [HttpGet("categories/{slug}/products")]
    [OutputCache(PolicyName = "public-menu")]
    public async Task<IActionResult> GetProductsByCategorySlug([FromRoute] string slug, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest(new { message = "Category slug is required." });

        var items = await _menu.GetActiveProductsByCategorySlugAsync(slug, ct);
        return Ok(items);
    }

    // GET /api/public/products/{id}
    [HttpGet("products/{id:int}")]
    [OutputCache(PolicyName = "public-menu")]
    public async Task<IActionResult> GetProductById([FromRoute] int id, CancellationToken ct)
    {
        var item = await _menu.GetActiveProductByIdAsync(id, ct);
        if (item is null) return NotFound(new { message = "Product not found." });
        return Ok(item);
    }
}
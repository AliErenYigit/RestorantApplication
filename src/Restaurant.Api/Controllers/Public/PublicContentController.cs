using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Interfaces;
using Microsoft.AspNetCore.RateLimiting;


namespace Restaurant.Api.Controllers.Public;

[ApiController]
[EnableRateLimiting("public")]
[Route("api/public/content")]
public class PublicContentController : ControllerBase
{
    private readonly IPublicContentQuery _content;

    public PublicContentController(IPublicContentQuery content)
    {
        _content = content;
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetContentByKey([FromRoute] string key, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(key))
            return BadRequest(new { message = "Content key is required." });

        var item = await _content.GetContentByKeyAsync(key, ct);
        if (item is null) return NotFound(new { message = "Content not found." });
        return Ok(item);
    }
}
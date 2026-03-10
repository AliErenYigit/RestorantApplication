using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Security;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Api.Contracts.Admin;

namespace Restaurant.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/uploads")]
[ServiceFilter(typeof(AdminApiKeyFilter))]
[EnableRateLimiting("admin")]
public class AdminUploadsController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly IFileScanner _scanner;

    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    public AdminUploadsController(IConfiguration config, AppDbContext db, IFileScanner scanner)
    {
        _config = config;
        _db = db;
        _scanner = scanner;
    }

    [HttpPost("product-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> UploadProductImage(
        [FromForm] UploadProductImageRequest request,
        CancellationToken ct)
    {
        try
        {
            var file = request.File;

            if (file is null || file.Length == 0)
                return BadRequest(new { message = "File is required." });

            if (!Allowed.Contains(file.ContentType))
                return BadRequest(new { message = "Only JPG, PNG, WEBP are allowed." });

            var maxMb = _config.GetValue<int>("Uploads:MaxMb", 5);
            var maxBytes = maxMb * 1024 * 1024;
            if (file.Length > maxBytes)
                return BadRequest(new { message = $"File too large. Max {maxMb}MB." });

            var tempDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "_tmp");
            Directory.CreateDirectory(tempDir);

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext))
            {
                ext = file.ContentType switch
                {
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    _ => ".jpg"
                };
            }

            var tempName = $"{Guid.NewGuid():N}{ext}";
            var tempAbs = Path.Combine(tempDir, tempName);

            await using (var stream = System.IO.File.Create(tempAbs))
            {
                await file.CopyToAsync(stream, ct);
            }

            var sha256 = await ComputeSha256Async(tempAbs, ct);

            var existing = await _db.UploadFiles
                .AsNoTracking()
                .Where(x =>
                    x.Sha256 == sha256 &&
                    (x.ScanStatus == "clean" || x.ScanStatus == "skipped"))
                .OrderByDescending(x => x.UploadedAt)
                .FirstOrDefaultAsync(ct);

            if (existing is not null)
            {
                SafeDeleteFile(tempAbs);

                var existingUrl = "/" + existing.RelativePath.Replace("\\", "/");
                return Ok(new
                {
                    imageUrl = existingUrl,
                    sha256,
                    duplicated = true
                });
            }

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var relPath = Path.Combine("uploads", "products", fileName).Replace("\\", "/");
            var finalAbs = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                relPath.Replace("/", Path.DirectorySeparatorChar.ToString())
            );

            Directory.CreateDirectory(Path.GetDirectoryName(finalAbs)!);
            System.IO.File.Move(tempAbs, finalAbs);

            var upload = new UploadFile
            {
                FileName = fileName,
                RelativePath = relPath,
                ContentType = file.ContentType,
                SizeBytes = file.Length,
                Sha256 = sha256,
                ScanStatus = "pending",
                ScanEngine = "clamav"
            };

            _db.UploadFiles.Add(upload);
            await _db.SaveChangesAsync(ct);

            var scan = await _scanner.ScanAsync(finalAbs, ct);

            upload.ScanStatus = (scan.Status ?? "failed").ToLowerInvariant();
            upload.ScanEngine = scan.Engine;
            upload.ScanDetails = scan.Details;

            await _db.SaveChangesAsync(ct);

            if (upload.ScanStatus == "infected")
            {
                SafeDeleteFile(finalAbs);
                return BadRequest(new { message = "Upload rejected by antivirus scan." });
            }

            if (upload.ScanStatus == "failed")
            {
                var strict = _config.GetValue<bool>("Antivirus:StrictMode", false);
                if (strict)
                {
                    SafeDeleteFile(finalAbs);
                    return StatusCode(503, new { message = "Antivirus scan failed. Try again later." });
                }
            }

            var url = "/" + relPath;
            return Ok(new
            {
                imageUrl = url,
                sha256,
                duplicated = false
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Unexpected error during upload.",
                error = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    [HttpDelete("product-image")]
    public async Task<IActionResult> DeleteProductImage([FromQuery] string imageUrl, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return BadRequest(new { message = "imageUrl is required." });

        var rel = imageUrl.Trim().TrimStart('/');
        rel = rel.Replace("\\", "/");

        if (!rel.StartsWith("uploads/products/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only uploads/products files can be deleted." });

        if (rel.Contains(".."))
            return BadRequest(new { message = "Invalid path." });

        var abs = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            rel.Replace("/", Path.DirectorySeparatorChar.ToString())
        );

        var log = await _db.UploadFiles.FirstOrDefaultAsync(x => x.RelativePath == rel, ct);
        if (log is null)
            return NotFound(new { message = "File not found in upload logs." });

        var inUse = await _db.Products.AnyAsync(
            p => p.ImageUrl == ("/" + rel) || p.ImageUrl == rel,
            ct
        );

        if (inUse)
            return Conflict(new { message = "File is used by a product. Remove it from product first." });

        try
        {
            if (System.IO.File.Exists(abs))
                System.IO.File.Delete(abs);
        }
        catch
        {
            return StatusCode(500, new { message = "Could not delete file from disk." });
        }

        log.ScanStatus = "deleted";
        log.ScanDetails = "Deleted by admin.";
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 20 : pageSize;

        var q = _db.UploadFiles.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var s = status.Trim().ToLowerInvariant();
            q = q.Where(x => x.ScanStatus.ToLower() == s);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            q = q.Where(x =>
                x.FileName.Contains(s) ||
                x.RelativePath.Contains(s) ||
                x.Sha256.Contains(s));
        }

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(x => x.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new UploadLogDto(
                x.Id,
                x.FileName,
                x.RelativePath,
                x.ContentType,
                x.SizeBytes,
                x.Sha256,
                x.ScanStatus,
                x.ScanEngine,
                x.UploadedAt
            ))
            .ToListAsync(ct);

        return Ok(new Restaurant.Application.DTOs.PagedResult<UploadLogDto>(
            page,
            pageSize,
            total,
            items
        ));
    }

    private static async Task<string> ComputeSha256Async(string path, CancellationToken ct)
    {
        await using var fs = System.IO.File.OpenRead(path);
        using var sha = SHA256.Create();
        var hash = await sha.ComputeHashAsync(fs, ct);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static void SafeDeleteFile(string absPath)
    {
        try
        {
            if (System.IO.File.Exists(absPath))
                System.IO.File.Delete(absPath);
        }
        catch
        {
        }
    }
}
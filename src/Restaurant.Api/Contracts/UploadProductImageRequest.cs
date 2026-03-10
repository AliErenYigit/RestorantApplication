using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Restaurant.Api.Contracts.Admin;

public class UploadProductImageRequest
{
    [FromForm(Name = "file")]
    public IFormFile File { get; set; } = default!;
}
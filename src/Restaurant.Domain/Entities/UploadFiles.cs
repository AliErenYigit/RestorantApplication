namespace Restaurant.Domain.Entities;

public class UploadFile
{
    public int Id { get; set; }

    public string FileName { get; set; } = null!;
    public string RelativePath { get; set; } = null!; // uploads/products/xxx.jpg
    public string ContentType { get; set; } = null!;
    public long SizeBytes { get; set; }

    public string Sha256 { get; set; } = null!;

    // Scan durumu
    public string ScanStatus { get; set; } = "pending"; // pending / clean / infected / skipped / failed
    public string? ScanEngine { get; set; }             // clamav
    public string? ScanDetails { get; set; }            // output

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
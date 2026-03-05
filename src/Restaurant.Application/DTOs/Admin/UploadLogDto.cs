namespace Restaurant.Application.DTOs.Admin;

public sealed record UploadLogDto(
    int Id,
    string FileName,
    string RelativePath,
    string ContentType,
    long SizeBytes,
    string Sha256,
    string ScanStatus,
    string? ScanEngine,
    DateTime UploadedAt
);
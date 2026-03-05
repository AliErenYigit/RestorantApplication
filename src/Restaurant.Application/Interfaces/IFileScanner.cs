namespace Restaurant.Application.Interfaces;

public sealed record ScanResult(
    string Status,      // clean / infected / failed / skipped
    string Engine,
    string? Details
);

public interface IFileScanner
{
    Task<ScanResult> ScanAsync(string absoluteFilePath, CancellationToken ct = default);
}
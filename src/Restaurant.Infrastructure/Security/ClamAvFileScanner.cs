using System.Diagnostics;
using Restaurant.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Restaurant.Infrastructure.Security;

public sealed class ClamAvFileScanner : IFileScanner
{
    private readonly IConfiguration _config;

    public ClamAvFileScanner(IConfiguration config)
    {
        _config = config;
    }

    public async Task<ScanResult> ScanAsync(string absoluteFilePath, CancellationToken ct = default)
    {
        var enabled = _config.GetValue<bool>("Antivirus:Enabled", false);
        if (!enabled)
            return new ScanResult("skipped", "clamav", "Antivirus disabled.");

        var clamscanPath = _config.GetValue<string>("Antivirus:ClamScanPath", "clamscan");

        // clamscan return codes:
        // 0 = no virus found
        // 1 = virus found
        // 2 = error
        var psi = new ProcessStartInfo
        {
            FileName = clamscanPath,
            Arguments = $"--no-summary \"{absoluteFilePath}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        try
        {
            using var p = Process.Start(psi);
            if (p is null)
                return new ScanResult("failed", "clamav", "Could not start clamscan.");

            var stdoutTask = p.StandardOutput.ReadToEndAsync();
            var stderrTask = p.StandardError.ReadToEndAsync();

            await p.WaitForExitAsync(ct);

            var stdout = await stdoutTask;
            var stderr = await stderrTask;

            var details = (stdout + "\n" + stderr).Trim();
            if (details.Length > 1800) details = details[..1800];

            return p.ExitCode switch
            {
                0 => new ScanResult("clean", "clamav", details),
                1 => new ScanResult("infected", "clamav", details),
                _ => new ScanResult("failed", "clamav", details)
            };
        }
        catch (Exception ex)
        {
            var msg = ex.Message.Length > 1800 ? ex.Message[..1800] : ex.Message;
            return new ScanResult("failed", "clamav", msg);
        }
    }
}
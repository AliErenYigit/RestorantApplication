using System.Text;
using System.Text.RegularExpressions;

namespace Restaurant.Application.Utils;

public static class Slugify
{
    public static string Create(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";

        var s = text.Trim().ToLowerInvariant();

        // Türkçe karakter dönüşümü
        s = s
            .Replace("ç", "c")
            .Replace("ğ", "g")
            .Replace("ı", "i")
            .Replace("İ", "i")
            .Replace("ö", "o")
            .Replace("ş", "s")
            .Replace("ü", "u");

        // Noktalama vs temizle
        s = Regex.Replace(s, @"[^a-z0-9\s-]", "");
        s = Regex.Replace(s, @"\s+", " ").Trim();
        s = s.Replace(" ", "-");
        s = Regex.Replace(s, "-{2,}", "-").Trim('-');

        return s;
    }

    public static string Ensure(string? providedSlug, string name)
    {
        var slug = Create(providedSlug);
        if (!string.IsNullOrWhiteSpace(slug)) return slug;

        return Create(name);
    }
}
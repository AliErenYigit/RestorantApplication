namespace Restaurant.Application.Utils;

public static class ValidationRules
{
    public static bool IsPositivePrice(decimal price) => price >= 0;
}
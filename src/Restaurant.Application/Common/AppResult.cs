namespace Restaurant.Application.Common;

public sealed record AppResult<T>(
    bool Success,
    T? Data,
    AppErrorCode? ErrorCode,
    string? Message,
    Dictionary<string, string[]>? Errors
)
{
    public static AppResult<T> Ok(T data) => new(true, data, null, null, null);

    public static AppResult<T> Fail(
        AppErrorCode code,
        string message,
        Dictionary<string, string[]>? errors = null
    ) => new(false, default, code, message, errors);
}
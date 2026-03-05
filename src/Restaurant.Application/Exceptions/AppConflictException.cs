namespace Restaurant.Application.Exceptions;

public sealed class AppConflictException : Exception
{
    public AppConflictException(string message) : base(message) { }
}
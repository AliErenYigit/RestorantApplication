namespace Restaurant.Application.Exceptions;

public sealed class AppNotFoundException : Exception
{
    public AppNotFoundException(string message) : base(message) { }
}
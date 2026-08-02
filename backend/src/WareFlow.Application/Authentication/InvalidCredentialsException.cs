namespace WareFlow.Application.Authentication;

public sealed class InvalidCredentialsException
    : Exception
{
    public InvalidCredentialsException()
        : base("Email or password is incorrect.")
    {
    }
}
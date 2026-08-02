namespace WareFlow.Application.Authentication;

public sealed class CurrentPasswordIncorrectException
    : Exception
{
    public CurrentPasswordIncorrectException()
        : base(
            "Current password is incorrect."
        )
    {
    }
}
namespace WareFlow.Application.Authentication;

public sealed class InitialSetupAlreadyCompletedException
    : Exception
{
    public InitialSetupAlreadyCompletedException()
        : base(
            "Initial administrator setup has already been completed."
        )
    {
    }
}
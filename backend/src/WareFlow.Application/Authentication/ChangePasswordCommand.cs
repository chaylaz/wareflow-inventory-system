namespace WareFlow.Application.Authentication;

public sealed record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword
);
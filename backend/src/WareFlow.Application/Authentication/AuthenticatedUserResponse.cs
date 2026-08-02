namespace WareFlow.Application.Authentication;

public sealed record AuthenticatedUserResponse(
    Guid Id,
    string FullName,
    string Email,
    string Role
);
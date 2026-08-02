namespace WareFlow.Application.Authentication;

public sealed class AuthenticatedUserNotFoundException(
    Guid userId
) : Exception(
    $"Authenticated user with ID '{userId}' was not found."
);
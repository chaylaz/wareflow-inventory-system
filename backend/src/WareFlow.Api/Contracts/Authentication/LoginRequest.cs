using System.ComponentModel.DataAnnotations;

namespace WareFlow.Api.Contracts.Authentication;

public sealed class LoginRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; init; } =
        string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(128)]
    public string Password { get; init; } =
        string.Empty;

    public bool RememberMe { get; init; }
}
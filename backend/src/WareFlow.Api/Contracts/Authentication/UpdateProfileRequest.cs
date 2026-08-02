using System.ComponentModel.DataAnnotations;

namespace WareFlow.Api.Contracts.Authentication;

public sealed class UpdateProfileRequest
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; init; } =
        string.Empty;
}
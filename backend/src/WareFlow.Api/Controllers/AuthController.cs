using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WareFlow.Api.Contracts.Authentication;
using WareFlow.Application.Authentication;

namespace WareFlow.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IAuthService authService
) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("setup")]
    [ProducesResponseType(
        typeof(AuthenticatedUserResponse),
        StatusCodes.Status201Created
    )]
    [ProducesResponseType(
        StatusCodes.Status409Conflict
    )]
    public async Task<ActionResult<
        AuthenticatedUserResponse
    >> SetupInitialAdmin(
        SetupInitialAdminRequest request,
        CancellationToken cancellationToken)
    {
        var command =
            new SetupInitialAdminCommand(
                FullName: request.FullName,
                Email: request.Email,
                Password: request.Password
            );

        var user =
            await authService
                .SetupInitialAdminAsync(
                    command,
                    cancellationToken
                );

        return StatusCode(
            StatusCodes.Status201Created,
            user
        );
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(
        typeof(AuthenticatedUserResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized
    )]
    public async Task<ActionResult<
        AuthenticatedUserResponse
    >> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var command = new LoginCommand(
            Email: request.Email,
            Password: request.Password
        );

        var user =
            await authService.LoginAsync(
                command,
                cancellationToken
            );

        var authenticationProperties =
            new AuthenticationProperties
            {
                IsPersistent =
                    request.RememberMe,

                AllowRefresh = true,

                ExpiresUtc =
                    request.RememberMe
                        ? DateTimeOffset.UtcNow
                            .AddDays(7)
                        : null
            };

        await SignInUserAsync(
            user,
            authenticationProperties
        );

        return Ok(user);
    }

    [HttpGet("me")]
    [ProducesResponseType(
        typeof(AuthenticatedUserResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized
    )]
    public ActionResult<
        AuthenticatedUserResponse
    > GetCurrentUser()
    {
        var currentUser =
            GetCurrentUserFromClaims();

        return currentUser is null
            ? Unauthorized()
            : Ok(currentUser);
    }

    [HttpPut("profile")]
    [ProducesResponseType(
        typeof(AuthenticatedUserResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized
    )]
    public async Task<ActionResult<
        AuthenticatedUserResponse
    >> UpdateProfile(
        UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var command =
            new UpdateProfileCommand(
                FullName: request.FullName
            );

        var updatedUser =
            await authService.UpdateProfileAsync(
                userId.Value,
                command,
                cancellationToken
            );

        var authenticationResult =
            await HttpContext.AuthenticateAsync(
                CookieAuthenticationDefaults
                    .AuthenticationScheme
            );

        var authenticationProperties =
            authenticationResult.Properties ??
            new AuthenticationProperties
            {
                AllowRefresh = true
            };

        await SignInUserAsync(
            updatedUser,
            authenticationProperties
        );

        return Ok(updatedUser);
    }

    [HttpPost("change-password")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent
    )]
    [ProducesResponseType(
        StatusCodes.Status400BadRequest
    )]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized
    )]
    public async Task<IActionResult>
        ChangePassword(
            ChangePasswordRequest request,
            CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var command =
            new ChangePasswordCommand(
                CurrentPassword:
                    request.CurrentPassword,

                NewPassword:
                    request.NewPassword
            );

        await authService.ChangePasswordAsync(
            userId.Value,
            command,
            cancellationToken
        );

        return NoContent();
    }

    [HttpPost("logout")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent
    )]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults
                .AuthenticationScheme
        );

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var idValue =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        return Guid.TryParse(
            idValue,
            out var userId
        )
            ? userId
            : null;
    }

    private AuthenticatedUserResponse?
        GetCurrentUserFromClaims()
    {
        var userId = GetCurrentUserId();

        var fullName =
            User.FindFirst(
                ClaimTypes.Name
            )?.Value;

        var email =
            User.FindFirst(
                ClaimTypes.Email
            )?.Value;

        var role =
            User.FindFirst(
                ClaimTypes.Role
            )?.Value;

        if (
            userId is null ||
            string.IsNullOrWhiteSpace(
                fullName
            ) ||
            string.IsNullOrWhiteSpace(
                email
            ) ||
            string.IsNullOrWhiteSpace(
                role
            )
        )
        {
            return null;
        }

        return new AuthenticatedUserResponse(
            Id: userId.Value,
            FullName: fullName,
            Email: email,
            Role: role
        );
    }

    private async Task SignInUserAsync(
        AuthenticatedUserResponse user,
        AuthenticationProperties
            authenticationProperties)
    {
        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new(
                ClaimTypes.Name,
                user.FullName
            ),

            new(
                ClaimTypes.Email,
                user.Email
            ),

            new(
                ClaimTypes.Role,
                user.Role
            )
        };

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults
                .AuthenticationScheme
        );

        var principal =
            new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults
                .AuthenticationScheme,
            principal,
            authenticationProperties
        );
    }
}
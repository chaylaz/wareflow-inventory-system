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
            await authService.SetupInitialAdminAsync(
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

        var user = await authService.LoginAsync(
            command,
            cancellationToken
        );

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

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults
                .AuthenticationScheme,
            principal,
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
        var idValue =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

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
            !Guid.TryParse(idValue, out var userId) ||
            string.IsNullOrWhiteSpace(fullName) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(role)
        )
        {
            return Unauthorized();
        }

        return Ok(
            new AuthenticatedUserResponse(
                Id: userId,
                FullName: fullName,
                Email: email,
                Role: role
            )
        );
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
}
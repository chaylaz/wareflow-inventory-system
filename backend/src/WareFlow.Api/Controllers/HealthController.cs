using Microsoft.AspNetCore.Mvc;
using WareFlow.Api.Contracts.Health;

namespace WareFlow.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly IHostEnvironment _environment;

    public HealthController(IHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> Get()
    {
        var response = new HealthResponse(
            Application: "WareFlow API",
            Status: "Healthy",
            Environment: _environment.EnvironmentName,
            TimestampUtc: DateTimeOffset.UtcNow
        );

        return Ok(response);
    }
}
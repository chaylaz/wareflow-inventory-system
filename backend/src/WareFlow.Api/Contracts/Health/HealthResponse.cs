namespace WareFlow.Api.Contracts.Health;

public sealed record HealthResponse(
    string Application,
    string Status,
    string Environment,
    DateTimeOffset TimestampUtc
);
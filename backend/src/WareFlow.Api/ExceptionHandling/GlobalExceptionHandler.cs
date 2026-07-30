using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using WareFlow.Application.Categories;

namespace WareFlow.Api.ExceptionHandling;

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger
) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            CategoryNotFoundException => (
                StatusCodes.Status404NotFound,
                "Category not found.",
                exception.Message
            ),

            CategoryAlreadyExistsException => (
                StatusCodes.Status409Conflict,
                "Category already exists.",
                exception.Message
            ),

            ArgumentException => (
                StatusCodes.Status400BadRequest,
                "Invalid request.",
                exception.Message
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal server error.",
                "An unexpected error occurred."
            )
        };

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(
                exception,
                "An unhandled exception occurred while processing {Method} {Path}.",
                httpContext.Request.Method,
                httpContext.Request.Path
            );
        }
        else
        {
            logger.LogWarning(
                exception,
                "Request failed with status code {StatusCode}.",
                statusCode
            );
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] =
            httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType =
            "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken
        );

        return true;
    }
}
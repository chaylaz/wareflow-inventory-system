using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using WareFlow.Application.Categories;
using WareFlow.Application.Products;
using WareFlow.Application.Warehouses;

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

            WarehouseNotFoundException => (
                StatusCodes.Status404NotFound,
                "Warehouse not found.",
                exception.Message
            ),

            WarehouseAlreadyExistsException => (
                StatusCodes.Status409Conflict,
                "Warehouse already exists.",
                exception.Message
            ),

            ProductNotFoundException => (
                StatusCodes.Status404NotFound,
                "Product not found.",
                exception.Message
            ),

            ProductAlreadyExistsException => (
                StatusCodes.Status409Conflict,
                "Product already exists.",
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
                "An unexpected error occurred while processing the request."
            )
        };

        LogException(
            exception,
            statusCode,
            httpContext.Request.Method,
            httpContext.Request.Path
        );

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

    private void LogException(
        Exception exception,
        int statusCode,
        string method,
        PathString path)
    {
        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(
                exception,
                "An unhandled exception occurred while processing {Method} {Path}.",
                method,
                path
            );

            return;
        }

        logger.LogWarning(
            exception,
            "Request {Method} {Path} failed with status code {StatusCode}.",
            method,
            path,
            statusCode
        );
    }
}
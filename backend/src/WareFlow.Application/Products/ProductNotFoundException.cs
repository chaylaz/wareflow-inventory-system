namespace WareFlow.Application.Products;

public sealed class ProductNotFoundException(
    Guid productId
) : Exception(
    $"Product with ID '{productId}' was not found."
);
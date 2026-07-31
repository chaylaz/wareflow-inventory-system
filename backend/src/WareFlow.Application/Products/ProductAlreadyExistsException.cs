namespace WareFlow.Application.Products;

public sealed class ProductAlreadyExistsException(
    string productSku
) : Exception(
    $"Product with SKU '{productSku}' already exists."
);
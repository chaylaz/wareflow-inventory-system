namespace WareFlow.Application.Categories;

public sealed class CategoryAlreadyExistsException(string categoryName)
    : Exception($"Category '{categoryName}' already exists.");
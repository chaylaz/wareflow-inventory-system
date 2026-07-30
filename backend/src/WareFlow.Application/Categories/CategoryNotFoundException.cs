namespace WareFlow.Application.Categories;

public sealed class CategoryNotFoundException(Guid categoryId)
    : Exception(
        $"Category with ID '{categoryId}' was not found."
    );
namespace WareFlow.Application.Categories;

public sealed record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? Description
);
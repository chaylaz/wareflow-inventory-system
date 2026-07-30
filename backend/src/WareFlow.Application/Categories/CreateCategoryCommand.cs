namespace WareFlow.Application.Categories;

public sealed record CreateCategoryCommand(
    string Name,
    string? Description
);
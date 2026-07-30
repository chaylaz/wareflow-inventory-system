namespace WareFlow.Domain.Entities;

public sealed class Category
{
    private Category()
    {
        // Digunakan oleh Entity Framework Core.
    }

    public Category(string name, string? description)
    {
        Id = Guid.NewGuid();

        SetName(name);
        SetDescription(description);

        IsActive = true;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public void Update(string name, string? description)
    {
        SetName(name);
        SetDescription(description);

        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Category name cannot be empty.",
                nameof(name)
            );
        }

        var normalizedName = name.Trim();

        if (normalizedName.Length > 100)
        {
            throw new ArgumentException(
                "Category name cannot exceed 100 characters.",
                nameof(name)
            );
        }

        Name = normalizedName;
    }

    private void SetDescription(string? description)
    {
        var normalizedDescription = description?.Trim();

        if (normalizedDescription?.Length > 500)
        {
            throw new ArgumentException(
                "Category description cannot exceed 500 characters.",
                nameof(description)
            );
        }

        Description = string.IsNullOrWhiteSpace(normalizedDescription)
            ? null
            : normalizedDescription;
    }
}
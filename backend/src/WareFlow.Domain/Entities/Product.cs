namespace WareFlow.Domain.Entities;

public sealed class Product
{
    private Product()
    {
        // Digunakan oleh Entity Framework Core.
    }

    public Product(
        string sku,
        string name,
        Guid categoryId,
        string unit,
        string? description,
        int minimumStock)
    {
        Id = Guid.NewGuid();

        SetSku(sku);
        SetName(name);
        SetCategory(categoryId);
        SetUnit(unit);
        SetDescription(description);
        SetMinimumStock(minimumStock);

        IsActive = true;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public string Sku { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public Guid CategoryId { get; private set; }

    public Category Category { get; private set; } = null!;

    public string Unit { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public int MinimumStock { get; private set; }

    public bool IsActive { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public void Update(
        string sku,
        string name,
        Guid categoryId,
        string unit,
        string? description,
        int minimumStock)
    {
        SetSku(sku);
        SetName(name);
        SetCategory(categoryId);
        SetUnit(unit);
        SetDescription(description);
        SetMinimumStock(minimumStock);

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

    private void SetSku(string sku)
    {
        if (string.IsNullOrWhiteSpace(sku))
        {
            throw new ArgumentException(
                "Product SKU cannot be empty.",
                nameof(sku)
            );
        }

        var normalizedSku = sku.Trim().ToUpperInvariant();

        if (normalizedSku.Length > 50)
        {
            throw new ArgumentException(
                "Product SKU cannot exceed 50 characters.",
                nameof(sku)
            );
        }

        var containsInvalidCharacter =
            normalizedSku.Any(character =>
                !char.IsLetterOrDigit(character) &&
                character != '-'
            );

        if (containsInvalidCharacter)
        {
            throw new ArgumentException(
                "Product SKU can only contain letters, numbers, and hyphens.",
                nameof(sku)
            );
        }

        Sku = normalizedSku;
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Product name cannot be empty.",
                nameof(name)
            );
        }

        var normalizedName = name.Trim();

        if (normalizedName.Length > 150)
        {
            throw new ArgumentException(
                "Product name cannot exceed 150 characters.",
                nameof(name)
            );
        }

        Name = normalizedName;
    }

    private void SetCategory(Guid categoryId)
    {
        if (categoryId == Guid.Empty)
        {
            throw new ArgumentException(
                "Product category is required.",
                nameof(categoryId)
            );
        }

        CategoryId = categoryId;
    }

    private void SetUnit(string unit)
    {
        if (string.IsNullOrWhiteSpace(unit))
        {
            throw new ArgumentException(
                "Product unit cannot be empty.",
                nameof(unit)
            );
        }

        var normalizedUnit = unit.Trim();

        if (normalizedUnit.Length > 30)
        {
            throw new ArgumentException(
                "Product unit cannot exceed 30 characters.",
                nameof(unit)
            );
        }

        Unit = normalizedUnit;
    }

    private void SetDescription(string? description)
    {
        var normalizedDescription = description?.Trim();

        if (normalizedDescription?.Length > 500)
        {
            throw new ArgumentException(
                "Product description cannot exceed 500 characters.",
                nameof(description)
            );
        }

        Description =
            string.IsNullOrWhiteSpace(normalizedDescription)
                ? null
                : normalizedDescription;
    }

    private void SetMinimumStock(int minimumStock)
    {
        if (minimumStock < 0)
        {
            throw new ArgumentException(
                "Minimum stock cannot be negative.",
                nameof(minimumStock)
            );
        }

        MinimumStock = minimumStock;
    }
}
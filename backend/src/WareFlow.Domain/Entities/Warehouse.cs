namespace WareFlow.Domain.Entities;

public sealed class Warehouse
{
    private Warehouse()
    {
        // Digunakan oleh Entity Framework Core.
    }

    public Warehouse(
        string code,
        string name,
        string? address)
    {
        Id = Guid.NewGuid();

        SetCode(code);
        SetName(name);
        SetAddress(address);

        IsActive = true;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Address { get; private set; }

    public bool IsActive { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public void Update(
        string code,
        string name,
        string? address)
    {
        SetCode(code);
        SetName(name);
        SetAddress(address);

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

    private void SetCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException(
                "Warehouse code cannot be empty.",
                nameof(code)
            );
        }

        var normalizedCode = code.Trim().ToUpperInvariant();

        if (normalizedCode.Length > 20)
        {
            throw new ArgumentException(
                "Warehouse code cannot exceed 20 characters.",
                nameof(code)
            );
        }

        var containsInvalidCharacter =
            normalizedCode.Any(character =>
                !char.IsLetterOrDigit(character) &&
                character != '-'
            );

        if (containsInvalidCharacter)
        {
            throw new ArgumentException(
                "Warehouse code can only contain letters, numbers, and hyphens.",
                nameof(code)
            );
        }

        Code = normalizedCode;
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Warehouse name cannot be empty.",
                nameof(name)
            );
        }

        var normalizedName = name.Trim();

        if (normalizedName.Length > 100)
        {
            throw new ArgumentException(
                "Warehouse name cannot exceed 100 characters.",
                nameof(name)
            );
        }

        Name = normalizedName;
    }

    private void SetAddress(string? address)
    {
        var normalizedAddress = address?.Trim();

        if (normalizedAddress?.Length > 300)
        {
            throw new ArgumentException(
                "Warehouse address cannot exceed 300 characters.",
                nameof(address)
            );
        }

        Address = string.IsNullOrWhiteSpace(normalizedAddress)
            ? null
            : normalizedAddress;
    }
}
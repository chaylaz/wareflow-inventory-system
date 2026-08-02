namespace WareFlow.Domain.Entities;

public sealed class AppUser
{
    private AppUser()
    {
        // Digunakan oleh Entity Framework Core.
    }

    public AppUser(
        string fullName,
        string email,
        string passwordHash,
        string role)
    {
        Id = Guid.NewGuid();

        SetFullName(fullName);
        SetEmail(email);
        SetPasswordHash(passwordHash);
        SetRole(role);

        IsActive = true;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public string FullName { get; private set; } =
        string.Empty;

    public string Email { get; private set; } =
        string.Empty;

    public string PasswordHash { get; private set; } =
        string.Empty;

    public string Role { get; private set; } =
        string.Empty;

    public bool IsActive { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? LastLoginAtUtc { get; private set; }

    public void UpdateFullName(string fullName)
    {
        SetFullName(fullName);
    }

    public void ChangePasswordHash(
        string passwordHash)
    {
        SetPasswordHash(passwordHash);
    }

    public void RecordSuccessfulLogin()
    {
        LastLoginAtUtc = DateTimeOffset.UtcNow;
    }

    private void SetFullName(string fullName)
    {
        var normalizedFullName =
            fullName.Trim();

        if (
            string.IsNullOrWhiteSpace(
                normalizedFullName
            )
        )
        {
            throw new ArgumentException(
                "Full name is required.",
                nameof(fullName)
            );
        }

        if (normalizedFullName.Length > 150)
        {
            throw new ArgumentException(
                "Full name cannot exceed 150 characters.",
                nameof(fullName)
            );
        }

        FullName = normalizedFullName;
    }

    private void SetEmail(string email)
    {
        var normalizedEmail =
            email.Trim().ToLowerInvariant();

        if (
            string.IsNullOrWhiteSpace(
                normalizedEmail
            )
        )
        {
            throw new ArgumentException(
                "Email is required.",
                nameof(email)
            );
        }

        if (normalizedEmail.Length > 256)
        {
            throw new ArgumentException(
                "Email cannot exceed 256 characters.",
                nameof(email)
            );
        }

        Email = normalizedEmail;
    }

    private void SetPasswordHash(
        string passwordHash)
    {
        if (
            string.IsNullOrWhiteSpace(
                passwordHash
            )
        )
        {
            throw new ArgumentException(
                "Password hash is required.",
                nameof(passwordHash)
            );
        }

        PasswordHash = passwordHash;
    }

    private void SetRole(string role)
    {
        var normalizedRole = role.Trim();

        if (
            string.IsNullOrWhiteSpace(
                normalizedRole
            )
        )
        {
            throw new ArgumentException(
                "Role is required.",
                nameof(role)
            );
        }

        if (normalizedRole.Length > 50)
        {
            throw new ArgumentException(
                "Role cannot exceed 50 characters.",
                nameof(role)
            );
        }

        Role = normalizedRole;
    }
}
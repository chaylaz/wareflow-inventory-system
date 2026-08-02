using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using WareFlow.Application.Abstractions;

namespace WareFlow.Infrastructure.Security;

public sealed class Pbkdf2PasswordHasher
    : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 210_000;

    public string Hash(string password)
    {
        ValidatePassword(password);

        var salt =
            RandomNumberGenerator.GetBytes(SaltSize);

        var passwordBytes =
            Encoding.UTF8.GetBytes(password);

        try
        {
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                passwordBytes,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                HashSize
            );

            return string.Join(
                ".",
                "v1",
                Iterations.ToString(
                    CultureInfo.InvariantCulture
                ),
                Convert.ToBase64String(salt),
                Convert.ToBase64String(hash)
            );
        }
        finally
        {
            CryptographicOperations.ZeroMemory(
                passwordBytes
            );
        }
    }

    public bool Verify(
        string password,
        string encodedPasswordHash)
    {
        if (
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(encodedPasswordHash)
        )
        {
            return false;
        }

        try
        {
            var parts =
                encodedPasswordHash.Split('.');

            if (
                parts.Length != 4 ||
                parts[0] != "v1"
            )
            {
                return false;
            }

            if (
                !int.TryParse(
                    parts[1],
                    NumberStyles.None,
                    CultureInfo.InvariantCulture,
                    out var iterations
                )
            )
            {
                return false;
            }

            var salt =
                Convert.FromBase64String(parts[2]);

            var expectedHash =
                Convert.FromBase64String(parts[3]);

            var passwordBytes =
                Encoding.UTF8.GetBytes(password);

            try
            {
                var actualHash =
                    Rfc2898DeriveBytes.Pbkdf2(
                        passwordBytes,
                        salt,
                        iterations,
                        HashAlgorithmName.SHA256,
                        expectedHash.Length
                    );

                try
                {
                    return CryptographicOperations
                        .FixedTimeEquals(
                            actualHash,
                            expectedHash
                        );
                }
                finally
                {
                    CryptographicOperations.ZeroMemory(
                        actualHash
                    );
                }
            }
            finally
            {
                CryptographicOperations.ZeroMemory(
                    passwordBytes
                );
            }
        }
        catch (
            FormatException
        )
        {
            return false;
        }
        catch (
            CryptographicException
        )
        {
            return false;
        }
    }

    private static void ValidatePassword(
        string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException(
                "Password is required.",
                nameof(password)
            );
        }

        if (password.Length < 8)
        {
            throw new ArgumentException(
                "Password must contain at least 8 characters.",
                nameof(password)
            );
        }

        if (password.Length > 128)
        {
            throw new ArgumentException(
                "Password cannot exceed 128 characters.",
                nameof(password)
            );
        }
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Configurations;

public sealed class AppUserConfiguration
    : IEntityTypeConfiguration<AppUser>
{
    public void Configure(
        EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(user => user.Id);

        builder.Property(user => user.Id)
            .ValueGeneratedNever();

        builder.Property(user => user.FullName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(user => user.Email)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(user => user.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(user => user.Role)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(user => user.IsActive)
            .IsRequired();

        builder.Property(user => user.CreatedAtUtc)
            .HasPrecision(0)
            .IsRequired();

        builder.Property(user => user.LastLoginAtUtc)
            .HasPrecision(0);

        builder.HasIndex(user => user.Email)
            .IsUnique();
    }
}
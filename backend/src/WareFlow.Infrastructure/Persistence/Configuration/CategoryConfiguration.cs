using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration
    : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(category => category.Id);

        builder.Property(category => category.Id)
            .ValueGeneratedNever();

        builder.Property(category => category.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(category => category.Name)
            .IsUnique();

        builder.Property(category => category.Description)
            .HasMaxLength(500);

        builder.Property(category => category.IsActive)
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(category => category.CreatedAtUtc)
            .HasPrecision(0)
            .IsRequired();

        builder.Property(category => category.UpdatedAtUtc)
            .HasPrecision(0);
    }
}
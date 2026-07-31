using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration
    : IEntityTypeConfiguration<Product>
{
    public void Configure(
        EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(product => product.Id);

        builder.Property(product => product.Id)
            .ValueGeneratedNever();

        builder.Property(product => product.Sku)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(product => product.Sku)
            .IsUnique();

        builder.Property(product => product.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(product => product.CategoryId)
            .IsRequired();

        builder.Property(product => product.Unit)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(product => product.Description)
            .HasMaxLength(500);

        builder.Property(product => product.MinimumStock)
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(product => product.IsActive)
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(product => product.CreatedAtUtc)
            .HasPrecision(0)
            .IsRequired();

        builder.Property(product => product.UpdatedAtUtc)
            .HasPrecision(0);

        builder.HasOne(product => product.Category)
            .WithMany()
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
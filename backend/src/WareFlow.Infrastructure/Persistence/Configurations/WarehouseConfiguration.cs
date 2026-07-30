using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Configurations;

public sealed class WarehouseConfiguration
    : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(
        EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.HasKey(warehouse => warehouse.Id);

        builder.Property(warehouse => warehouse.Id)
            .ValueGeneratedNever();

        builder.Property(warehouse => warehouse.Code)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(warehouse => warehouse.Code)
            .IsUnique();

        builder.Property(warehouse => warehouse.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(warehouse => warehouse.Address)
            .HasMaxLength(300);

        builder.Property(warehouse => warehouse.IsActive)
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(warehouse => warehouse.CreatedAtUtc)
            .HasPrecision(0)
            .IsRequired();

        builder.Property(warehouse => warehouse.UpdatedAtUtc)
            .HasPrecision(0);
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Configurations;

public sealed class InventoryStockConfiguration
    : IEntityTypeConfiguration<InventoryStock>
{
    public void Configure(
        EntityTypeBuilder<InventoryStock> builder)
    {
        builder.ToTable("InventoryStocks");

        builder.HasKey(stock => stock.Id);

        builder.Property(stock => stock.Id)
            .ValueGeneratedNever();

        builder.Property(stock => stock.ProductId)
            .IsRequired();

        builder.Property(stock => stock.WarehouseId)
            .IsRequired();

        builder.Property(stock => stock.Quantity)
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(stock => stock.CreatedAtUtc)
            .HasPrecision(0)
            .IsRequired();

        builder.Property(stock => stock.UpdatedAtUtc)
            .HasPrecision(0);

        builder.HasIndex(stock => new
        {
            stock.ProductId,
            stock.WarehouseId
        })
        .IsUnique();

        builder.HasOne(stock => stock.Product)
            .WithMany()
            .HasForeignKey(stock => stock.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(stock => stock.Warehouse)
            .WithMany()
            .HasForeignKey(stock => stock.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
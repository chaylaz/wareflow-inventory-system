using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Configurations;

public sealed class StockTransactionConfiguration
    : IEntityTypeConfiguration<StockTransaction>
{
    public void Configure(
        EntityTypeBuilder<StockTransaction> builder)
    {
        builder.ToTable("StockTransactions");

        builder.HasKey(transaction => transaction.Id);

        builder.Property(transaction => transaction.Id)
            .ValueGeneratedNever();

        builder.Property(transaction => transaction.InventoryStockId)
            .IsRequired();

        builder.Property(transaction => transaction.ProductId)
            .IsRequired();

        builder.Property(transaction => transaction.WarehouseId)
            .IsRequired();

        builder.Property(transaction => transaction.Type)
            .HasConversion<string>()
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(transaction => transaction.Quantity)
            .IsRequired();

        builder.Property(transaction => transaction.BalanceAfter)
            .IsRequired();

        builder.Property(transaction => transaction.CreatedAtUtc)
            .HasPrecision(0)
            .IsRequired();

        builder.HasIndex(transaction => transaction.CreatedAtUtc);

        builder.HasIndex(transaction => new
        {
            transaction.InventoryStockId,
            transaction.CreatedAtUtc
        });

        builder.HasOne(transaction => transaction.InventoryStock)
            .WithMany()
            .HasForeignKey(transaction => transaction.InventoryStockId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(transaction => transaction.Product)
            .WithMany()
            .HasForeignKey(transaction => transaction.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(transaction => transaction.Warehouse)
            .WithMany()
            .HasForeignKey(transaction => transaction.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
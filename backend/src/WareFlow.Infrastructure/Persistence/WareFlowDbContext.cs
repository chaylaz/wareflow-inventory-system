using Microsoft.EntityFrameworkCore;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence;

public sealed class WareFlowDbContext(
    DbContextOptions<WareFlowDbContext> options)
    : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(WareFlowDbContext).Assembly);
    }
}
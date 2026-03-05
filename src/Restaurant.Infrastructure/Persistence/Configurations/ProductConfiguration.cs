using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Products");

        b.HasKey(x => x.Id);

        b.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(160);

        b.Property(x => x.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        b.Property(x => x.Description)
            .HasMaxLength(1500)
            .HasDefaultValue("");

        b.Property(x => x.ImageUrl)
            .HasMaxLength(500);

        b.Property(x => x.SortOrder).HasDefaultValue(0);
        b.Property(x => x.IsActive).HasDefaultValue(true);

        b.HasIndex(x => new { x.CategoryId, x.SortOrder });
    }
}
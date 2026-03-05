using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Persistence.Configurations;

public class SiteContentConfiguration : IEntityTypeConfiguration<SiteContent>
{
    public void Configure(EntityTypeBuilder<SiteContent> b)
    {
        b.ToTable("SiteContents");

        b.HasKey(x => x.Id);

        b.Property(x => x.Key)
            .IsRequired()
            .HasMaxLength(40);

        b.HasIndex(x => x.Key).IsUnique();

        b.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        b.Property(x => x.Body)
            .IsRequired()
            .HasMaxLength(8000);

        b.Property(x => x.UpdatedAt)
            .IsRequired();
    }
}
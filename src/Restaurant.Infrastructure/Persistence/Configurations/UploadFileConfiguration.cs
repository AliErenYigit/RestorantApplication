using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Persistence.Configurations;

public class UploadFileConfiguration : IEntityTypeConfiguration<UploadFile>
{
    public void Configure(EntityTypeBuilder<UploadFile> b)
    {
        b.ToTable("UploadFiles");
        b.HasKey(x => x.Id);

        b.Property(x => x.FileName).IsRequired().HasMaxLength(200);
        b.Property(x => x.RelativePath).IsRequired().HasMaxLength(400);
        b.Property(x => x.ContentType).IsRequired().HasMaxLength(80);
        b.Property(x => x.Sha256).IsRequired().HasMaxLength(64);

        b.Property(x => x.ScanStatus).IsRequired().HasMaxLength(20);
        b.Property(x => x.ScanEngine).HasMaxLength(40);
        b.Property(x => x.ScanDetails).HasMaxLength(2000);

        b.Property(x => x.UploadedAt).IsRequired();

        b.HasIndex(x => x.Sha256);
        b.HasIndex(x => x.RelativePath).IsUnique();
    }
}
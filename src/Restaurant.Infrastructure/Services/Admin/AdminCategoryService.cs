using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Common;
using Restaurant.Application.DTOs;
using Restaurant.Application.DTOs.Admin;
using Restaurant.Application.Interfaces.Admin;
using Restaurant.Application.Utils;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Application.Exceptions;

namespace Restaurant.Infrastructure.Services.Admin;

public sealed class AdminCategoryService : IAdminCategoryService
{
    private readonly AppDbContext _db;

    public AdminCategoryService(AppDbContext db) => _db = db;

     public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Select(x => new CategoryDto(
                x.Id,
                x.Name,
                x.Slug,
                x.SortOrder,
                x.IsActive
            ))
            .ToListAsync(ct);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.Categories.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new CategoryDto(x.Id, x.Name, x.Slug, x.SortOrder,x.IsActive))
            .FirstOrDefaultAsync(ct);

    public async Task<CategoryDto> CreateAsync(CategoryUpsertRequest req, CancellationToken ct = default)
    {
        var errors = Validate(req);
        if (errors.Count > 0)
            throw new AppValidationException(errors);

        var slug = Slugify.Ensure(req.Slug, req.Name);

        var slugExists = await _db.Categories.AnyAsync(x => x.Slug == slug, ct);
        if (slugExists)
            throw new AppConflictException("Category slug already exists.");

        var entity = new Category
        {
            Name = req.Name.Trim(),
            Slug = slug,
            SortOrder = req.SortOrder,
            IsActive = req.IsActive
        };

        _db.Categories.Add(entity);
        await _db.SaveChangesAsync(ct);

        return new CategoryDto(entity.Id, entity.Name, entity.Slug, entity.SortOrder,entity.IsActive);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, CategoryUpsertRequest req, CancellationToken ct = default)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;

        var errors = Validate(req);
        if (errors.Count > 0)
            throw new AppValidationException(errors);

        var slug = Slugify.Ensure(req.Slug, req.Name);

        var slugExists = await _db.Categories.AnyAsync(x => x.Slug == slug && x.Id != id, ct);
        if (slugExists)
            throw new AppConflictException("Category slug already exists.");

        entity.Name = req.Name.Trim();
        entity.Slug = slug;
        entity.SortOrder = req.SortOrder;
        entity.IsActive = req.IsActive;

        await _db.SaveChangesAsync(ct);
        return new CategoryDto(entity.Id, entity.Name, entity.Slug, entity.SortOrder,entity.IsActive);
    }

 public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
{
    var entity = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
    if (entity is null) return false;

    // Bağlı ürün var mı?
    var hasProducts = await _db.Products.AnyAsync(p => p.CategoryId == id, ct);
    if (hasProducts)
        throw new AppConflictException("This category has products. Deactivate it instead of deleting.");

 
   
    _db.Categories.Remove(entity);
    await _db.SaveChangesAsync(ct);
    return true;
}
public async Task<CategoryDto?> SetActiveAsync(int id, bool isActive, CancellationToken ct = default)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return null;

        entity.IsActive = isActive;

        await _db.SaveChangesAsync(ct);

        return new CategoryDto(
            entity.Id,
            entity.Name,
            entity.Slug,
            entity.SortOrder,
            entity.IsActive
        );
    }


    private static Dictionary<string, string[]> Validate(CategoryUpsertRequest req)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(req.Name))
            errors["name"] = new[] { "Name is required." };
        else if (req.Name.Trim().Length > 120)
            errors["name"] = new[] { "Name must be at most 120 characters." };

        if (!string.IsNullOrWhiteSpace(req.Slug) && req.Slug.Trim().Length > 140)
            errors["slug"] = new[] { "Slug must be at most 140 characters." };

        if (req.SortOrder < 0)
            errors["sortOrder"] = new[] { "SortOrder cannot be negative." };

        return errors;
    }
}
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

public sealed class AdminProductService : IAdminProductService
{
    private readonly AppDbContext _db;

    public AdminProductService(AppDbContext db) => _db = db;

    public async Task<PagedResult<ProductDto>> GetAllAsync(ProductListQuery query, CancellationToken ct = default)
{
    var page = query.Page < 1 ? 1 : query.Page;
    var pageSize = query.PageSize is < 1 or > 200 ? 20 : query.PageSize;

    var q = _db.Products.AsNoTracking().AsQueryable();

    if (query.CategoryId.HasValue)
        q = q.Where(x => x.CategoryId == query.CategoryId.Value);

    if (query.IsActive.HasValue)
        q = q.Where(x => x.IsActive == query.IsActive.Value);

    if (!string.IsNullOrWhiteSpace(query.Search))
    {
        var s = query.Search.Trim();
        q = q.Where(x => x.Name.Contains(s) || x.Description.Contains(s));
    }

    var total = await q.CountAsync(ct);

    var items = await q
        .OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(x => new ProductDto(x.Id, x.CategoryId, x.Name, x.Price, x.Description, x.ImageUrl, x.SortOrder))
        .ToListAsync(ct);

    return new PagedResult<ProductDto>(page, pageSize, total, items);
}   

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.Products.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new ProductDto(x.Id, x.CategoryId, x.Name, x.Price, x.Description, x.ImageUrl, x.SortOrder))
            .FirstOrDefaultAsync(ct);

    public async Task<ProductDto> CreateAsync(ProductUpsertRequest req, CancellationToken ct = default)
    {
        var errors = Validate(req);
        if (errors.Count > 0)
            throw new AppValidationException(errors);

        var catExists = await _db.Categories.AnyAsync(x => x.Id == req.CategoryId, ct);
        if (!catExists) throw new AppNotFoundException("Category not found.");

        var entity = new Domain.Entities.Product
        {
            CategoryId = req.CategoryId,
            Name = req.Name.Trim(),
            Price = req.Price,
            Description = req.Description?.Trim() ?? "",
            ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim(),
            SortOrder = req.SortOrder,
            IsActive = req.IsActive
        };

        _db.Products.Add(entity);
        await _db.SaveChangesAsync(ct);

        return new ProductDto(entity.Id, entity.CategoryId, entity.Name, entity.Price, entity.Description, entity.ImageUrl, entity.SortOrder);
    }

    public async Task<ProductDto?> UpdateAsync(int id, ProductUpsertRequest req, CancellationToken ct = default)
    {
        var entity = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return null;

        var errors = Validate(req);
        if (errors.Count > 0)
            throw new AppValidationException(errors);

        var catExists = await _db.Categories.AnyAsync(x => x.Id == req.CategoryId, ct);
        if (!catExists) throw new AppNotFoundException("Category not found.");

        entity.CategoryId = req.CategoryId;
        entity.Name = req.Name.Trim();
        entity.Price = req.Price;
        entity.Description = req.Description?.Trim() ?? "";
        entity.ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim();
        entity.SortOrder = req.SortOrder;
        entity.IsActive = req.IsActive;

        await _db.SaveChangesAsync(ct);

        return new ProductDto(entity.Id, entity.CategoryId, entity.Name, entity.Price, entity.Description, entity.ImageUrl, entity.SortOrder);
    }

 public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
{
    var entity = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
    if (entity is null) return false;

    entity.IsActive = false; // soft delete

    await _db.SaveChangesAsync(ct);
    return true;
}
    private static Dictionary<string, string[]> Validate(ProductUpsertRequest req)
    {
        var errors = new Dictionary<string, string[]>();

        if (req.CategoryId <= 0)
            errors["categoryId"] = new[] { "CategoryId must be a positive integer." };

        if (string.IsNullOrWhiteSpace(req.Name))
            errors["name"] = new[] { "Name is required." };
        else if (req.Name.Trim().Length > 160)
            errors["name"] = new[] { "Name must be at most 160 characters." };

        if (!ValidationRules.IsPositivePrice(req.Price))
            errors["price"] = new[] { "Price cannot be negative." };

        if ((req.Description ?? "").Length > 1500)
            errors["description"] = new[] { "Description must be at most 1500 characters." };

        if (!string.IsNullOrWhiteSpace(req.ImageUrl) && req.ImageUrl.Trim().Length > 500)
            errors["imageUrl"] = new[] { "ImageUrl must be at most 500 characters." };

        if (req.SortOrder < 0)
            errors["sortOrder"] = new[] { "SortOrder cannot be negative." };

        return errors;
    }
}
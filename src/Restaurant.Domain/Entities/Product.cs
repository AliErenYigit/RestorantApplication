namespace Restaurant.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public string Name { get; set; } = null;
        public decimal Price { get; set; } = 0;
        public string Description { get; set; } = null;
        public string ImageUrl { get; set; } = null;

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;


    }
}
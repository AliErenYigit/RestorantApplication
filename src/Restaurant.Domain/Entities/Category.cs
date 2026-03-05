namespace Restaurant.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }=null;
    public string Slug { get; set; }=null;
    public int SortOrder { get; set; }=0;

    public bool IsActive { get; set; }=true;    

    public ICollection<Product> Products { get; set; }=new List<Product>();
}
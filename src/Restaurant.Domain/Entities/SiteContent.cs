namespace Restaurant.Domain.Entities;

public class SiteContent
{
    public int Id { get; set; }
    public string Key { get; set; }=null;
    public string Title { get; set; }=null;

    public string Body { get; set; }=null;

    public DateTime UpdatedAt { get; set; }=DateTime.UtcNow;
}
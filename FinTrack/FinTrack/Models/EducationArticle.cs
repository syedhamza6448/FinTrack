namespace FinTrack.Models
{
    public class EducationArticle
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Summary { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public string Difficulty { get; set; }
        public int ReadTimeMinutes { get; set; }
        public bool isFeatured { get; set; } = false;
        public DateTime PublishedAt { get; set; }
    }
}

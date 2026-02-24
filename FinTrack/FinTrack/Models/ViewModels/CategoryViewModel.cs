using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class CategoryViewModel
    {
        public List<Category> Categories { get; set; } = new();
        public CreateCategoryViewModel NewCategory { get; set; } = new();
    }

    public class CreateCategoryViewModel
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;  

        [Required]
        public string Type { get; set; } = string.Empty; 

        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}
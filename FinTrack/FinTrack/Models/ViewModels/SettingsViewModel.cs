using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class SettingsViewModel
    {
        public ProfileViewModel Profile { get; set; } = new();
        public ChangePasswordViewModel ChangePassword { get; set; } = new();
    }

    public class ProfileViewModel
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ChangePasswordViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "New password must be atleast 8 characters.")]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Password do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}

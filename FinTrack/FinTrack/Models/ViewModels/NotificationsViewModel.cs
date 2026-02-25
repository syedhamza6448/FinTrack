namespace FinTrack.Models.ViewModels
{
    public class NotificationsViewModel
    {
        public List<Notification> Notifications { get; set; } = new();
        public int UnreadCount { get; set; }
        public int TotalCount { get; set; }
    }
}

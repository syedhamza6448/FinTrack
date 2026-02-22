namespace FinTrack.Models
{
    public class Investment
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Ticker { get; set; }
        public string AssetType { get; set; }
        public decimal Quantity {  get; set; }
        public decimal BuyPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime PurchaseDate { get; set; }
        public decimal? DividendEarned { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ApplicationUser User {  get; set; } 
    }
}

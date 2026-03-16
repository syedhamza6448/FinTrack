using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace FinTrack.Services
{
    public class GeminiService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;

        public GeminiService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _apiKey = config["Gemini:ApiKey"]!;
        }

        public async Task<string> AskAsync(string prompt)
        {
            var body = new
            {
                model = "google/gemma-3-4b-it:free",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post,
                "https://openrouter.ai/api/v1/chat/completions");
            request.Headers.Add("Authorization", "Bearer " + _apiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request);
            var raw = await response.Content.ReadAsStringAsync();

            // Debug line — remove after confirming it works
            Console.WriteLine("OPENROUTER RESPONSE: " + raw);

            var doc = JsonDocument.Parse(raw);

            if (doc.RootElement.TryGetProperty("error", out var err))
                throw new Exception("OpenRouter error: " + err.ToString());

            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }

        public async Task<string> AskWithImageAsync(string prompt, byte[] imageBytes, string mimeType)
        {
            var base64 = Convert.ToBase64String(imageBytes);

            var body = new
            {
                model = "google/gemma-3-4b-it:free",
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = prompt },
                            new { type = "image_url", image_url = new { url = "data:" + mimeType + ";base64," + base64 } }
                        }
                    }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post,
                "https://openrouter.ai/api/v1/chat/completions");
            request.Headers.Add("Authorization", "Bearer " + _apiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request);
            var raw = await response.Content.ReadAsStringAsync();

            Console.WriteLine("OPENROUTER VISION RESPONSE: " + raw);

            var doc = JsonDocument.Parse(raw);

            if (doc.RootElement.TryGetProperty("error", out var err))
                throw new Exception("OpenRouter error: " + err.GetProperty("message").GetString());

            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }
    }
}
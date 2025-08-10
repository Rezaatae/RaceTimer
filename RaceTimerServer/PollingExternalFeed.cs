using System.Net.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

// using BackgroundService to run the polling on a separate thread.
public class PollingExternalFeed : BackgroundService
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly WebSocketManager _wsManager;
    private readonly ILogger<PollingExternalFeed> _logger;
    private readonly string _url;
    private readonly int _pollMs;

    public PollingExternalFeed(IHttpClientFactory httpFactory, WebSocketManager wsManager, IConfiguration config, ILogger<PollingExternalFeed> logger)
    {
        _httpFactory = httpFactory;
        _wsManager = wsManager;
        _logger = logger;
        _url = "http://localhost:4000/current";
        _pollMs = 800;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var client = _httpFactory.CreateClient();
        _logger.LogInformation("PollingExternalFeed started, polling {url} every {ms}ms", _url, _pollMs);

        while (!stoppingToken.IsCancellationRequested)
        {
            // try getting the data from the mock-feed port
            try
            {
                using var res = await client.GetAsync(_url, stoppingToken);
                // if we get data back from the port, broadcast the data to all clients. Else return status code.
                if (res.IsSuccessStatusCode)
                {
                    var body = await res.Content.ReadAsStringAsync(stoppingToken);
                    await _wsManager.BroadcastAsync(body);
                }
                else
                {
                    _logger.LogWarning("PollingExternalFeed received non-success {status}", res.StatusCode);
                }
            }
            catch (TaskCanceledException) { /* shutting down */ }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error polling external feed");
            }

            // poll every 800ms
            await Task.Delay(_pollMs, stoppingToken);
        }
    }
}

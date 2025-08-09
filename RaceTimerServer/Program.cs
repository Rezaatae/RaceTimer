using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Enable WebSockets
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120) // Keep the connection alive
};
app.UseWebSockets(webSocketOptions);

// Simulated race data
var raceStartTime = DateTime.UtcNow;

// Handle requests to WebSocket (/ws) 
app.Map("/ws", async context =>
{
    // if request is a WebSocket request, establish connection
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Client connected!");

        await SendRaceUpdates(webSocket, raceStartTime);

    }
    else
    {
        // else return 400 error
        context.Response.StatusCode = 400;
    }
});

app.Run();

static async Task SendRaceUpdates(WebSocket webSocket, DateTime startTime)
{
    // Empty container to hold incoming data from the WebSocket
    var buffer = new byte[1024 * 4];

    while (webSocket.State == WebSocketState.Open)
    {
        // Calculate race time
        var elapsed = DateTime.UtcNow - startTime;
        var message = $"Elapsed Time: {elapsed.Minutes:D2}:{elapsed.Seconds:D2}.{elapsed.Milliseconds:D3}";

        // Encode message to bytes
        var bytes = Encoding.UTF8.GetBytes(message);

        // Send to client
        await webSocket.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None);

        await Task.Delay(1000); // Update every second
    }
}
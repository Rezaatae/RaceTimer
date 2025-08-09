using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DI registrations
builder.Services.AddSingleton<WebSocketManager>();
builder.Services.AddHttpClient();
builder.Services.AddHostedService<PollingExternalFeed>();

var app = builder.Build();

// Enable WebSockets
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120) // Keep the connection alive
};
app.UseWebSockets(webSocketOptions);

// Map websocket endpoint
var wsManager = app.Services.GetRequiredService<WebSocketManager>();

// Handle requests to WebSocket (/ws) 
app.Map("/ws", async context =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    // establish connection with websocket and add it to list of clients
    using var socket = await context.WebSockets.AcceptWebSocketAsync();
    var id = wsManager.Add(socket);
    Console.WriteLine($"Client connected: {id}");

    // empty container to hold websocket data in
    var buffer = new byte[4 * 1024];
    
    // try recieving message from websocket
    try
    {
        // while websocket is open, recieve any messages
        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close) break;
        }
    }
    finally
    {
        await wsManager.RemoveAsync(id);
        Console.WriteLine($"Client disconnected: {id}");
    }
});

app.Run();
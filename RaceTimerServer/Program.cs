using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Enable WebSockets
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120) // Keep the connection alive
};
app.UseWebSockets(webSocketOptions);

// Handle requests to WebSocket (/ws) 
app.Map("/ws", async context =>
{
    // if request is a WebSocket request, establish connection
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Client connected!");

    }
    else
    {
        // else return 400 error
        context.Response.StatusCode = 400;
    }
});

app.Run();


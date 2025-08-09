using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

public class WebSocketManager
{
    // dictionary container to hold websocket clients in
    private readonly ConcurrentDictionary<string, WebSocket> _clients = new();

    // method to add a new websocket client
    public string Add(WebSocket socket)
    {
        var id = Guid.NewGuid().ToString();
        _clients.TryAdd(id, socket);
        return id;
    }

    // method to remove a websocket client
    public async Task RemoveAsync(string id)
    {
        if (_clients.TryRemove(id, out var ws))
        {
            try { await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "closing", CancellationToken.None); }
            catch { /* ignore */ }
        }
    }

    // method to broadcast data to all clients
    public async Task BroadcastAsync(string json)
    {
        var bytes = Encoding.UTF8.GetBytes(json);
        var tasks = _clients
            .Where(kv => kv.Value.State == WebSocketState.Open)
            .Select(kv => kv.Value.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None));
        await Task.WhenAll(tasks);
    }

    public int ClientCount => _clients.Count;
}
const socket = new WebSocket("ws://localhost:5281/ws");

socket.onopen = () => {
  console.log("Connected to server");
};

socket.onmessage = (evt) => {
  try {
    const msg = JSON.parse(evt.data);
    if (msg.type === 'lapUpdate' && Array.isArray(msg.updates)) {
      renderLeaderboard(msg.updates);
    } else {
      console.log('Unknown message', msg);
    }
  } catch (e) {
    // server may send a raw text message
    console.log('Raw message', evt.data);
  }
};

socket.onclose = () => console.log('Socket closed');
socket.onerror = (err) => console.error('Socket error', err);

function renderLeaderboard(updates) {
  // sort by position to be safe
  updates.sort((a, b) => a.position - b.position);

  const container = document.getElementById('race-data');
  const rows = updates.map(u => `
    <tr>
      <td>${u.position}</td>
      <td>${u.driverId} - ${escapeHtml(u.name)}</td>
      <td>${u.lap}</td>
      <td>${u.lapTime ? u.lapTime.toFixed(3) : '-'}</td>
      <td>${u.totalTime ? u.totalTime.toFixed(3) : '-'}</td>
    </tr>
  `).join('');
  container.innerHTML = `
    <table>
      <thead><tr><th>#</th><th>Driver</th><th>Lap</th><th>Lap Time (s)</th><th>Total (s)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(s) {
  return (s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

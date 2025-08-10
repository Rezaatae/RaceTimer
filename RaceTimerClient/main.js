const socket = new WebSocket("ws://localhost:5281/ws");
const problemObject ={}

socket.onopen = () => {
  console.log("Connected to server");
};

socket.onmessage = (evt) => {
  try {
    const msg = JSON.parse(evt.data);
    if (msg.type === 'lapUpdate' && Array.isArray(msg.updates)) {
        storeProblems(msg.updates)
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
  const tableBody = document.getElementById("race-table");
    tableBody.innerHTML = "";

    updates.forEach(u => {
        const row = document.createElement("tr");
        // Add Tailwind styles for hover/click
        row.className = "cursor-pointer hover:bg-gray-700 transition-colors";
        row.addEventListener("click", () => {
            const problemsJson = encodeURIComponent(JSON.stringify(u.problems || []));
            window.location.href = `driver.html?id=${encodeURIComponent(u.driverId)}&problems=${problemObject[u.driverId]}`;
        });
        row.innerHTML = `
            <td class="px-4 py-2">${u.position}</td>
            <td class="px-4 py-2">${u.driverId}</td>
            <td class="px-4 py-2">${u.lap}</td>
            <td class="px-4 py-2">${u.lapTime ? u.lapTime.toFixed(3) : '-'}</td>
            <td class="px-4 py-2">${u.totalTime ? u.totalTime.toFixed(3) : '-'}</td>
            <td class="px-4 py-2">${problemObject[u.driverId].length}</td>
        `;
        tableBody.appendChild(row);
    });
}

function storeProblems(updates) {
    updates.forEach(u => {
        if (problemObject[u.driverId]){
            problemObject[u.driverId].push(u.problems)
        } else{
            problemObject[u.driverId] = [u.problems]
        }
    });
}

function escapeHtml(s) {
  return (s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

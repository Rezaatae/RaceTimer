const socket = new WebSocket("ws://localhost:5281/ws");

const driverId = params.get('id');
const problemsStr = params.get('problems');

if (driverId) {
  // fetch driver stats from your server or mock data
  console.log('Show stats for', driverId);
}

socket.onmessage = (evt) => {
  try {
    const msg = JSON.parse(evt.data);
    if (msg.type === 'lapUpdate' && Array.isArray(msg.updates)) {
        renderDriverTable(msg.updates);
        renderProblemsTable(msg.updates);
    } else {
      console.log('Unknown message', msg);
    }
  } catch (e) {
    // server may send a raw text message
    console.log('Raw message', evt.data);
  }
};

function renderDriverTable(updates) {
    const tableBody = document.getElementById("driver-table");
    tableBody.innerHTML = "";
    updates.forEach(u => {
        if (u.driverId == driverId){
            const row = document.createElement("tr");
            row.innerHTML = `
            <td class="px-4 py-2">${u.lap}</td>
            <td class="px-4 py-2">${u.lapTime ? u.lapTime.toFixed(3) : '-'}</td>
            <td class="px-4 py-2">${u.totalTime ? u.totalTime.toFixed(3) : '-'}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function renderProblemsTable(updates) {
  const tableBody = document.getElementById("problems-table");
  tableBody.innerHTML = "";
  const localProbList = problemsStr.split(",");
  updates.forEach(u =>{
    if (u.driverId == driverId && u.problems){
        localProbList.push(u.problems)
        }
  })
  localProbList.forEach(problem => {
    if(problem){
        const row = document.createElement("tr");
        row.innerHTML = `
        <td class="px-4 py-2 border-b border-gray-600">${problem}</td>
        `;
        tableBody.appendChild(row);
    }
  });
}


socket.onclose = () => console.log('Socket closed');
socket.onerror = (err) => console.error('Socket error', err);

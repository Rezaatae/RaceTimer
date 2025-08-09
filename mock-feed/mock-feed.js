const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // so we can hit it from Postman/browser for testing

const PORT = process.env.PORT || 4000;

// Simple set of drivers
const drivers = [
  { id: 'VER', name: 'Max Verstappen', lap: 0, lastLapTime: 0, totalTime: 0 },
  { id: 'HAM', name: 'Lewis Hamilton', lap: 0, lastLapTime: 0, totalTime: 0 },
  { id: 'LEC', name: 'Charles Leclerc', lap: 0, lastLapTime: 0, totalTime: 0 },
  { id: 'PER', name: 'Sergio Perez', lap: 0, lastLapTime: 0, totalTime: 0 }
];


let lastSnapshot = makeSnapshot();

// realistic-ish lap time in seconds
function randomLapTime(base = 70, variance = 3) {
  return +(base + (Math.random() - 0.5) * variance).toFixed(3);
}

function updateState() {
  // pick 1-2 drivers to complete a lap per tick (simulate staggered laps)
  const numUpdates = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numUpdates; i++) {
    const d = drivers[Math.floor(Math.random() * drivers.length)];
    const lapTime = randomLapTime(70, 4);
    d.lap += 1;
    d.lastLapTime = lapTime;
    d.totalTime = +(d.totalTime + lapTime).toFixed(3);
  }
  // recompute positions by totalTime (lower totalTime => better position)
  drivers.sort((a, b) => a.totalTime - b.totalTime);
  const updates = drivers.map((d, idx) => ({
    driverId: d.id,
    name: d.name,
    lap: d.lap,
    lapTime: d.lastLapTime,
    totalTime: d.totalTime,
    position: idx + 1,
    timestamp: Date.now()
  }));

  lastSnapshot = { type: 'lapUpdate', updates };
}

// Takes snapshot of drivers statuses
function makeSnapshot() {
  const updates = drivers.map((d, idx) => ({
    driverId: d.id,
    name: d.name,
    lap: d.lap,
    lapTime: d.lastLapTime,
    totalTime: d.totalTime,
    position: idx + 1,
    timestamp: Date.now()
  }));
  return { type: 'lapUpdate', updates };
}

// Run updateState every 700ms
const TICK_MS = 700;
setInterval(updateState, TICK_MS);

// HTTP endpoints

// return current statuses
app.get('/current', (req, res) => {
  res.json(lastSnapshot);
});

// return driver names
app.get('/drivers', (req, res) => {
  res.json(drivers.map(d => ({ id: d.id, name: d.name })));
});

// endpoint health check
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Mock feed HTTP running on http://localhost:${PORT}`);
  console.log('Endpoints: GET /current  GET /drivers  GET /health');
});
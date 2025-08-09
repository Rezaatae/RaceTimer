const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // so we can hit it from Postman/browser for testing

const PORT = process.env.PORT || 4000;

// Simple set of drivers
const drivers = [
  { id: 'VER', name: 'Max Verstappen'},
  { id: 'HAM', name: 'Lewis Hamilton'},
  { id: 'LEC', name: 'Charles Leclerc'},
  { id: 'PER', name: 'Sergio Perez'}
];

// HTTP endpoints

// return driver names
app.get('/drivers', (req, res) => {
  res.json(drivers.map(d => ({ id: d.id, name: d.name })));
});

// endpoint health check
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Mock feed HTTP running on http://localhost:${PORT}`);
  console.log('Endpoints: GET /drivers  GET /health');
});
require('dns').setServers(['8.8.8.8','1.1.1.1']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/metrobus';

app.use(cors());
app.use(express.json());                 // read JSON request bodies
app.use(express.static('public'));       // serve the HTML/JS/CSS pages

// All bus endpoints live under /api/buses
app.use('/api/buses', require('./routes/buses'));

// Unknown API route -> JSON 404 (instead of an HTML page)
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected:', MONGO_URI);
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed. Is MongoDB running?\n', err.message);
    process.exit(1);
  });


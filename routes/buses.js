const router = require('express').Router();
const Bus = require('../models/Bus');

/* ---------- helpers ---------- */

// Catches errors from async handlers and turns them into clean JSON responses
const wrap = fn => (req, res) =>
  fn(req, res).catch(err => {
    if (err.code === 11000) return res.status(409).json({ error: 'A bus with this Bus_ID already exists' });
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });

// Case-insensitive "contains" match; escapes special regex characters typed by the user
const like = text => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const BUS_FIELDS = ['Bus_Name', 'Route', 'Departure', 'Destination', 'Travel_Date',
  'Departure_Time', 'Arrival_Time', 'Total_Seats', 'Available_Seats', 'Fare'];
const SCHEDULE_FIELDS = ['Travel_Date', 'Departure_Time', 'Arrival_Time'];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? { ...acc, [k]: obj[k] } : acc), {});

/* =====================================================
   BUS SEARCH   (GET)   -- keep these ABOVE '/:id'
   ===================================================== */

// 4. Find buses by route            GET /api/buses/search/route/Colombo
router.get('/search/route/:route', wrap(async (req, res) => {
  res.json(await Bus.find({ Route: like(req.params.route) }));
}));

// 5. Find buses by departure        GET /api/buses/search/departure/Colombo%20Fort
router.get('/search/departure/:location', wrap(async (req, res) => {
  res.json(await Bus.find({ Departure: like(req.params.location) }));
}));

// 6. Find buses by destination      GET /api/buses/search/destination/Makubura
router.get('/search/destination/:location', wrap(async (req, res) => {
  res.json(await Bus.find({ Destination: like(req.params.location) }));
}));

// 7. Find buses by travel date      GET /api/buses/search/date/2026-10-15
router.get('/search/date/:date', wrap(async (req, res) => {
  res.json(await Bus.find({ Travel_Date: req.params.date }));
}));

// 8. Find available buses           GET /api/buses/search/available
//    (optional: ?date=2026-10-15&departure=Colombo&destination=Kandy)
router.get('/search/available', wrap(async (req, res) => {
  const query = { Available_Seats: { $gt: 0 } };
  if (req.query.date) query.Travel_Date = req.query.date;
  if (req.query.departure) query.Departure = like(req.query.departure);
  if (req.query.destination) query.Destination = like(req.query.destination);
  res.json(await Bus.find(query));
}));

/* =====================================================
   BUS MANAGEMENT
   ===================================================== */

// 1. Insert a Metro Bus             POST /api/buses
router.post('/', wrap(async (req, res) => {
  const bus = await Bus.create(req.body);
  res.status(201).json(bus);
}));

// 2. Show all Metro Buses           GET /api/buses
router.get('/', wrap(async (req, res) => {
  res.json(await Bus.find().sort({ Travel_Date: 1, Departure_Time: 1 }));
}));

// 3. Find a Metro Bus by Bus ID     GET /api/buses/MB1001
router.get('/:id', wrap(async (req, res) => {
  const bus = await Bus.findOne({ Bus_ID: req.params.id });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
}));

// 10. Update Metro Bus Schedule     PUT /api/buses/MB1001/schedule
router.put('/:id/schedule', wrap(async (req, res) => {
  const bus = await Bus.findOne({ Bus_ID: req.params.id });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  Object.assign(bus, pick(req.body, SCHEDULE_FIELDS));
  await bus.save();                      // save() runs the schema validation
  res.json(bus);
}));

// 9. Update Metro Bus Details       PUT /api/buses/MB1001
router.put('/:id', wrap(async (req, res) => {
  const bus = await Bus.findOne({ Bus_ID: req.params.id });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  Object.assign(bus, pick(req.body, BUS_FIELDS));   // Bus_ID itself cannot be changed
  await bus.save();
  res.json(bus);
}));

// 11. Delete Metro Bus by Bus ID    DELETE /api/buses/MB1001
router.delete('/:id', wrap(async (req, res) => {
  const bus = await Bus.findOneAndDelete({ Bus_ID: req.params.id });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json({ message: `Bus ${req.params.id} deleted` });
}));

module.exports = router;

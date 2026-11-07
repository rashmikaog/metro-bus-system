require('dns').setServers(['8.8.8.8','1.1.1.1']);
// Run once:  npm run seed     (adds sample buses so you have data to test with)
const mongoose = require('mongoose');
const Bus = require('./models/Bus');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/metrobus';

const buses = [
  { Bus_ID: 'MB1001', Bus_Name: 'Metro Express', Route: 'Colombo - Makubura', Departure: 'Colombo Fort', Destination: 'Makubura', Travel_Date: '2026-10-15', Departure_Time: '07:30', Arrival_Time: '10:30', Total_Seats: 50, Available_Seats: 18, Fare: 850.0 },
  { Bus_ID: 'MB1002', Bus_Name: 'Metro Link',    Route: 'Colombo - Kandy',    Departure: 'Colombo Fort', Destination: 'Kandy',    Travel_Date: '2026-10-15', Departure_Time: '09:00', Arrival_Time: '12:30', Total_Seats: 45, Available_Seats: 0,  Fare: 1200.0 },
  { Bus_ID: 'MB1003', Bus_Name: 'City Rider',    Route: 'Colombo - Galle',    Departure: 'Pettah',       Destination: 'Galle',    Travel_Date: '2026-10-16', Departure_Time: '06:15', Arrival_Time: '09:00', Total_Seats: 40, Available_Seats: 25, Fare: 950.0 },
  { Bus_ID: 'MB1004', Bus_Name: 'Metro Express', Route: 'Colombo - Makubura', Departure: 'Colombo Fort', Destination: 'Makubura', Travel_Date: '2026-10-16', Departure_Time: '15:45', Arrival_Time: '18:45', Total_Seats: 50, Available_Seats: 42, Fare: 850.0 },
  { Bus_ID: 'MB1005', Bus_Name: 'Hill Country',  Route: 'Kandy - Nuwara Eliya', Departure: 'Kandy',      Destination: 'Nuwara Eliya', Travel_Date: '2026-10-17', Departure_Time: '08:00', Arrival_Time: '11:00', Total_Seats: 35, Available_Seats: 12, Fare: 700.0 }
];

(async () => {
  await mongoose.connect(MONGO_URI);
  await Bus.deleteMany({});
  await Bus.insertMany(buses);
  console.log(`Seeded ${buses.length} buses`);
  await mongoose.disconnect();
})().catch(err => { console.error(err.message); process.exit(1); });


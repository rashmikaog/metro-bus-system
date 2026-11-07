const mongoose = require('mongoose');

// Schema = the shape of one bus document (matches the Metro Bus Record Format)
const busSchema = new mongoose.Schema(
  {
    Bus_ID:         { type: String, required: true, unique: true, trim: true },
    Bus_Name:       { type: String, required: true, trim: true },
    Route:          { type: String, required: true, trim: true },
    Departure:      { type: String, required: true, trim: true },
    Destination:    { type: String, required: true, trim: true },
    Travel_Date:    { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Travel_Date must be YYYY-MM-DD'] },
    Departure_Time: { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'Departure_Time must be HH:MM'] },
    Arrival_Time:   { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'Arrival_Time must be HH:MM'] },
    Total_Seats:    { type: Number, required: true, min: 1 },
    Available_Seats: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) { return v <= this.Total_Seats; },
        message: 'Available_Seats cannot be more than Total_Seats'
      }
    },
    Fare:           { type: Number, required: true, min: 0 }
  },
  { versionKey: false }   // hides the internal "__v" field
);

// 3rd argument = collection name in MongoDB
module.exports = mongoose.model('Bus', busSchema, 'buses');
